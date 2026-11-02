import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = Number(id);
  if (!productId) return badRequest("Invalid product id.");

  const rows = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(asc(productVariants.price));
  return json({ variants: rows });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const { id } = await params;
  const productId = Number(id);
  if (!productId) return badRequest("Invalid product id.");

  const body = await readJson<{
    sizeLabel: string;
    frameType: string;
    frameLabel: string;
    price: number;
  }>(request);
  if (!body?.sizeLabel || !body?.frameType || !body?.frameLabel) {
    return badRequest("Size, frame type and frame label are required.");
  }
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) return badRequest("Enter a valid price.");

  try {
    const inserted = await db
      .insert(productVariants)
      .values({
        productId,
        sizeLabel: body.sizeLabel.trim(),
        frameType: body.frameType.trim(),
        frameLabel: body.frameLabel.trim(),
        price: Math.round(price),
      })
      .returning({ id: productVariants.id });
    return json({ ok: true, id: inserted[0].id });
  } catch (error) {
    console.error("variants POST", error);
    return serverError();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const variantId = Number(searchParams.get("variantId"));
  if (!Number(id) || !variantId) return badRequest("Product and variant ids are required.");
  try {
    await db
      .delete(productVariants)
      .where(eq(productVariants.id, variantId));
    return json({ ok: true });
  } catch (error) {
    console.error("variants DELETE", error);
    return serverError();
  }
}
