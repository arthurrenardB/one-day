import { NextResponse } from "next/server";
import { currentUser, startSession } from "@/lib/server/auth";
import { run } from "@/lib/server/db";
import { fulfillSession, stripe, stripeConfigured } from "@/lib/server/stripe";

export const runtime = "nodejs";

// Appelé par /merci au retour de Stripe : active la formule (le webhook le fait aussi)
// et connecte l'acheteur une seule fois, dans l'heure qui suit le paiement.
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!stripeConfigured() || !sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  const done = await fulfillSession(session);
  if (!done) return NextResponse.json({ ok: false }, { status: 402 });

  const me = await currentUser();
  const fresh = Date.now() - session.created * 1000 < 60 * 60_000;
  // Connexion auto uniquement pour un compte créé par cet achat : sinon, payer avec
  // l'email de quelqu'un d'autre donnerait accès à son compte.
  let loggedIn = !!me;
  if (!me && fresh && done.newAccount && !done.ent.autologin_used) {
    const res = await run("UPDATE entitlements SET autologin_used = 1 WHERE id = ? AND autologin_used = 0", [done.ent.id]);
    if (res.rowsAffected === 1) {
      await startSession(done.user.id);
      loggedIn = true;
    }
  }
  return NextResponse.json({ ok: true, plan: done.ent.plan, loggedIn, email: loggedIn ? undefined : done.user.email });
}
