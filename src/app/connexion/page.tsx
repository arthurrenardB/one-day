"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/Brand";

function ConnexionInner() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError(null);
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, next }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d.error ?? "Erreur, réessaie.");
      setState("idle");
      return;
    }
    // Accès démo : déjà connecté côté serveur, on va directement à l'espace.
    if (d.loggedIn) {
      window.location.assign(d.next ?? "/app");
      return;
    }
    setDevLink(d.devLink ?? null);
    setState("sent");
  };

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-6">
      <Logo />
      <div className="mt-14 w-full max-w-md rounded-[28px] border border-black/10 bg-white p-7 shadow-soft">
        {state === "sent" ? (
          <>
            <p className="text-4xl">📬</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Regarde tes mails</h1>
            <p className="mt-2 text-muted">
              On a envoyé un lien de connexion à <strong className="text-ink">{email}</strong>. Il est valable 20 minutes.
            </p>
            {devLink && (
              <div className="mt-5 rounded-xl bg-gold/30 p-3 text-sm">
                <p className="font-bold">Mode dev (pas de clé Resend) :</p>
                <a href={devLink} className="break-all font-semibold text-sun underline">
                  Ouvrir le lien de connexion
                </a>
              </div>
            )}
            <button onClick={() => setState("idle")} className="mt-6 text-sm font-semibold text-muted underline">
              Utiliser un autre email
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Connexion</h1>
            <p className="mt-2 text-muted">Pas de mot de passe : on t&apos;envoie un lien magique par email. Pas encore de compte ? Il sera créé automatiquement.</p>
            <label htmlFor="email" className="mt-6 block text-sm font-bold">
              Ton email
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-medium outline-none focus:border-sun"
            />
            {error && <p className="mt-3 text-sm font-semibold text-rose">{error}</p>}
            <button disabled={state === "sending"} className="sun-gradient mt-5 w-full rounded-xl py-3.5 font-semibold tracking-tight text-white disabled:opacity-60">
              {state === "sending" ? "Envoi…" : "Recevoir mon lien"}
            </button>
            <p className="mt-4 text-center text-xs text-muted">
              En continuant, tu acceptes nos <a href="#" className="underline">CGU</a> et notre <a href="#" className="underline">politique de confidentialité</a>.
            </p>
          </form>
        )}
      </div>
      <Link href="/" className="mt-6 text-sm font-semibold text-muted hover:text-ink">
        ← Retour à l&apos;accueil
      </Link>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionInner />
    </Suspense>
  );
}
