"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/Brand";

export const dynamic = "force-dynamic";

type Stats = {
  live: number;
  uniques: number;
  views: number;
  today: number;
  days: { d: string; c: number }[];
  pages: { path: string; c: number }[];
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (res.ok) {
      setAuthed(true);
      setStats(await res.json());
    }
  }, []);

  useEffect(() => {
    // Chargement initial (setState se fait après l'await du fetch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    if (authed !== true) return;
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [authed, load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(d.error ?? "Erreur.");
      return;
    }
    setPassword("");
    load();
  };

  if (authed === null) return <div className="min-h-dvh bg-cream" />;

  if (authed === false) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-4">
        <Logo />
        <form onSubmit={login} className="mt-8 w-full max-w-sm rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-black/[0.05]">
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted">Accès réservé.</p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="mt-5 w-full rounded-xl bg-cream px-4 py-3 font-medium outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-ink/20"
          />
          {error && <p className="mt-3 text-sm font-medium text-rose">{error}</p>}
          <button disabled={busy} className="mt-5 w-full rounded-full bg-ink py-3 font-semibold text-cream disabled:opacity-60">
            {busy ? "…" : "Entrer"}
          </button>
        </form>
      </div>
    );
  }

  const maxDay = Math.max(1, ...(stats?.days.map((x) => x.c) ?? [1]));

  return (
    <div className="min-h-dvh bg-cream px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Tableau de bord</span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            label="En direct"
            value={stats?.live ?? 0}
            accent
            sub={
              <span className="flex items-center gap-1.5 text-sm font-medium text-sun">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sun opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sun" />
                </span>
                maintenant
              </span>
            }
          />
          <Card label="Visiteurs (24 h)" value={stats?.today ?? 0} />
          <Card label="Visiteurs (total)" value={stats?.uniques ?? 0} />
          <Card label="Pages vues" value={stats?.views ?? 0} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/[0.04]">
            <p className="text-sm font-semibold">Visiteurs uniques · 7 derniers jours</p>
            <div className="mt-6 flex h-40 items-end gap-2">
              {(stats?.days ?? []).length === 0 && <p className="text-sm text-muted">Pas encore de données.</p>}
              {stats?.days.map((x) => (
                <div key={x.d} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-ink">{x.c}</span>
                  <div className="w-full rounded-t-lg bg-ink" style={{ height: `${(x.c / maxDay) * 120}px`, minHeight: 4 }} />
                  <span className="text-[10px] text-muted">{x.d.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/[0.04]">
            <p className="text-sm font-semibold">Pages les plus vues</p>
            <ul className="mt-4 space-y-2.5">
              {(stats?.pages ?? []).map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink/80">{p.path}</span>
                  <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-xs font-semibold">{p.c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted">Mise à jour automatique toutes les 5 s · « en direct » = actifs ces 45 dernières secondes.</p>
      </div>
    </div>
  );
}

function Card({ label, value, sub, accent }: { label: string; value: number; sub?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-3xl p-6 shadow-soft ring-1 ring-black/[0.04] ${accent ? "bg-ink text-cream" : "bg-white"}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${accent ? "text-cream/60" : "text-muted"}`}>{label}</p>
      <p className="mt-2 text-[44px] font-semibold leading-none tracking-tight">{value.toLocaleString("fr-FR")}</p>
      <div className="mt-2 h-5">{sub}</div>
    </div>
  );
}
