"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/Brand";
import { PLANS, isPlanId } from "@/lib/plans";
import { refresh } from "@/lib/store";
import { PENDING_KEY } from "@/components/Funnel";

function MerciInner() {
  const params = useSearchParams();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [needLogin, setNeedLogin] = useState<string | null>(null);
  const raw = params.get("plan");
  const planId = isPlanId(raw) ? raw : null;
  const sessionId = params.get("session_id");
  const demo = params.get("demo") === "1";

  const state: "checking" | "ok" | "fail" = !planId
    ? "fail"
    : demo
      ? "ok"
      : !sessionId
        ? "fail"
        : verified === null
          ? "checking"
          : verified
            ? "ok"
            : "fail";

  const demoEmail = params.get("email");
  // Analyse faite avant l'achat : on l'ouvre directement dans l'espace membre.
  const appHref = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const id = localStorage.getItem(PENDING_KEY);
        return id ? `/app?analyse=${encodeURIComponent(id)}` : "/app";
      } catch {
        return "/app";
      }
    },
    () => "/app",
  );
  const loginEmail = demo ? demoEmail : needLogin;

  useEffect(() => {
    if (!planId || demo || !sessionId) {
      refresh();
      return;
    }
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => {
        const ok = d.ok && isPlanId(d.plan);
        if (ok && !d.loggedIn && d.email) setNeedLogin(d.email);
        setVerified(!!ok);
        refresh();
      })
      .catch(() => setVerified(false));
  }, [planId, sessionId, demo]);

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-6">
      <Logo />
      <div className="mt-16 w-full max-w-md text-center">
        {state === "checking" && <p className="font-semibold text-muted">On vérifie ton paiement…</p>}
        {state === "ok" && planId && (
          <>
            <div className="sun-gradient mx-auto h-24 w-24 rounded-full shadow-[0_20px_60px_-10px_rgba(255,106,26,0.8)]" />
            <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">C&apos;est parti ☀️</h1>
            <p className="mt-3 text-lg text-muted">
              Ta formule <strong className="text-ink">{PLANS[planId].name}</strong> est active.
              {demo && " (mode démo, aucun paiement réel)"}
            </p>
            {loginEmail ? (
              <>
                <p className="mt-4 rounded-xl bg-gold/30 p-3 text-sm font-semibold">
                  Un compte existe déjà pour {loginEmail}. Connecte-toi avec le lien envoyé par email pour en profiter.
                </p>
                <Link
                  href={`/connexion?email=${encodeURIComponent(loginEmail)}`}
                  className="mt-6 inline-block rounded-2xl bg-ink px-7 py-4 text-lg font-semibold tracking-tight text-cream shadow-soft"
                >
                  Me connecter
                </Link>
              </>
            ) : (
              <Link href={appHref} className="mt-8 inline-block rounded-2xl bg-ink px-7 py-4 text-lg font-semibold tracking-tight text-cream shadow-soft">
                Voir mes relances
              </Link>
            )}
          </>
        )}
        {state === "fail" && (
          <>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Paiement non confirmé</h1>
            <p className="mt-3 text-muted">Si tu as été débité, écris-nous à contact@oneday.app avec ton reçu.</p>
            <Link href="/offres" className="mt-6 inline-block font-bold text-sun underline">
              Revenir aux formules
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function MerciPage() {
  return (
    <Suspense>
      <MerciInner />
    </Suspense>
  );
}
