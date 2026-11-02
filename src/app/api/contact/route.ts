import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { badRequest, json, readJson, serverError } from "@/lib/api";
import { isEmail, validate } from "@/lib/utils";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson<Record<string, string>>(request);
  if (!body) return badRequest("Invalid request body.");

  const errors = validate(
    {
      name: body.name ?? "",
      email: body.email ?? "",
      message: body.message ?? "",
    },
    {
      name: { required: true, label: "Name" },
      email: {
        required: true,
        label: "Email address",
        test: isEmail,
        message: "Enter a valid email address.",
      },
      message: { required: true, label: "Message" },
    },
  );
  if (errors.length) return badRequest(errors[0].message, errors[0].field);

  try {
    await db.insert(contactMessages).values({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: (body.phone ?? "").trim(),
      subject: (body.subject ?? "").trim(),
      message: body.message.trim(),
    });

    await notify({
      kind: "contact_message",
      recipient: "studio@demproduction.ng",
      subject: `Website enquiry from ${body.name.trim()}`,
      body: `<p><strong>${body.name.trim()}</strong> (${body.email}) ${body.phone ?? ""}</p><p>${body.message.trim()}</p>`,
    });

    return json({ ok: true });
  } catch (error) {
    console.error("contact POST", error);
    return serverError();
  }
}
