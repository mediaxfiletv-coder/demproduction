import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { requireCustomer } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { isEmail, isPhone, validate } from "@/lib/utils";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await requireCustomer();
  if (!session) return unauthorized();

  const body = await readJson<Record<string, string>>(request);
  if (!body) return badRequest("Invalid request body.");

  const errors = validate(
    {
      fullName: body.fullName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
    },
    {
      fullName: { required: true, label: "Full name" },
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
    },
  );
  if (errors.length) return badRequest(errors[0].message, errors[0].field);

  try {
    const duplicate = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.email, body.email.trim().toLowerCase()))
      .limit(1);
    if (duplicate[0] && duplicate[0].id !== session.id) {
      return badRequest("That email is already in use.", "email");
    }

    await db
      .update(customers)
      .set({
        fullName: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        address: (body.address ?? "").trim(),
        city: (body.city ?? "").trim(),
        ...(body.password && body.password.length >= 8
          ? { passwordHash: hashPassword(body.password) }
          : {}),
      })
      .where(eq(customers.id, session.id));

    return json({ ok: true });
  } catch (error) {
    console.error("profile PATCH", error);
    return serverError();
  }
}

export async function GET() {
  const session = await requireCustomer();
  if (!session) return unauthorized();
  try {
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.id, session.id))
      .limit(1);
    if (!rows[0]) return unauthorized();
    const { passwordHash: _ignored, ...safe } = rows[0];
    return json({ customer: safe });
  } catch (error) {
    console.error("profile GET", error);
    return serverError();
  }
}
