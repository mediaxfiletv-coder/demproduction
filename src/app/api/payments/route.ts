import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { eventBookings, orders, payments } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { json, serverError, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return unauthorized();

  try {
    const rows =
      session.role === "admin"
        ? await db.select().from(payments).orderBy(desc(payments.createdAt))
        : await db
            .select()
            .from(payments)
            .where(eq(payments.customerId, session.id))
            .orderBy(desc(payments.createdAt));

    const orderIds = [...new Set(rows.map((row) => row.orderId).filter(Boolean))] as number[];
    const bookingIds = [...new Set(rows.map((row) => row.bookingId).filter(Boolean))] as number[];

    const orderRows = orderIds.length
      ? await db
          .select({ id: orders.id, orderNumber: orders.orderNumber })
          .from(orders)
          .where(inArray(orders.id, orderIds))
      : [];
    const bookingRows = bookingIds.length
      ? await db
          .select({ id: eventBookings.id, bookingRef: eventBookings.bookingRef })
          .from(eventBookings)
          .where(inArray(eventBookings.id, bookingIds))
      : [];

    return json({
      payments: rows.map((row) => ({
        ...row,
        orderNumber: orderRows.find((order) => order.id === row.orderId)?.orderNumber ?? null,
        bookingRef: bookingRows.find((booking) => booking.id === row.bookingId)?.bookingRef ?? null,
      })),
    });
  } catch (error) {
    console.error("payments GET", error);
    return serverError();
  }
}
