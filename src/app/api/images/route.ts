import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { badRequest, json, readJson, serverError, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  try {
    const rows = collection
      ? await db
          .select()
          .from(siteImages)
          .where(eq(siteImages.collection, collection))
          .orderBy(asc(siteImages.id))
      : await db.select().from(siteImages).orderBy(asc(siteImages.id));
    return json({ images: rows });
  } catch (error) {
    console.error("images GET", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const body = await readJson<{
    collection: string;
    category?: string;
    title?: string;
    imageUrl: string;
  }>(request);
  if (!body?.imageUrl || !body.collection) {
    return badRequest("Collection and image URL are required.");
  }
  try {
    const inserted = await db
      .insert(siteImages)
      .values({
        collection: body.collection,
        category: (body.category ?? "").trim(),
        title: (body.title ?? "").trim(),
        imageUrl: body.imageUrl,
      })
      .returning({ id: siteImages.id });
    return json({ ok: true, id: inserted[0].id });
  } catch (error) {
    console.error("images POST", error);
    return serverError();
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return badRequest("Image id is required.");
  try {
    await db.delete(siteImages).where(eq(siteImages.id, id));
    return json({ ok: true });
  } catch (error) {
    console.error("images DELETE", error);
    return serverError();
  }
}
