import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { PLANS, isPlanId } from "@/lib/plans";
import { currentUser, normalizeEmail, startSession, upsertUser } from "@/lib/server/auth";
import { grant } from "@/lib/server/entitlements";
import { demoPaymentsAllowed, stripe, stripeConfigured } from "@/lib/server/stripe";

export const runtime = "nodejs";

// Variables pour le vrai paiement :
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//   STRIPE_PRICE_PACK10, STRIPE_PRICE_LIFETIME, STRIPE_PRICE_VIP

const priceEnv = (id: string) => process.env[`STRIPE_PRICE_${id.toUpperCase()}`];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const planId = body?.plan;
  if (!isPlanId(planId)) return NextResponse.json({ error: "Formule inconnue." }, { status: 400 });
  // Downsell : accès à vie à prix réduit, réservé à l'offre « lifetime ».
  const downsell = body?.downsell === true && planId === "lifetime";

  const user = await currentUser();
  // Email facultatif : sans lui, Stripe le demande sur sa page de paiement.
  const email = user?.email ?? normalizeEmail(body?.email);

  const plan = PLANS[planId];
  const origin = process.env.APP_URL || req.headers.get("origin") || new URL(req.url).origin;

  if (!stripeConfigured()) {
    if (!demoPaymentsAllowed()) return NextResponse.json({ error: "Paiement indisponible." }, { status: 503 });
    if (!email) return NextResponse.json({ error: "Indique ton email pour recevoir ton accès." }, { status: 400 });
    // Mode démo (dev uniquement) : on active directement la formule.
    const { user: u, created } = user ? { user, created: false } : await upsertUser(email);
    await grant({ userId: u.id, plan: planId });
    void downsell;
    const loggedIn = !!user || created;
    if (!user && created) await startSession(u.id);
    return NextResponse.json({ demo: true, url: `/merci?plan=${planId}&demo=1${loggedIn ? "" : `&email=${encodeURIComponent(u.email)}`}` });
  }

  const planPrice = downsell ? priceEnv("lifetime_ds") || priceEnv(planId) : priceEnv(planId);
  if (!planPrice) return NextResponse.json({ error: `Prix Stripe manquant pour ${plan.name}.` }, { status: 500 });

  const isSub = plan.kind === "subscription";
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{ price: planPrice, quantity: 1 }];

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.create({
    mode: isSub ? "subscription" : "payment",
    line_items,
    ...(user?.stripe_customer_id ? { customer: user.stripe_customer_id } : email ? { customer_email: email } : {}),
    ...(isSub || user?.stripe_customer_id ? {} : { customer_creation: "always" as const }),
    client_reference_id: user?.id,
    allow_promotion_codes: true,
    locale: "fr",
    metadata: { plan: planId, downsell: downsell ? "1" : "" },
    success_url: `${origin}/merci?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?plan=${planId}&annule=1`,
    });
  } catch (e) {
    console.error("Stripe checkout", e);
    return NextResponse.json({ error: "Le paiement n'a pas pu démarrer. Réessaie dans un instant." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
