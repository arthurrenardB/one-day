import { NextResponse } from "next/server";
import { clientIp, createLoginToken, findOrCreateUser, isDemoEmail, normalizeEmail, safeRedirect, startSession } from "@/lib/server/auth";
import { emailConfigured, sendMagicLink } from "@/lib/server/email";
import { activeEntitlement, grant, isUnlimitedPlan } from "@/lib/server/entitlements";
import { limited } from "@/lib/server/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(body?.email);
  if (!email) return NextResponse.json({ error: "Email invalide." }, { status: 400 });

  const next = safeRedirect(body?.next);

  // Accès démo : connexion immédiate, sans e-mail, avec l'offre « À vie ».
  if (isDemoEmail(email)) {
    const user = await findOrCreateUser(email);
    if (!isUnlimitedPlan(await activeEntitlement(user.id))) {
      await grant({ userId: user.id, plan: "lifetime" });
    }
    await startSession(user.id);
    return NextResponse.json({ ok: true, loggedIn: true, next });
  }

  const ip = clientIp(req);
  if (limited(`login-ip:${ip}`, 10, 10 * 60_000) || limited(`login-mail:${email}`, 4, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop de demandes. Réessaie dans quelques minutes." }, { status: 429 });
  }

  const token = await createLoginToken(email, next);
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const link = `${origin}/connexion/verifier?token=${encodeURIComponent(token)}`;

  try {
    await sendMagicLink(email, link);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Impossible d'envoyer l'email pour le moment." }, { status: 502 });
  }

  const devLink = !emailConfigured() && process.env.NODE_ENV !== "production" ? link : undefined;
  return NextResponse.json({ ok: true, devLink });
}
