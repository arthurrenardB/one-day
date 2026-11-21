"use client";

import { useEffect, useState } from "react";
import { SOCIAL_PROOF } from "@/lib/site";

const APPS = ["Tinder", "Hinge", "Instagram", "Snapchat", "WhatsApp"];
const STATS = [
  { k: "3 relances", v: "en ~10 secondes" },
  { k: "5 applis", v: "les plus utilisées" },
  { k: "0 abonnement", v: "paiement unique" },
];

export function SocialProofBand() {
  const [live, setLive] = useState<number | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/stats", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setLive(typeof d.live === "number" ? d.live : null))
        .catch(() => {});
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-5xl rounded-[32px] bg-ink p-8 text-cream shadow-soft md:p-12">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="font-display text-[56px] font-semibold leading-none tracking-tight md:text-[72px]">
              +{SOCIAL_PROOF.count}
            </p>
            <p className="mt-2 text-lg text-cream/80">{SOCIAL_PROOF.label}</p>
            {live !== null && live >= 2 && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sun opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sun" />
                </span>
                {live} personnes l&apos;utilisent en ce moment
              </p>
            )}
          </div>

          <div>
            <div className="grid grid-cols-3 gap-3">
              {STATS.map((s) => (
                <div key={s.k} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                  <p className="font-display text-xl font-semibold tracking-tight">{s.k}</p>
                  <p className="mt-1 text-[13px] leading-snug text-cream/60">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/50">Fonctionne sur</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {APPS.map((a) => (
                  <span key={a} className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
