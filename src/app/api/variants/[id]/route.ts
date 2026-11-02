import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const body = await readJson<{
    id: number;
    sizeLabel?: string;
    frameType?: string;
    frameLabel?: string;
    price?: number;
    active?: boolean;
  }>(request);
  if (!body?.id) return badRequest("Variant id is required.");

  try {
    await db
      .update(productVariants)
      .set({
        ...(body.sizeLabel ? { sizeLabel: body.sizeLabel.trim() } : {}),
        ...(body.frameType ? { frameType: body.frameType.trim() } : {}),
        ...(body.frameLabel ? { frameLabel: body.frameLabel.trim() } : {}),
        ...(body.price !== undefined && Number.isFinite(Number(body.price))
          ? { price: Math.round(Number(body.price)) }
          : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      })
      .where(eq(productVariants.id, body.id));
    return json({ ok: true });
  } catch (error) {
    console.error("variant PATCH", error);
    return serverError();
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return badRequest("Variant id is required.");
  try {
    await db.delete(productVariants).where(eq(productVariants.id, id));
    return json({ ok: true });
  } catch (error) {
    console.error("variant DELETE", error);
    return serverError();
  }
}
