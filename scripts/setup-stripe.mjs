// Crée (ou retrouve) les produits/prix One Day, le webhook et le portail client dans Stripe.
// Usage : STRIPE_SECRET_KEY=sk_... SITE_URL=https://... node scripts/setup-stripe.mjs <fichier-sortie.json>
// Idempotent : relançable sans créer de doublons (prix repérés par lookup_key).
import Stripe from "stripe";
import { writeFileSync } from "node:fs";

const key = process.env.STRIPE_SECRET_KEY;
const site = process.env.SITE_URL;
const out = process.argv[2];
if (!key || !site || !out) throw new Error("STRIPE_SECRET_KEY, SITE_URL et un fichier de sortie sont requis");
const stripe = new Stripe(key);

const ITEMS = [
  { env: "LIFETIME", name: "One Day · À vie", amount: 290 },
  { env: "VIP", name: "One Day · VIP", amount: 3400 },
  { env: "LIFETIME_DS", name: "One Day · À vie (offre)", amount: 150 },
];
// Anciennes offres à désactiver dans Stripe (archivées, restaurables depuis le tableau de bord).
const RETIRED = ["conv", "soiree", "week", "month", "year", "profil", "accroches", "pack10"];

/** Archive l'ancien produit (et son prix si Stripe l'autorise). */
async function archive(price) {
  const productId = typeof price.product === "string" ? price.product : price.product.id;
  await stripe.products.update(productId, { active: false });
  await stripe.prices.update(price.id, { active: false }).catch(() => {});
}

const result = { prices: {}, webhookSecret: null, webhookId: null, portalId: null };

for (const it of ITEMS) {
  const lookup = `oneday_${it.env.toLowerCase()}`;
  const found = await stripe.prices.list({ lookup_keys: [lookup], active: true, limit: 1 });
  let price = found.data[0];
  if (price && (price.unit_amount !== it.amount || price.recurring)) {
    // Le prix a changé : nouveau prix (la clé de recherche lui est transférée), ancien archivé.
    const old = price;
    price = await stripe.prices.create({
      currency: "eur",
      unit_amount: it.amount,
      lookup_key: lookup,
      transfer_lookup_key: true,
      product_data: { name: it.name },
    });
    await archive(old);
    console.log(`remplacé ${it.name}`);
  } else if (!price) {
    price = await stripe.prices.create({
      currency: "eur",
      unit_amount: it.amount,
      lookup_key: lookup,
      product_data: { name: it.name },
    });
    console.log(`créé    ${it.name}`);
  } else console.log(`existant ${it.name}`);
  result.prices[it.env] = price.id;
}

const keep = new Set(Object.values(result.prices));
for await (const p of stripe.prices.list({ active: true, limit: 100, expand: ["data.product"] })) {
  const name = typeof p.product === "object" && "name" in p.product ? p.product.name : "";
  if (name.startsWith("One Day ·") && !p.lookup_key && !keep.has(p.id)) {
    await archive(p);
    console.log(`archivé  ${name} (${(p.unit_amount ?? 0) / 100} €)`);
  }
}

for (const r of RETIRED) {
  const found = await stripe.prices.list({ lookup_keys: [`oneday_${r}`], active: true, limit: 1 });
  for (const p of found.data) {
    await archive(p);
    console.log(`archivé  oneday_${r}`);
  }
}

const url = `${site.replace(/\/$/, "")}/api/stripe/webhook`;
const events = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "invoice.paid",
  "customer.subscription.deleted",
];
const existing = (await stripe.webhookEndpoints.list({ limit: 100 })).data.find((w) => w.url === url);
if (existing && process.env.RESET_WEBHOOK !== "1") {
  console.log(`webhook  déjà en place (${url})`);
} else {
  // Le secret n'est visible qu'à la création : on (re)crée l'endpoint.
  if (existing) await stripe.webhookEndpoints.del(existing.id);
  const wh = await stripe.webhookEndpoints.create({ url, enabled_events: events, description: "One Day" });
  result.webhookSecret = wh.secret;
  result.webhookId = wh.id;
  console.log(`webhook  créé ${url}`);
}

const portals = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
if (portals.data.length && process.env.RESET_PORTAL !== "1") {
  result.portalId = portals.data[0].id;
  console.log("portail  déjà configuré");
} else {
  const portal = await stripe.billingPortal.configurations.create({
    business_profile: { headline: "One Day · tes achats et factures" },
    default_return_url: `${site.replace(/\/$/, "")}/app`,
    features: {
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ["email"] },
    },
  });
  result.portalId = portal.id;
  console.log("portail  configuré");
}

writeFileSync(out, JSON.stringify(result, null, 2), { mode: 0o600 });
