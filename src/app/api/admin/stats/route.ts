import { desc } from "drizzle-orm";
import { db } from "@/db";
import {
  contactMessages,
  customers,
  eventBookings,
  movieEnquiries,
  orders,
  payments,
  photoSessions,
  products,
  productVariants,
  siteImages,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { json, serverError, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const [orderRows, bookingRows, enquiryRows, sessionRows, paymentRows, customerRows, productRows, messageRows, imageRows] =
      await Promise.all([
        db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200),
        db.select().from(eventBookings).orderBy(desc(eventBookings.createdAt)).limit(200),
        db.select().from(movieEnquiries).orderBy(desc(movieEnquiries.createdAt)).limit(200),
        db.select().from(photoSessions).orderBy(desc(photoSessions.createdAt)).limit(200),
        db.select().from(payments).orderBy(desc(payments.createdAt)).limit(200),
        db.select().from(customers).orderBy(desc(customers.createdAt)).limit(200),
        db.select().from(products).orderBy(desc(products.id)),
        db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200),
        db.select().from(siteImages).orderBy(desc(siteImages.id)),
      ]);

    const variantRows = await db.select().from(productVariants);

    const paidPayments = paymentRows.filter((row) => row.status === "success");
    const revenue = paidPayments.reduce((sum, row) => sum + row.amount, 0);
    const pendingRevenue = orderRows
      .filter((row) => row.paymentStatus !== "paid" && row.status !== "cancelled")
      .reduce((sum, row) => sum + row.total, 0);

    const byMonth = new Map<string, number>();
    for (const payment of paidPayments) {
      const date = payment.paidAt ?? payment.createdAt;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + payment.amount);
    }
    const monthly = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, amount]) => ({ month, amount }));

    return json({
      stats: {
        orders: orderRows.length,
        paidOrders: orderRows.filter((row) => row.paymentStatus === "paid").length,
        pendingOrders: orderRows.filter((row) => row.paymentStatus !== "paid").length,
        revenue,
        pendingRevenue,
        bookings: bookingRows.length,
        enquiries: enquiryRows.length,
        sessions: sessionRows.length,
        payments: paymentRows.length,
        successfulPayments: paidPayments.length,
        failedPayments: paymentRows.filter((row) => row.status === "failed").length,
        customers: customerRows.length,
        products: productRows.length,
        variants: variantRows.length,
        messages: messageRows.filter((row) => !row.handled).length,
        images: imageRows.length,
        monthly,
      },
      orders: orderRows,
      bookings: bookingRows,
      enquiries: enquiryRows,
      sessions: sessionRows,
      payments: paidPayments.concat(paymentRows.filter((row) => row.status !== "success")),
      customers: customerRows.map((row) => ({
        id: row.id,
        fullName: row.fullName,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        createdAt: row.createdAt,
      })),
      products: productRows.map((product) => ({
        ...product,
        variants: variantRows.filter((variant) => variant.productId === product.id),
      })),
      messages: messageRows,
      images: imageRows,
    });
  } catch (error) {
    console.error("admin stats", error);
    return serverError();
  }
}
