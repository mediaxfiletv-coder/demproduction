import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { admins, customers, sessions } from "@/db/schema";

const SESSION_COOKIE = "dem_session";
const SESSION_TTL_DAYS = 30;

/* ----------------------------- passwords ----------------------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

/* ------------------------------ sessions ----------------------------- */

function hashToken(token: string): string {
  return createHmac("sha256", "dem-production-session").update(token).digest("hex");
}

async function createSession(role: "customer" | "admin", id: number) {
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    token: hashToken(token),
    role,
    customerId: role === "customer" ? id : null,
    adminId: role === "admin" ? id : null,
    expiresAt,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}

export type SessionUser =
  | { role: "customer"; id: number; name: string; email: string }
  | { role: "admin"; id: number; name: string; email: string }
  | null;

export async function getSessionUser(): Promise<SessionUser> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const session = rows[0];
  if (!session) return null;
  if (session.role === "admin" && session.adminId) {
    const admin = await db.select().from(admins).where(eq(admins.id, session.adminId)).limit(1);
    if (admin[0]) {
      return { role: "admin", id: admin[0].id, name: admin[0].name, email: admin[0].email };
    }
  }
  if (session.role === "customer" && session.customerId) {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, session.customerId))
      .limit(1);
    if (customer[0]) {
      return {
        role: "customer",
        id: customer[0].id,
        name: customer[0].fullName,
        email: customer[0].email,
      };
    }
  }
  return null;
}

export async function loginCustomer(email: string, password: string) {
  const rows = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  const customer = rows[0];
  if (!customer || !verifyPassword(password, customer.passwordHash)) return null;
  await createSession("customer", customer.id);
  return customer;
}

export async function loginAdmin(email: string, password: string) {
  const rows = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  const admin = rows[0];
  if (!admin || !verifyPassword(password, admin.passwordHash)) return null;
  await createSession("admin", admin.id);
  return admin;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function requireCustomer() {
  const user = await getSessionUser();
  if (!user || user.role !== "customer") return null;
  return user;
}

export async function registerCustomer(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  city?: string;
}) {
  const existing = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, input.email))
    .limit(1);
  if (existing[0]) {
    return { ok: false as const, error: "An account with this email already exists." };
  }
  const inserted = await db
    .insert(customers)
    .values({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      address: input.address ?? "",
      city: input.city ?? "",
      passwordHash: hashPassword(input.password),
    })
    .returning({ id: customers.id });
  await createSession("customer", inserted[0].id);
  return { ok: true as const, id: inserted[0].id };
}
