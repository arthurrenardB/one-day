import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, setAdminCookie } from "@/lib/server/admin";
import { clientIp } from "@/lib/server/auth";
import { limited } from "@/lib/server/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "Admin non configuré (ADMIN_PASSWORD manquant)." }, { status: 503 });
  if (limited(`admin:${clientIp(req)}`, 8, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop d'essais. Réessaie plus tard." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(body?.password)) return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
