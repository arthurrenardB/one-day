import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { endSubscription, extendSubscription, fulfillSession, stripe, stripeConfigured } from "@/lib/server/stripe";

export const runtime = "nodejs";

// À déclarer dans Stripe > Développeurs > Webhooks : https://ton-domaine/api/stripe/webhook
// Évènements : checkout.session.completed, checkout.session.async_payment_succeeded,
//              invoice.paid, customer.subscription.deleted
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!stripeConfigured() || !secret || !sig) return NextResponse.json({ error: "non configuré" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await fulfillSession(event.data.object);
      break;
    case "invoice.paid":
      await extendSubscription(event.data.object);
      break;
    case "customer.subscription.deleted":
      await endSubscription(event.data.object);
      break;
  }
  return NextResponse.json({ received: true });
}
