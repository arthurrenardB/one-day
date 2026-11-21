"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/Brand";
import { DownsellModal, useExitIntent } from "@/components/Downsell";
import { PLANS, fmt, isPlanId, type PlanId } from "@/lib/plans";
import { useMe } from "@/lib/store";

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("plan");
  const planId: PlanId = isPlanId(raw) ? raw : "lifetime";
  const plan = PLANS[planId];
  const cancelled = params.get("annule") === "1";

  const me = useMe();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Retour d'une annulation de paiement : on propose direct le downsell.
  const [downsell, setDownsell] = useState(cancelled);
  const [leaveAfter, setLeaveAfter] = useState(false);
  // Intention de sortie passive (souris en haut / retour) : une fois par session.
  useExitIntent(true, () => {
    setLeaveAfter(false);
    setDownsell(true);
  });

  const total = plan.price;

  const pay = async () => {
    if (!me.user && !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Indique ton email pour recevoir ton accès.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Paiement indisponible");
      if (data.demo) router.push(data.url);
      else window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Logo />
        <button
          onClick={() => {
            setLeaveAfter(true);
            setDownsell(true);
          }}
          className="text-sm font-semibold text-muted hover:text-ink"
        >
          ← Changer de formule
        </button>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight tracking-tight">Presque fini ☀️</h1>
          <p className="mt-2 text-muted">Encore une étape et ta conv repart.</p>
          {cancelled && (
            <p className="mt-4 rounded-xl bg-gold/30 px-4 py-3 text-sm font-semibold">Paiement annulé. Aucun montant n&apos;a été débité.</p>
          )}

          {me.user ? (
            <p className="mt-8 rounded-xl border border-line bg-white px-4 py-3 text-sm">
              Connecté en tant que <strong>{me.user.email}</strong>
            </p>
          ) : (
            <>
              <label htmlFor="email" className="mt-8 block text-sm font-bold">
                Ton email <span className="font-medium text-muted">(ton accès One Day sera lié à cet email)</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.fr"
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-medium outline-none focus:border-sun"
              />
              <p className="mt-2 text-xs text-muted">
                Déjà un compte ?{" "}
                <Link href={`/connexion?next=${encodeURIComponent(`/checkout?plan=${planId}`)}`} className="font-semibold underline">
                  Connecte-toi
                </Link>
              </p>
            </>
          )}

          {false && (
            <Link
              href="/checkout?plan=lifetime"
              className="mt-8 flex items-center justify-between gap-4 rounded-2xl border-2 border-sun bg-sun/5 p-4 transition hover:bg-sun/10"
            >
              <span>
                <span className="block font-bold">{planId === "vip" ? "Juste l'illimité ?" : "Pour 8 € de plus : l'illimité à vie"}</span>
                <span className="block text-sm text-muted">Relances illimitées pour toujours, Taquin et rappels compris.</span>
              </span>
              <span className="shrink-0 font-display text-lg font-semibold tracking-tight text-sun">{fmt(PLANS.lifetime.price)}</span>
            </Link>
          )}
        </div>

        <div className="h-fit rounded-[28px] border border-black/10 bg-white p-6 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Récapitulatif</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight">{plan.name}</p>
              <p className="text-sm text-muted">{plan.pitch}</p>
            </div>
            <p className="flex items-baseline gap-1.5">
              {plan.compareAt && <span className="text-sm font-medium text-muted line-through">{fmt(plan.compareAt)}</span>}
              <span className="font-display text-xl font-semibold tracking-tight">{fmt(plan.price)}</span>
            </p>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2"><span className="text-sun">✓</span>{f}</li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t-2 border-ink pt-4">
            <span className="font-bold">Total aujourd&apos;hui</span>
            <span className="font-display text-3xl font-semibold tracking-tight">{fmt(Math.round(total * 100) / 100)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Paiement unique, aucun abonnement.
          </p>
          <button
            onClick={pay}
            disabled={busy}
            className="sun-gradient mt-6 w-full rounded-2xl py-4 text-lg font-semibold tracking-tight text-white transition hover:brightness-105 disabled:opacity-60"
          >
            {busy ? "Redirection…" : `Payer ${fmt(Math.round(total * 100) / 100)}`}
          </button>
          {error && <p className="mt-3 text-sm font-semibold text-rose">{error}</p>}
          <p className="mt-4 text-center text-xs font-semibold text-muted">🔒 Paiement sécurisé par Stripe · Carte, Apple Pay, Google Pay</p>
          <p className="mt-2 text-center text-[11px] text-muted">
            En payant, tu acceptes nos <a href="#" className="underline">CGV</a>. Accès immédiat : tu renonces au délai de rétractation dès le premier usage.
          </p>
        </div>
      </div>
      <DownsellModal
        open={downsell}
        onClose={() => {
          setDownsell(false);
          if (leaveAfter) router.push("/offres");
        }}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  );
}
