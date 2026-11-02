import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { badRequest, json, serverError } from "@/lib/api";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return badRequest("No file uploaded.");
    if (file.size <= 0) return badRequest("The selected file is empty.");
    if (file.size > MAX_BYTES) return badRequest("Image must be smaller than 12MB.");

    const extension = ALLOWED.get(file.type);
    if (!extension) {
      return badRequest("Only JPG, PNG, WEBP, AVIF or GIF images are allowed.");
    }

    const now = new Date();
    const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const relative = `/uploads/${folder}/${randomUUID()}${extension}`;
    const absolute = join(process.cwd(), "public", relative);

    await mkdir(join(process.cwd(), "public", "uploads", folder), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolute, buffer);

    return json({ ok: true, url: relative, name: file.name, size: file.size });
  } catch (error) {
    console.error("upload", error);
    return serverError("Upload failed. Please try again.");
  }
}
