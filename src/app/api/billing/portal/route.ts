import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { stripe, stripeConfigured } from "@/lib/server/stripe";

export const runtime = "nodejs";

// Portail client Stripe : résiliation, changement de carte, factures.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi." }, { status: 401 });
  if (!stripeConfigured()) return NextResponse.json({ error: "Paiements en mode démo : rien à gérer." }, { status: 400 });
  if (!user.stripe_customer_id) return NextResponse.json({ error: "Aucun abonnement trouvé." }, { status: 404 });
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const portal = await stripe().billingPortal.sessions.create({ customer: user.stripe_customer_id, return_url: `${origin}/app` });
  return NextResponse.json({ url: portal.url });
}
