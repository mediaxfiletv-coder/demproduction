import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, productVariants, products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";
import { isEmail, isPhone, randomReference, validate } from "@/lib/utils";
import { notify, orderConfirmationEmail } from "@/lib/notify";
import { formatNaira } from "@/lib/utils";

export const runtime = "nodejs";

type CartLine = {
  productId: number;
  variantId: number;
  quantity: number;
  uploadedImageUrl?: string;
};

/**
 * Creates an order from the customer's cart.
 *
 * Prices are ALWAYS re-read from the database on the server — the client is
 * never trusted for amounts.
 */
export async function POST(request: Request) {
  const body = await readJson<{
    items: CartLine[];
    customerName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
    notes?: string;
  }>(request);
  if (!body) return badRequest("Invalid request body.");

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return badRequest("Your cart is empty.");
  }

  const errors = validate(
    {
      customerName: body.customerName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      deliveryAddress: body.deliveryAddress ?? "",
    },
    {
      customerName: { required: true, label: "Full name" },
      email: {
        required: true,
        label: "Email address",
        test: isEmail,
        message: "Enter a valid email address.",
      },
      phone: {
        required: true,
        label: "Phone number",
        test: isPhone,
        message: "Enter a valid phone number.",
      },
      deliveryAddress: { required: true, label: "Delivery address" },
    },
  );
  if (errors.length) return badRequest(errors[0].message, errors[0].field);

  for (const line of body.items) {
    const qty = Number(line.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      return badRequest("Each item quantity must be between 1 and 50.");
    }
  }

  try {
    const variantIds = [...new Set(body.items.map((item) => Number(item.variantId)))];
    const variantRows = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));
    const productRows = await db
      .select()
      .from(products)
      .where(
        inArray(
          products.id,
          variantRows.map((variant) => variant.productId),
        ),
      );

    let subtotal = 0;
    const resolved = body.items.map((line) => {
      const variant = variantRows.find((row) => row.id === Number(line.variantId));
      if (!variant) {
        throw new Error(`Variant ${line.variantId} is no longer available.`);
      }
      const product = productRows.find((row) => row.id === variant.productId);
      if (!product || !product.active || !variant.active) {
        throw new Error(`${product?.name ?? "An item"} is no longer available.`);
      }
      const quantity = Number(line.quantity);
      const lineTotal = variant.price * quantity;
      subtotal += lineTotal;
      return {
        variant,
        product,
        quantity,
        lineTotal,
        uploadedImageUrl: (line.uploadedImageUrl ?? "").slice(0, 500),
      };
    });

    const session = await getSessionUser();
    const orderNumber = `DEM-${randomReference("ORD").split("-").slice(1).join("")}`;

    const inserted = await db
      .insert(orders)
      .values({
        orderNumber,
        customerId: session?.role === "customer" ? session.id : null,
        customerName: body.customerName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        deliveryAddress: body.deliveryAddress.trim(),
        notes: (body.notes ?? "").trim(),
        subtotal,
        total: subtotal,
        status: "pending",
        paymentStatus: "unpaid",
      })
      .returning({ id: orders.id });

    const orderId = inserted[0].id;

    await db.insert(orderItems).values(
      resolved.map((line) => ({
        orderId,
        productId: line.product.id,
        variantId: line.variant.id,
        productName: line.product.name,
        sizeLabel: line.variant.sizeLabel,
        frameLabel: line.variant.frameLabel,
        unitPrice: line.variant.price,
        quantity: line.quantity,
        lineTotal: line.lineTotal,
        uploadedImageUrl: line.uploadedImageUrl,
      })),
    );

    const email = orderConfirmationEmail({
      name: body.customerName.trim(),
      orderNumber,
      total: formatNaira(subtotal),
      items: resolved.map((line) => ({
        name: line.product.name,
        sizeLabel: line.variant.sizeLabel,
        frameLabel: line.variant.frameLabel,
        quantity: line.quantity,
        lineTotal: formatNaira(line.lineTotal),
      })),
      paymentStatus: "Awaiting payment",
    });
    await notify({
      kind: "order_confirmation",
      recipient: body.email.trim().toLowerCase(),
      ...email,
    });

    return json({ ok: true, orderNumber, total: subtotal, orderId });
  } catch (error) {
    console.error("orders POST", error);
    const message = error instanceof Error ? error.message : "Could not create your order.";
    return badRequest(message);
  }
}

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    const base =
      session.role === "admin"
        ? db.select().from(orders)
        : db.select().from(orders).where(eq(orders.customerId, session.id));

    const rows = (await base.orderBy(desc(orders.createdAt))) as typeof orders.$inferSelect[];
    const filtered = query
      ? rows.filter(
          (row) =>
            row.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
            row.email.toLowerCase().includes(query.toLowerCase()) ||
            row.customerName.toLowerCase().includes(query.toLowerCase()),
        )
      : rows;

    const items = filtered.length
      ? await db
          .select()
          .from(orderItems)
          .where(
            inArray(
              orderItems.orderId,
              filtered.map((row) => row.id),
            ),
          )
      : [];

    return json({
      orders: filtered.map((order) => ({
        ...order,
        items: items.filter((item) => item.orderId === order.id),
      })),
    });
  } catch (error) {
    console.error("orders GET", error);
    return serverError();
  }
}
