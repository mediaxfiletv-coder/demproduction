import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { badRequest, json, serverError, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const body = (await request.json().catch(() => null)) as { id?: number; handled?: boolean } | null;
  if (!body?.id) return badRequest("Message id is required.");
  try {
    await db
      .update(contactMessages)
      .set({ handled: body.handled ?? true })
      .where(eq(contactMessages.id, body.id));
    return json({ ok: true });
  } catch (error) {
    console.error("messages PATCH", error);
    return serverError();
  }
}
