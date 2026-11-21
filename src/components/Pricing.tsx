import Link from "next/link";
import { FEATURED, PLANS, PLAN_ORDER, fmt, type PlanId } from "@/lib/plans";

function Check({ light = false }: { light?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`mt-0.5 h-4 w-4 shrink-0 ${light ? "text-gold" : "text-sun"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export function PlanCard({ id }: { id: PlanId }) {
  const p = PLANS[id];
  const featured = id === FEATURED;
  return (
    <div
      className={`relative flex flex-col rounded-3xl border-2 p-6 transition ${
        featured
          ? "border-ink bg-ink text-cream shadow-soft md:-my-4 md:py-10"
          : "border-line bg-white hover:border-black/30"
      }`}
    >
      {p.badge && (
        <span className="sun-gradient absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold tracking-tight text-white">{p.badge}</span>
      )}
      <p className="font-display text-xl font-semibold tracking-tight">{p.name}</p>
      <p className={`mt-1 text-sm ${featured ? "text-cream/70" : "text-muted"}`}>{p.pitch}</p>
      <p className="mt-5 flex items-baseline gap-1.5">
        {p.compareAt && (
          <span className={`text-xl font-semibold line-through ${featured ? "text-cream/50" : "text-muted/70"}`}>{fmt(p.compareAt)}</span>
        )}
        <span className={`font-display font-semibold tracking-tight ${featured ? "text-5xl" : "text-4xl"}`}>{fmt(p.price)}</span>
        <span className={`text-sm font-semibold ${featured ? "text-cream/70" : "text-muted"}`}>{p.compareAt ? "offre de lancement" : p.period}</span>
      </p>
      {featured && <p className="text-sm font-semibold text-gold">Le prix d&apos;un cocktail, pour toujours.</p>}
      <ul className="mt-5 flex-1 space-y-2.5 text-[15px]">
        {p.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check light={featured} />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={`/checkout?plan=${id}`}
        className={`mt-6 rounded-xl py-3 text-center font-bold transition ${
          featured ? "sun-gradient text-white hover:brightness-105" : "bg-ink text-cream hover:bg-ink-2"
        }`}
      >
        {p.cta}
      </Link>
    </div>
  );
}

export function Pricing() {
  return (
    <div>
      <div className="mx-auto grid max-w-5xl items-center gap-5 md:grid-cols-3">
        {PLAN_ORDER.map((id) => (
          <PlanCard key={id} id={id} />
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-5xl">
        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border-2 border-dashed border-ink/25 bg-white/60 p-6 md:flex-row md:items-center">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              Pas sûr ? <span className="text-sun">L&apos;analyse de ta conv est gratuite</span>
            </p>
            <p className="text-sm text-muted">Colle son message : tu vois ton score de reprise avant de payer quoi que ce soit.</p>
          </div>
          <Link href="/#essayer" className="rounded-xl border border-black/10 px-5 py-2.5 font-bold hover:bg-ink hover:text-cream">
            Analyser ma conv
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-muted">
        <span>✓ Paiement unique, zéro abonnement</span>
        <span>✓ Paiement sécurisé · carte, Apple Pay, Google Pay</span>
        <span>✓ Captures supprimées après analyse</span>
      </div>
    </div>
  );
}
