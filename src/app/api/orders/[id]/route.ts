import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { badRequest, json, notFound, serverError, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

/** Public order lookup by order number (used for tracking & receipts). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSessionUser();

  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, id))
      .limit(1);
    const order = rows[0];
    if (!order) return notFound("Order not found.");
    if (session?.role !== "admin" && order.email !== session?.email) {
      return unauthorized("Please sign in with the email used for this order.");
    }
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    return json({ order: { ...order, items } });
  } catch (error) {
    console.error("order GET", error);
    return serverError();
  }
}

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"];

/** Admin: update order + payment status. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") return unauthorized();
  const { id } = await params;

  const body = (await request.json().catch(() => null)) as {
    status?: string;
    paymentStatus?: string;
  } | null;
  if (!body) return badRequest("Invalid request body.");

  if (body.status && !ORDER_STATUSES.includes(body.status)) {
    return badRequest("Unknown order status.");
  }
  if (body.paymentStatus && !PAYMENT_STATUSES.includes(body.paymentStatus)) {
    return badRequest("Unknown payment status.");
  }

  try {
    await db
      .update(orders)
      .set({
        ...(body.status ? { status: body.status } : {}),
        ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, Number(id)));
    return json({ ok: true });
  } catch (error) {
    console.error("order PATCH", error);
    return serverError();
  }
}
