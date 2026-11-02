import { eq } from "drizzle-orm";
import { db } from "@/db";
import { eventBookings, orders, payments } from "@/db/schema";
import { badRequest, json, serverError } from "@/lib/api";
import { verifyTransaction } from "@/lib/paystack";
import { formatNaira } from "@/lib/utils";
import { notify, paymentReceiptEmail } from "@/lib/notify";

export const runtime = "nodejs";

/**
 * Server-side transaction verification.
 * Paystack is the single source of truth — the client callback is never trusted.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  if (!reference) return badRequest("A payment reference is required.");

  try {
    const paymentRows = await db
      .select()
      .from(payments)
      .where(eq(payments.reference, reference))
      .limit(1);
    const payment = paymentRows[0];
    if (!payment) return badRequest("Unknown payment reference.");

    const result = await verifyTransaction(reference);

    if (result.ok && result.status === "success") {
      const paidAt = result.paidAt ? new Date(result.paidAt) : new Date();

      if (payment.status !== "success") {
        await db
          .update(payments)
          .set({
            status: "success",
            channel: result.channel,
            paidAt,
            meta: {
              ...(typeof payment.meta === "object" && payment.meta ? payment.meta : {}),
              verifiedAmount: result.amount,
              gateway: result.demo ? "demo" : "paystack",
            },
          })
          .where(eq(payments.id, payment.id));

        if (payment.orderId) {
          await db
            .update(orders)
            .set({ paymentStatus: "paid", status: "processing", updatedAt: new Date() })
            .where(eq(orders.id, payment.orderId));
        }
        if (payment.bookingId) {
          await db
            .update(eventBookings)
            .set({ paymentStatus: "paid", status: "confirmed", updatedAt: new Date() })
            .where(eq(eventBookings.id, payment.bookingId));
        }

        const receipt = paymentReceiptEmail({
          name: "Valued customer",
          reference,
          amount: formatNaira(result.amount || payment.amount),
          channel: result.channel,
        });
        await notify({
          kind: "payment_receipt",
          recipient: payment.email,
          ...receipt,
        });
      }

      return json({
        ok: true,
        status: "success",
        reference,
        amount: result.amount || payment.amount,
        channel: result.channel,
        paidAt,
        orderNumber: payment.orderId
          ? (
              await db
                .select({ orderNumber: orders.orderNumber })
                .from(orders)
                .where(eq(orders.id, payment.orderId))
                .limit(1)
            )[0]?.orderNumber
          : null,
        bookingRef: payment.bookingId
          ? (
              await db
                .select({ bookingRef: eventBookings.bookingRef })
                .from(eventBookings)
                .where(eq(eventBookings.id, payment.bookingId))
                .limit(1)
            )[0]?.bookingRef
          : null,
      });
    }

    if (result.ok && (result.status === "abandoned" || result.status === "failed")) {
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, payment.id));
      if (payment.orderId) {
        await db
          .update(orders)
          .set({ paymentStatus: "failed", updatedAt: new Date() })
          .where(eq(orders.id, payment.orderId));
      }
      return json({
        ok: true,
        status: "failed",
        reference,
        message: "The transaction was not completed. No money was deducted.",
      });
    }

    return json({
      ok: true,
      status: "pending",
      reference,
      message: result.message ?? "We are still confirming this transaction.",
    });
  } catch (error) {
    console.error("payments verify", error);
    return serverError("Verification failed. Please contact support with your reference.");
  }
}
