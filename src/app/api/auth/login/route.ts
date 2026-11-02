import { loginAdmin, loginCustomer } from "@/lib/auth";
import { badRequest, json, readJson, serverError } from "@/lib/api";
import { isEmail, validate } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson<Record<string, string>>(request);
  if (!body) return badRequest("Invalid request body.");

  const errors = validate(body, {
    email: { required: true, label: "Email address", test: isEmail, message: "Enter a valid email address." },
    password: { required: true, label: "Password" },
  });
  if (errors.length) return badRequest(errors[0].message, errors[0].field);

  try {
    const customer = await loginCustomer(body.email.trim().toLowerCase(), body.password);
    if (customer) {
      return json({ ok: true, role: "customer", name: customer.fullName });
    }
    const admin = await loginAdmin(body.email.trim().toLowerCase(), body.password);
    if (admin) {
      return json({ ok: true, role: "admin", name: admin.name });
    }
    return badRequest("Incorrect email or password.", "password");
  } catch (error) {
    console.error("login", error);
    return serverError();
  }
}
