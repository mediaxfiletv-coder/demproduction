import { destroySession, getSessionUser } from "@/lib/auth";
import { json } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return json({ user: null });
  return json({
    user: {
      role: user.role,
      name: user.name,
      email: user.email,
      id: user.id,
    },
  });
}

export async function POST() {
  await destroySession();
  return json({ ok: true });
}
