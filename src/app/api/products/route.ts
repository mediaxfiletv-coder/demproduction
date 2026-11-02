import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.id));
    const variantRows = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.active, true))
      .orderBy(asc(productVariants.price));

    const grouped = productRows.map((product) => ({
      ...product,
      variants: variantRows.filter((variant) => variant.productId === product.id),
    }));
    return json({ products: grouped });
  } catch (error) {
    console.error("products GET", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const body = await readJson<{
    name: string;
    description?: string;
    imageUrl?: string;
  }>(request);
  if (!body || !body.name?.trim()) return badRequest("Product name is required.");

  try {
    const base = slugify(body.name) || "product";
    const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const inserted = await db
      .insert(products)
      .values({
        name: body.name.trim(),
        slug,
        description: (body.description ?? "").trim(),
        imageUrl: (body.imageUrl ?? "").trim(),
      })
      .returning({ id: products.id });
    return json({ ok: true, id: inserted[0].id });
  } catch (error) {
    console.error("products POST", error);
    return serverError();
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  const body = await readJson<{
    id: number;
    name?: string;
    description?: string;
    imageUrl?: string;
    active?: boolean;
  }>(request);
  if (!body?.id) return badRequest("Product id is required.");

  try {
    await db
      .update(products)
      .set({
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      })
      .where(eq(products.id, body.id));
    return json({ ok: true });
  } catch (error) {
    console.error("products PATCH", error);
    return serverError();
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return badRequest("Product id is required.");
  try {
    await db.delete(products).where(eq(products.id, id));
    return json({ ok: true });
  } catch (error) {
    console.error("products DELETE", error);
    return serverError();
  }
}
