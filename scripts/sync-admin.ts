import { randomBytes, scryptSync } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { admins } from "../src/db/schema";

const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME ?? "Administrator";

function hashPassword(value: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}

async function main() {
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — nothing to sync.");
    return;
  }
  const existing = await db.select().from(admins);
  const match = existing.find((row) => row.email === email);
  if (match) {
    await db
      .update(admins)
      .set({ name, passwordHash: hashPassword(password) })
      .where(eq(admins.id, match.id));
    console.log(`admin credentials synced: ${email}`);
  } else {
    await db.insert(admins).values({ name, email, passwordHash: hashPassword(password) });
    console.log(`admin created: ${email}`);
  }
  const all = await db.select().from(admins);
  console.log("admins in database:", all.map((row) => row.email).join(", "));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
