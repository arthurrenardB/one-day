"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Brand";
import { Composer, ResultView, useRelance, type Input } from "@/components/Relance";
import { Funnel, PENDING_KEY } from "@/components/Funnel";
import { type Prefs, type RelanceResponse } from "@/lib/constants";
import { logout, planLabel, refresh, savePrefs, useMe, type HistoryItem } from "@/lib/store";

function Choice<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1 rounded-xl bg-sand p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-lg px-2 py-2.5 text-sm font-bold ${value === v ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Onboarding({ initial, onDone }: { initial: Prefs | null; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Prefs>(initial ?? { emojis: "parfois", majuscules: false, longueur: "court", prenom: "" });
  const steps = [
    {
      q: "Tu mets des émojis ?",
      body: (
        <Choice
          value={p.emojis}
          onChange={(v) => setP({ ...p, emojis: v })}
          options={[
            ["souvent", "Souvent 😄"],
            ["parfois", "Parfois"],
            ["jamais", "Jamais"],
          ]}
        />
      ),
    },
    {
      q: "Majuscules ou tout en minuscules ?",
      body: (
        <Choice
          value={p.majuscules ? "oui" : "non"}
          onChange={(v) => setP({ ...p, majuscules: v === "oui" })}
          options={[
            ["non", "tout en minuscules"],
            ["oui", "Avec Majuscules"],
          ]}
        />
      ),
    },
    {
      q: "Tes messages, plutôt…",
      body: (
        <Choice
          value={p.longueur}
          onChange={(v) => setP({ ...p, longueur: v })}
          options={[
            ["court", "Courts et punchy"],
            ["moyen", "Un peu plus longs"],
          ]}
        />
      ),
    },
    {
      q: "Comment tu t'appelles ? (optionnel)",
      body: (
        <input
          value={p.prenom ?? ""}
          onChange={(e) => setP({ ...p, prenom: e.target.value })}
          placeholder="Ton prénom"
          maxLength={40}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-medium outline-none focus:border-sun"
        />
      ),
    },
  ];
  const last = step === steps.length - 1;
  return (
    <div className="animate-rise rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-sun">Ton style · {step + 1}/{steps.length}</p>
        <button
          onClick={() => {
            if (!initial) savePrefs({ emojis: "parfois", majuscules: false, longueur: "court" });
            onDone();
          }}
          className="text-xs font-semibold text-muted underline"
        >
          Passer
        </button>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-sand">
        <div className="sun-gradient h-1.5 rounded-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <p className="mt-5 font-display text-2xl font-semibold tracking-tight">{steps[step].q}</p>
      <p className="mt-1 text-sm text-muted">One Day écrira comme toi. Tu pourras changer ça quand tu veux.</p>
      <div className="mt-5">{steps[step].body}</div>
      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="rounded-xl border-2 border-line px-4 py-3 font-bold">
            Retour
          </button>
        )}
        <button
          onClick={() => {
            if (last) {
              savePrefs({ ...p, prenom: p.prenom?.trim() || undefined });
              onDone();
            } else setStep(step + 1);
          }}
          className="sun-gradient flex-1 rounded-xl py-3 font-bold text-white"
        >
          {last ? "C'est moi ✓" : "Suivant"}
        </button>
      </div>
    </div>
  );
}

