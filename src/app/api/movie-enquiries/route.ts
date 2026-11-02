import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { movieEnquiries } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";
import { isEmail, isPhone, randomReference, validate } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { MOVIE_SERVICES } from "@/lib/catalog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson<Record<string, string>>(request);
  if (!body) return badRequest("Invalid request body.");

  const errors = validate(
    {
      serviceKey: body.serviceKey ?? "",
      customerName: body.customerName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      projectBrief: body.projectBrief ?? "",
    },
    {
      serviceKey: { required: true, label: "Service" },
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
      projectBrief: { required: true, label: "Project brief" },
    },
  );
  if (errors.length) return badRequest(errors[0].message, errors[0].field);

  const service = MOVIE_SERVICES.find((item) => item.key === body.serviceKey.trim());
  if (!service) return badRequest("Please choose a valid production service.");

  try {
    const session = await getSessionUser();
    const enquiryRef = `DEM-MV-${randomReference("EN").split("-").slice(1).join("")}`;
    await db.insert(movieEnquiries).values({
      enquiryRef,
      serviceKey: service.key,
      serviceName: service.name,
      price: service.price,
      customerName: body.customerName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      projectBrief: body.projectBrief.trim(),
      preferredDate: (body.preferredDate ?? "").trim(),
      customerId: session?.role === "customer" ? session.id : null,
    });

    await notify({
      kind: "movie_enquiry",
      recipient: body.email.trim().toLowerCase(),
      subject: `Production enquiry ${enquiryRef} received — DEM PRODUCTION`,
      body: `<p>Hi ${body.customerName.trim()}, your enquiry for <strong>${service.name}</strong> has been received.</p><p>Reference: ${enquiryRef}</p><p>Our production team will respond within 24 hours.</p>`,
    });

    return json({ ok: true, enquiryRef, serviceName: service.name });
  } catch (error) {
    console.error("movie enquiries POST", error);
    return serverError();
  }
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return unauthorized();
  try {
    const rows =
      session.role === "admin"
        ? await db.select().from(movieEnquiries).orderBy(desc(movieEnquiries.createdAt))
        : await db
            .select()
            .from(movieEnquiries)
            .where(eq(movieEnquiries.customerId, session.id))
            .orderBy(desc(movieEnquiries.createdAt));
    return json({ enquiries: rows });
  } catch (error) {
    console.error("movie enquiries GET", error);
    return serverError();
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") return unauthorized();
  const body = await readJson<{ id: number; status?: string }>(request);
  if (!body?.id) return badRequest("Enquiry id is required.");
  try {
    await db
      .update(movieEnquiries)
      .set({ ...(body.status ? { status: body.status } : {}) })
      .where(eq(movieEnquiries.id, body.id));
    return json({ ok: true });
  } catch (error) {
    console.error("movie enquiries PATCH", error);
    return serverError();
  }
}
