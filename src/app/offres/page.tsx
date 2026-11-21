"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Faq } from "@/components/landing/Sections";
import { PLANS, fmt, type PlanId } from "@/lib/plans";

// Liste du paywall : l'offre chère en premier pour ancrer le prix, « À vie » présélectionnée.
const ORDER: PlanId[] = ["lifetime", "vip"];

type V = boolean | string;
const COMPARE: { label: string; free: V; pack10: V; lifetime: V; vip: V }[] = [
  { label: "Relances", free: "1", pack10: "10", lifetime: "Illimité", vip: "Illimité" },
  { label: "Analyse de la conv + chances de réponse", free: true, pack10: true, lifetime: true, vip: true },
  { label: "Lecture des captures", free: true, pack10: true, lifetime: true, vip: true },
  { label: "Tons Drôle, Cash, Tendre", free: true, pack10: true, lifetime: true, vip: true },
  { label: "Ton Taquin", free: false, pack10: false, lifetime: true, vip: true },
  { label: "Rappels au bon moment", free: false, pack10: false, lifetime: true, vip: true },
  { label: "Audit de ton profil", free: false, pack10: false, lifetime: false, vip: true },
  { label: "100 premières phrases", free: false, pack10: false, lifetime: false, vip: true },
  { label: "Support prioritaire", free: false, pack10: false, lifetime: false, vip: true },
];

function Cell({ v }: { v: V }) {
  if (typeof v === "string") return <span className="font-bold">{v}</span>;
  return v ? <span className="font-bold text-sun">✓</span> : <span className="text-muted/50">—</span>;
}

export default function OffresPage() {
  const [sel, setSel] = useState<PlanId>("lifetime");
  const plan = PLANS[sel];

  return (
    <>
      <Nav />
      <main className="px-4 pb-20 pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-semibold tracking-tight uppercase tracking-[0.18em] text-sun">Passe la seconde</p>
              <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight leading-[1] tracking-tight md:text-6xl">
                Plus aucune conv
                <br />
                <span className="sun-text">ne meurt en silence.</span>
              </h1>
              <ul className="mt-8 space-y-4 text-lg">
                {[
                  ["☀️", "Des relances illimitées sur toutes tes applis"],
                  ["🎭", "Les 4 tons, Taquin compris"],
                  ["⏰", "Un rappel pile au bon moment"],
                  ["🧠", "Ton style mémorisé, ça sonne comme toi"],
                  ["🚪", "Quand c'est fini, on te le dit franchement"],
                ].map(([e, t]) => (
                  <li key={t} className="flex items-center gap-3 font-semibold">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl ring-1 ring-line">{e}</span>
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-8 rounded-2xl bg-gold/25 p-4 text-sm font-semibold">
                💸 Paiement unique : pas d&apos;abonnement, pas de prélèvement surprise, rien à résilier.
              </p>
            </div>

            <div className="rounded-[32px] border border-black/10 bg-white p-5 shadow-soft md:p-7">
              <p className="font-display text-2xl font-semibold tracking-tight">Choisis ta formule</p>
              <p className="text-sm text-muted">Paiement unique · Sans abonnement</p>

              <div className="mt-6 space-y-3" role="radiogroup" aria-label="Formules">
                {ORDER.map((id) => {
                  const p = PLANS[id];
                  const active = sel === id;
                  return (
                    <button
                      key={id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSel(id)}
                      className={`relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                        active ? "border-sun bg-sun/5" : "border-line hover:border-black/30/40"
                      }`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${active ? "border-sun" : "border-line"}`}>
                        {active && <span className="sun-gradient h-3 w-3 rounded-full" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold tracking-tight">
                          {p.name}
                          {p.badge && (
                            <span className="sun-gradient rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-tight text-white">
                              {p.badge}
                            </span>
                          )}
                        </span>
                        <span className="block text-sm text-muted">{p.pitch}</span>
                      </span>
                      <span className="text-right">
                        <span className="flex items-baseline justify-end gap-1.5">
                          {p.compareAt && <span className="text-sm font-medium text-muted line-through">{fmt(p.compareAt)}</span>}
                          <span className="font-display text-xl font-semibold tracking-tight">{fmt(p.price)}</span>
                        </span>
                        <span className="block text-xs font-semibold text-muted">{p.compareAt ? "offre de lancement" : p.period}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <Link
                href={`/checkout?plan=${sel}`}
                className="sun-gradient sticky bottom-3 z-10 mt-6 block rounded-2xl py-4 lg:static text-center text-lg font-semibold tracking-tight text-white shadow-[0_12px_30px_-12px_rgba(255,106,26,0.9)] transition hover:brightness-105"
              >
                Continuer · {fmt(plan.price)}
              </Link>
              <p className="mt-3 text-center text-xs text-muted">
                Paiement unique, aucun renouvellement.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-semibold text-muted">
                <span>🔒 Paiement sécurisé</span>
                <span>Carte · Apple Pay · Google Pay</span>
              </div>
            </div>
          </div>

          <div className="mt-20 overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-0 overflow-hidden rounded-3xl border-2 border-line bg-white text-left">
              <thead>
                <tr className="bg-sand/70">
                  <th className="p-4 font-display text-lg font-semibold tracking-tight">Ce qui est inclus</th>
                  <th className="p-4 text-center text-sm font-bold">Gratuit</th>
                  <th className="p-4 text-center text-sm font-bold text-sun">À vie</th>
                  <th className="p-4 text-center text-sm font-bold">VIP</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.label} className="border-t border-line">
                    <td className="border-t border-line p-4 font-semibold">{r.label}</td>
                    <td className="border-t border-line p-4 text-center"><Cell v={r.free} /></td>
                    <td className="border-t border-line bg-sun/5 p-4 text-center"><Cell v={r.lifetime} /></td>
                    <td className="border-t border-line p-4 text-center"><Cell v={r.vip} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Faq />
      </main>
      <Footer />
    </>
  );
}
