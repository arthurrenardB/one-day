"use client";

import { useState } from "react";
import { PLANS, fmt } from "@/lib/plans";
import { SectionTitle } from "./Sections";

export function Referral() {
  const [members, setMembers] = useState(40);
  const [copied, setCopied] = useState(false);
  // Hypothèse : chaque membre prend l'offre À vie, commission de 30 %.
  const monthly = members * PLANS.lifetime.price * 0.3;
  const link = "oneday.app/i/TONCODE";

  return (
    <section id="parrainage" className="px-4 py-24">
      <SectionTitle kicker="Parrainage & créateurs" title={<>Fais tourner. <span className="sun-text">Gagne avec nous.</span></>} />
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-2">
        <div className="rounded-3xl border-2 border-line bg-white p-7">
          <p className="text-sm font-bold uppercase tracking-wider text-sun">Parrainage</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight">Un pote achète ? 5 relances offertes chacun.</p>
          <p className="mt-2 text-muted">Partage ton lien. Dès qu&apos;il prend une formule, vous recevez tous les deux 5 relances.</p>
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-black/10 bg-cream p-1.5 pl-4">
            <span className="flex-1 truncate font-mono text-sm">{link}</span>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`https://${link}`);
                } catch {}
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-cream"
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">Ton vrai lien apparaît dans ton espace après ta première formule.</p>
        </div>

        <div className="rounded-3xl bg-ink p-7 text-cream">
          <p className="text-sm font-bold uppercase tracking-wider text-gold">Programme créateurs</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight">Tu fais du TikTok ou de l&apos;Insta ? Touche 30 % de chaque vente.</p>
          <p className="mt-2 text-cream/70">30 % de chaque achat fait avec ton lien, VIP compris.</p>
          <label className="mt-6 block text-sm font-semibold" htmlFor="members">
            Membres ramenés par mois : <span className="text-gold">{members}</span>
          </label>
          <input
            id="members"
            type="range"
            min={5}
            max={500}
            step={5}
            value={members}
            onChange={(e) => setMembers(Number(e.target.value))}
            className="mt-2 w-full accent-[#FF6A1A]"
          />
          <p className="mt-4 font-display text-4xl font-semibold tracking-tight">
            {fmt(Math.round(monthly))}
            <span className="ml-2 text-base font-semibold text-cream/60">/ mois estimés</span>
          </p>
          <p className="mt-1 text-xs text-cream/50">Estimation sur la base de l&apos;offre À vie. Paiement mensuel, sans minimum.</p>
          <a href="mailto:createurs@oneday.app" className="sun-gradient mt-6 inline-block rounded-xl px-5 py-3 font-bold text-white">
            Devenir partenaire
          </a>
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl border border-black/10 bg-gold/30 p-8 md:flex-row md:items-center">
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight">Les 25 relances qui marchent le mieux.</p>
          <p className="mt-1 text-ink/70">Le guide offert, puis chaque dimanche les meilleures relances de la semaine.</p>
        </div>
        {done ? (
          <p className="font-bold">C&apos;est noté ☀️ Regarde ta boîte mail.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // TODO : brancher ton outil d'emailing (Brevo, Resend, Mailchimp…)
              if (/^\S+@\S+\.\S+$/.test(email)) setDone(true);
            }}
            className="flex w-full max-w-md gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              aria-label="Ton email"
              className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 font-medium outline-none focus:border-sun"
            />
            <button className="rounded-xl bg-ink px-5 py-3 font-bold text-cream">Recevoir</button>
          </form>
        )}
      </div>
    </section>
  );
}
