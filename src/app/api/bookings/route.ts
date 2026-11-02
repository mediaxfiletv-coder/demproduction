import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { eventBookings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";
import { isDate, isEmail, isPhone, randomReference, validate } from "@/lib/utils";
import { bookingConfirmationEmail, notify } from "@/lib/notify";
import { EVENT_PACKAGES } from "@/lib/catalog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson<Record<string, string>>(request);
  if (!body) return badRequest("Invalid request body.");

  const errors = validate(
    {
      packageCode: body.packageCode ?? "",
      customerName: body.customerName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      eventDate: body.eventDate ?? "",
      venue: body.venue ?? "",
    },
    {
      packageCode: { required: true, label: "Package" },
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
      eventDate: {
        required: true,
        label: "Event date",
        test: isDate,
        message: "Select a valid event date.",
      },
      venue: { required: true, label: "Venue" },
    },
  );
  if (errors.length) return badRequest(errors[0].message, errors[0].field);

  const pkg = EVENT_PACKAGES.find((item) => item.code === body.packageCode.trim().toUpperCase());
  if (!pkg) return badRequest("Please choose a valid coverage package.");

  try {
    const session = await getSessionUser();
    const bookingRef = `DEM-EV-${randomReference("BK").split("-").slice(1).join("")}`;
    await db.insert(eventBookings).values({
      bookingRef,
      packageCode: pkg.code,
      packageName: `Package ${pkg.code} — ${pkg.name}`,
      price: pkg.price,
      customerName: body.customerName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      eventType: (body.eventType ?? "").trim(),
      eventDate: body.eventDate.trim(),
      venue: body.venue.trim(),
      notes: (body.notes ?? "").trim(),
      customerId: session?.role === "customer" ? session.id : null,
    });

    await notify({
      kind: "booking_confirmation",
      recipient: body.email.trim().toLowerCase(),
      ...bookingConfirmationEmail({
        name: body.customerName.trim(),
        reference: bookingRef,
        title: `Package ${pkg.code} — ${pkg.name}`,
        date: body.eventDate,
        venue: body.venue,
      }),
    });

    return json({ ok: true, bookingRef, packageName: `Package ${pkg.code} — ${pkg.name}` });
  } catch (error) {
    console.error("bookings POST", error);
    return serverError();
  }
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return unauthorized();

  try {
    const rows =
      session.role === "admin"
        ? await db.select().from(eventBookings).orderBy(desc(eventBookings.createdAt))
        : await db
            .select()
            .from(eventBookings)
            .where(eq(eventBookings.customerId, session.id))
            .orderBy(desc(eventBookings.createdAt));
    return json({ bookings: rows });
  } catch (error) {
    console.error("bookings GET", error);
    return serverError();
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") return unauthorized();

  const body = await readJson<{ id: number; status?: string; paymentStatus?: string }>(request);
  if (!body?.id) return badRequest("Booking id is required.");

  try {
    await db
      .update(eventBookings)
      .set({
        ...(body.status ? { status: body.status } : {}),
        ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
        updatedAt: new Date(),
      })
      .where(eq(eventBookings.id, body.id));
    return json({ ok: true });
  } catch (error) {
    console.error("bookings PATCH", error);
    return serverError();
  }
}
