"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/Brand";

// Étape de confirmation : le jeton n'est consommé qu'au clic (protège des scanners d'emails).
function VerifierInner() {
  const token = useSearchParams().get("token") ?? "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : "Lien incomplet.");

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.next) {
      window.location.href = d.next;
      return;
    }
    setError(d.error ?? "Lien invalide.");
    setBusy(false);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-6">
      <Logo />
      <div className="mt-16 w-full max-w-md text-center">
        <div className="sun-gradient mx-auto h-20 w-20 rounded-full shadow-[0_20px_60px_-10px_rgba(255,106,26,0.8)]" />
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">Content de te voir ☀️</h1>
        {error ? (
          <>
            <p className="mt-3 font-semibold text-rose">{error}</p>
            <Link href="/connexion" className="mt-6 inline-block rounded-2xl bg-ink px-6 py-3 font-bold text-cream">
              Recevoir un nouveau lien
            </Link>
          </>
        ) : (
          <button
            onClick={confirm}
            disabled={busy}
            className="mt-8 rounded-2xl bg-ink px-8 py-4 text-lg font-semibold tracking-tight text-cream shadow-soft disabled:opacity-60"
          >
            {busy ? "Connexion…" : "Me connecter"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifierPage() {
  return (
    <Suspense>
      <VerifierInner />
    </Suspense>
  );
}
