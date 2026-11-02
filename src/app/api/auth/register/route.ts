import { registerCustomer } from "@/lib/auth";
import { badRequest, json, readJson, serverError } from "@/lib/api";
import { isEmail, isPhone, validate } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson<Record<string, string>>(request);
  if (!body) return badRequest("Invalid request body.");

  const errors = validate(body, {
    fullName: { required: true, label: "Full name" },
    email: { required: true, label: "Email address", test: isEmail, message: "Enter a valid email address." },
    phone: { required: true, label: "Phone number", test: isPhone, message: "Enter a valid phone number." },
    password: { required: true, label: "Password" },
  });
  if (errors.length) return badRequest(errors[0].message, errors[0].field);

  if (body.password.length < 8) {
    return badRequest("Password must be at least 8 characters.", "password");
  }

  try {
    const result = await registerCustomer({
      fullName: body.fullName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      password: body.password ?? "",
      address: (body.address ?? "").trim(),
      city: (body.city ?? "").trim(),
    });
    if (!result.ok) return badRequest(result.error, "email");
    return json({ ok: true, id: result.id });
  } catch (error) {
    console.error("register", error);
    return serverError();
  }
}