function HistoryRow({ h, onOpen }: { h: HistoryItem; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-sand">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">
          {h.result.contact_name || "Conv"} · « {h.input} »
        </span>
        <span className="block text-xs text-muted">
          {new Date(h.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          {h.reminderAt ? ` · ⏰ ${new Date(h.reminderAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </span>
      </span>
      <span className="rounded-full bg-sun/10 px-2 py-0.5 text-sm font-semibold tracking-tight text-sun">
        {h.result.score}%
      </span>
    </button>
  );
}

function ManageSubscription() {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <>
      <button
        onClick={async () => {
          setMsg(null);
          const res = await fetch("/api/billing/portal", { method: "POST" });
          const d = await res.json().catch(() => ({}));
          if (res.ok && d.url) window.location.href = d.url;
          else setMsg(d.error ?? "Indisponible pour le moment.");
        }}
        className="mt-3 block w-full rounded-xl border-2 border-line py-2.5 text-center text-sm font-bold hover:border-black/30"
      >
        Gérer / résilier mon abonnement
      </button>
      {msg && <p className="mt-2 text-xs font-semibold text-muted">{msg}</p>}
    </>
  );
}

export default function AppClient({ email, analyse }: { email: string; analyse?: string }) {
  const me = useMe();
  const flow = useRelance();
  const [editingStyle, setEditingStyle] = useState(false);
  const [context, setContext] = useState("");
  const [viewing, setViewing] = useState<HistoryItem | null>(null);
  const [funnel, setFunnel] = useState<Input | null>(null);
  const [opened, setOpened] = useState<RelanceResponse | null>(null);
  const [openErr, setOpenErr] = useState<string | null>(null);

  // Retour de paiement : on débloque l'analyse faite juste avant l'achat.
  useEffect(() => {
    if (!analyse) return;
    fetch(`/api/analyses/${encodeURIComponent(analyse)}/unlock`, { method: "POST" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Impossible d'ouvrir l'analyse.");
        setOpened(d);
        try {
          localStorage.removeItem(PENDING_KEY);
        } catch {}
        refresh();
        window.history.replaceState(null, "", "/app");
      })
      .catch((e) => setOpenErr(e.message));
  }, [analyse]);

  const prefs = me.user?.prefs ?? null;
  // Le style se règle à la demande (bouton « Modifier ») : il ne doit jamais cacher les relances.
  const showOnboarding = editingStyle;
  const unlimited = me.unlimited;
  const shown = viewing ? viewing.result : opened;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold sm:inline">{planLabel(me)}</span>
            {!unlimited && (
              <Link href="/offres" className="sun-gradient rounded-xl px-3 py-2 text-sm font-bold text-white">
                Passer en illimité
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0 space-y-6">
          {showOnboarding ? (
            <Onboarding initial={prefs} onDone={() => setEditingStyle(false)} />
          ) : (
            <>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight tracking-tight md:text-4xl">
                  {prefs?.prenom ? `Salut ${prefs.prenom} ☀️` : "Quelle conv on réchauffe ?"}
                </h1>
                <p className="mt-1 text-muted">Colle son dernier message ou dépose une capture de la conv.</p>
              </div>
              <Composer
                size="md"
                cta="Analyser"
                onSubmit={(i) => {
                  setViewing(null);
                  setFunnel(i);
                }}
              />
              <details className="rounded-2xl border border-line bg-white p-4">
                <summary className="cursor-pointer text-sm font-bold">+ Ajouter du contexte (optionnel)</summary>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  maxLength={600}
                  rows={3}
                  placeholder="Ex : on a matché il y a 2 semaines, elle adore l'escalade, on devait se voir samedi…"
                  className="mt-3 w-full rounded-xl border border-line bg-cream/50 p-3 text-sm outline-none focus:border-sun"
                />
              </details>

              <div className="overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-black/[0.04]">
                {openErr && !viewing && <p className="p-6 text-center font-medium text-rose">{openErr}</p>}
                {shown ? (
                  <ResultView r={shown} flow={flow} historyId={viewing?.id ?? opened?.id ?? null} />
                ) : (
                  !openErr && (
                    <div className="px-6 py-14 text-center">
                      <p className="text-5xl">💬</p>
                      <p className="mt-3 text-xl font-semibold tracking-tight">Tes relances apparaîtront ici.</p>
                      <p className="mt-1 text-sm text-muted">Astuce : colle aussi une capture, One Day lira toute la conv.</p>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-line bg-white p-5">
            <p className="font-display text-lg font-semibold tracking-tight">Mon compte</p>
            <p className="mt-1 truncate text-sm text-muted">{email}</p>
            <p className="mt-3 text-sm font-bold">{me.loaded ? planLabel(me) : "…"}</p>
            {!unlimited && (
              <Link href="/offres" className="mt-4 block rounded-xl bg-ink py-2.5 text-center text-sm font-bold text-cream">
                Voir les formules
              </Link>
            )}
            {me.plan?.subscription && <ManageSubscription />}
            <button onClick={logout} className="mt-3 text-xs font-semibold text-muted underline">
              Se déconnecter
            </button>
          </div>
          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold tracking-tight">Mon style</p>
              <button onClick={() => setEditingStyle(true)} className="text-sm font-bold text-sun">
                Modifier
              </button>
            </div>
            {prefs ? (
              <ul className="mt-3 space-y-1.5 text-sm font-semibold">
                <li className="flex justify-between"><span className="text-muted">Émojis</span>{prefs.emojis}</li>
                <li className="flex justify-between"><span className="text-muted">Majuscules</span>{prefs.majuscules ? "oui" : "non"}</li>
                <li className="flex justify-between"><span className="text-muted">Longueur</span>{prefs.longueur}</li>
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Pas encore réglé.</p>
            )}
          </div>
          <div className="rounded-3xl border border-line bg-white p-3">
            <p className="px-2 pt-2 font-display text-lg font-semibold tracking-tight">Mes convs</p>
            {me.history.length === 0 ? (
              <p className="px-2 pb-3 pt-1 text-sm text-muted">Aucune pour l&apos;instant.</p>
            ) : (
              <div className="mt-1 max-h-[420px] overflow-y-auto">
                {me.history.map((h) => (
                  <HistoryRow key={h.id} h={h} onOpen={() => setViewing(h)} />
                ))}
              </div>
            )}
          </div>
          <div className="rounded-3xl bg-ink p-5 text-cream">
            <p className="font-display text-lg font-semibold tracking-tight">Invite un pote</p>
            <p className="mt-1 text-sm text-cream/70">5 relances offertes chacun dès qu&apos;il achète.</p>
            {me.user?.referralCode && (
              <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 font-mono text-sm">oneday.app/i/{me.user.referralCode}</p>
            )}
          </div>
        </aside>
      </main>
      {funnel && (
        <Funnel
          input={funnel}
          context={context}
          onClose={() => {
            setFunnel(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
