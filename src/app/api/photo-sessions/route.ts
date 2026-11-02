import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { photoSessions } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";
import { isDate, isEmail, isPhone, randomReference, validate } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { PHOTO_SESSIONS } from "@/lib/catalog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson<Record<string, string>>(request);
  if (!body) return badRequest("Invalid request body.");

  const errors = validate(
    {
      sessionType: body.sessionType ?? "",
      customerName: body.customerName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      sessionDate: body.sessionDate ?? "",
    },
    {
      sessionType: { required: true, label: "Session type" },
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
      sessionDate: {
        required: true,
        label: "Session date",
        test: isDate,
        message: "Select a valid session date.",
      },
    },
  );
  if (errors.length) return badRequest(errors[0].message, errors[0].field);

  try {
    const session = await getSessionUser();
    const sessionRef = `DEM-PS-${randomReference("SS").split("-").slice(1).join("")}`;
    await db.insert(photoSessions).values({
      sessionRef,
      sessionType: body.sessionType.trim(),
      customerName: body.customerName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      sessionDate: body.sessionDate.trim(),
      location: (body.location ?? "").trim(),
      notes: (body.notes ?? "").trim(),
      customerId: session?.role === "customer" ? session.id : null,
    });

    await notify({
      kind: "photo_session",
      recipient: body.email.trim().toLowerCase(),
      subject: `Photo session ${sessionRef} booked — DEM PRODUCTION`,
      body: `<p>Hi ${body.customerName.trim()}, your <strong>${body.sessionType}</strong> session is booked.</p><p>Reference: ${sessionRef}</p><p>Date: ${body.sessionDate}</p><p>Our studio team will confirm your slot shortly.</p>`,
    });

    return json({ ok: true, sessionRef });
  } catch (error) {
    console.error("photo sessions POST", error);
    return serverError();
  }
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return unauthorized();
  try {
    const rows =
      session.role === "admin"
        ? await db.select().from(photoSessions).orderBy(desc(photoSessions.createdAt))
        : await db
            .select()
            .from(photoSessions)
            .where(eq(photoSessions.customerId, session.id))
            .orderBy(desc(photoSessions.createdAt));
    return json({ sessions: rows });
  } catch (error) {
    console.error("photo sessions GET", error);
    return serverError();
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") return unauthorized();
  const body = await readJson<{ id: number; status?: string }>(request);
  if (!body?.id) return badRequest("Session id is required.");
  try {
    await db
      .update(photoSessions)
      .set({ ...(body.status ? { status: body.status } : {}) })
      .where(eq(photoSessions.id, body.id));
    return json({ ok: true });
  } catch (error) {
    console.error("photo sessions PATCH", error);
    return serverError();
  }
}
