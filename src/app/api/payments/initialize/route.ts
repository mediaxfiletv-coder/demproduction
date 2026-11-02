import { eq } from "drizzle-orm";
import { db } from "@/db";
import { eventBookings, orders, payments } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { badRequest, json, readJson, serverError } from "@/lib/api";
import { initializeTransaction, isDemoMode } from "@/lib/paystack";
import { isEmail, randomReference } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Securely initialises a Paystack transaction on the server.
 * The secret key never leaves the server environment.
 */
export async function POST(request: Request) {
  const body = await readJson<{
    orderNumber?: string;
    bookingRef?: string;
    email: string;
  }>(request);
  if (!body) return badRequest("Invalid request body.");
  if (!body.email || !isEmail(body.email)) return badRequest("A valid email is required.");

  try {
    let amount = 0;
    let orderId: number | null = null;
    let bookingId: number | null = null;
    let label = "";

    if (body.orderNumber) {
      const rows = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, body.orderNumber))
        .limit(1);
      const order = rows[0];
      if (!order) return badRequest("Order not found.");
      if (order.paymentStatus === "paid") {
        return badRequest("This order has already been paid for.");
      }
      amount = order.total;
      orderId = order.id;
      label = `Order ${order.orderNumber}`;
    } else if (body.bookingRef) {
      const rows = await db
        .select()
        .from(eventBookings)
        .where(eq(eventBookings.bookingRef, body.bookingRef))
        .limit(1);
      const booking = rows[0];
      if (!booking) return badRequest("Booking not found.");
      if (booking.paymentStatus === "paid") {
        return badRequest("This booking deposit has already been paid.");
      }
      amount = booking.price;
      bookingId = booking.id;
      label = `Booking ${booking.bookingRef} (${booking.packageName})`;
    } else {
      return badRequest("An order or booking reference is required.");
    }

    const session = await getSessionUser();
    const reference = randomReference("DEMPAY");

    const origin = new URL(request.url).origin;
    const callbackUrl = `${origin}/payment/callback?reference=${encodeURIComponent(reference)}`;

    const result = await initializeTransaction({
      email: body.email.trim().toLowerCase(),
      amount,
      reference,
      callbackUrl,
      metadata: {
        orderNumber: body.orderNumber ?? null,
        bookingRef: body.bookingRef ?? null,
        label,
        custom_fields: [
          {
            display_name: "Reference",
            variable_name: "dem_reference",
            value: reference,
          },
        ],
      },
    });

    if (!result.ok) {
      return badRequest(result.message ?? "Payment could not be started.");
    }

    await db.insert(payments).values({
      reference,
      orderId,
      bookingId,
      customerId: session?.role === "customer" ? session.id : null,
      email: body.email.trim().toLowerCase(),
      amount,
      status: "pending",
      meta: { label, demo: result.demo },
    });

    return json({
      ok: true,
      reference,
      authorizationUrl: result.authorizationUrl,
      demo: result.demo,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
      demoMode: isDemoMode(),
    });
  } catch (error) {
    console.error("payments initialize", error);
    return serverError("Could not start the payment. Please try again.");
  }
}
