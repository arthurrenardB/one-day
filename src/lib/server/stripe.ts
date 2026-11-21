import "server-only";
import Stripe from "stripe";
import { isPlanId } from "../plans";
import { normalizeEmail, upsertUser, type User } from "./auth";
import { one, run } from "./db";
import { grant, type Entitlement } from "./entitlements";

export const stripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

/** Paiement simulé autorisé : en dev, ou si DEMO_PAYMENTS=1 explicitement. */
export const demoPaymentsAllowed = () =>
  !stripeConfigured() && (process.env.NODE_ENV !== "production" || process.env.DEMO_PAYMENTS === "1");

let _stripe: Stripe | null = null;
export function stripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

/** Active la formule correspondant à une session Checkout payée. Idempotent. */
export async function fulfillSession(
  session: Stripe.Checkout.Session,
): Promise<{ user: User; ent: Entitlement; newAccount: boolean } | null> {
  const paid =
    session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
  const plan = session.metadata?.plan;
  if (!paid || !isPlanId(plan)) return null;

  let user: User | null = null;
  let newAccount = false;
  if (session.client_reference_id) {
    user = await one<User>("SELECT * FROM users WHERE id = ?", [session.client_reference_id]);
  }
  if (!user) {
    const email = normalizeEmail(session.customer_details?.email ?? session.customer_email);
    if (!email) return null;
    ({ user } = await upsertUser(email));
    // Compte « neuf » = créé au plus tôt au moment de cette session de paiement.
    newAccount = Number(user.created_at) >= session.created * 1000 - 5_000;
  }

  const customer = idOf(session.customer);
  if (customer && user.stripe_customer_id !== customer) {
    await run("UPDATE users SET stripe_customer_id = ? WHERE id = ?", [customer, user.id]);
    user = { ...user, stripe_customer_id: customer };
  }

  const ent = await grant({
    userId: user.id,
    plan,
    stripeSessionId: session.id,
    stripeSubscriptionId: idOf(session.subscription),
  });
  return { user, ent, newAccount };
}

/** Renouvellement : prolonge l'accès jusqu'à la fin de la période payée (+1 jour de marge). */
export async function extendSubscription(invoice: Stripe.Invoice) {
  const sub = idOf(invoice.parent?.subscription_details?.subscription);
  if (!sub) return;
  const end = Math.max(0, ...invoice.lines.data.map((l) => l.period?.end ?? 0));
  if (!end) return;
  await run("UPDATE entitlements SET expires_at = ? WHERE stripe_subscription_id = ?", [end * 1000 + 86_400_000, sub]);
}

/** Abonnement terminé (résilié ou impayé). */
export async function endSubscription(sub: Stripe.Subscription) {
  const at = (sub.ended_at ?? Math.floor(Date.now() / 1000)) * 1000;
  await run("UPDATE entitlements SET expires_at = MIN(COALESCE(expires_at, ?), ?) WHERE stripe_subscription_id = ?", [at, at, sub.id]);
}
