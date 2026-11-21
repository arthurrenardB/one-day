"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  DELAYS,
  GOAL_LABEL,
  RELATIONS,
  TONE_LABEL,
  type Answers,
  type Delay,
  type Goal,
  type Relation,
  type RelanceResponse,
  type Tone,
} from "@/lib/constants";
import { FEATURED, PLANS, fmt, type PlanId } from "@/lib/plans";
import { SOCIAL_PROOF } from "@/lib/site";
import { refresh, useMe } from "@/lib/store";
import { SunMark } from "./Brand";
import { ResultView, WeatherCard, useRelance, type Input } from "./Relance";
import { DownsellModal, useExitIntent } from "./Downsell";

export const PENDING_KEY = "oneday:pending-analysis";

type Q<K extends keyof Answers> = {
  key: K;
  title: string;
  hint: string;
  options: { value: Answers[K]; label: string; emoji: string }[];
};

const QUESTIONS: [Q<"relation">, Q<"goal">, Q<"delay">, Q<"tone">] = [
  {
    key: "relation",
    title: "C'est qui pour toi ?",
    hint: "On n'écrit pas pareil à un match et à un ex.",
    options: (Object.keys(RELATIONS) as Relation[]).map((k, i) => ({
      value: k,
      label: RELATIONS[k],
      emoji: ["💬", "🍸", "👀", "💔"][i],
    })),
  },
  {
    key: "goal",
    title: "Ton objectif avec ce message ?",
    hint: "One Day oriente les relances vers ce que tu veux vraiment.",
    options: (["relancer", "date", "numero", "lien"] as Goal[]).map((k, i) => ({
      value: k,
      label: GOAL_LABEL[k],
      emoji: ["🔥", "📅", "📱", "🤝"][i],
    })),
  },
  {
    key: "delay",
    title: "Ça fait combien de temps sans réponse ?",
    hint: "Le timing change tout : trop tôt, trop tard…",
    options: (Object.keys(DELAYS) as Delay[]).map((k, i) => ({
      value: k,
      label: DELAYS[k],
      emoji: ["⏱️", "📆", "🗓️", "🧊"][i],
    })),
  },
  {
    key: "tone",
    title: "Comment tu veux sonner ?",
    hint: "Tu pourras changer de ton ensuite.",
    options: [
      { value: "drole", label: TONE_LABEL.drole, emoji: "😂" },
      { value: "cash", label: `${TONE_LABEL.cash}, je propose un truc`, emoji: "🎯" },
      { value: "tendre", label: `${TONE_LABEL.tendre} et attentionné`, emoji: "🫶" },
      { value: "mix", label: "Laisse One Day choisir", emoji: "✨" },
    ] as { value: Tone | "mix"; label: string; emoji: string }[],
  },
];

const STEPS = ["Je lis la conversation", "Je mesure son intérêt", "Je choisis le bon angle", "J'écris tes 3 relances"];

type Phase = "questions" | "analysing" | "result" | "error";

export function Funnel({ input, onClose, context }: { input: Input; onClose: () => void; context?: string }) {
  const me = useMe();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [phase, setPhase] = useState<Phase>("questions");
  const [result, setResult] = useState<RelanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [downsell, setDownsell] = useState(false);
  const flow = useRelance();

  // Downsell à l'intention de sortie, une fois le paywall atteint (sans compte payant).
  useExitIntent(phase === "result" && !!result?.teaser && !me.plan, () => setDownsell(true));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Animation de l'analyse.
  useEffect(() => {
    if (phase !== "analysing") return;
    const t = setInterval(() => setTick((x) => Math.min(x + 1, STEPS.length)), 900);
    return () => clearInterval(t);
  }, [phase]);
  const ready = phase === "analysing" && !!result && tick >= STEPS.length;

  const analyse = async (a: Answers) => {
    setPhase("analysing");
    setTick(0);
    setError(null);
    try {
      const res = await fetch("/api/relance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.message, image: input.image ?? undefined, answers: a, context: context || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      setResult(data);
      if (data.teaser && data.id) {
        try {
          localStorage.setItem(PENDING_KEY, data.id);
        } catch {}
      }
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setPhase("error");
    }
  };

  const choose = (value: string) => {
    const q = QUESTIONS[step];
    const next = { ...answers, [q.key]: value } as Partial<Answers>;
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else analyse(next as Answers);
  };

  const progress = phase === "questions" ? (step + 1) / (QUESTIONS.length + 2) : phase === "result" ? 1 : (QUESTIONS.length + 1) / (QUESTIONS.length + 2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cream" role="dialog" aria-modal="true" aria-label="Analyse de ta conversation">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 pb-10 pt-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => (phase === "questions" && step > 0 ? setStep(step - 1) : onClose())}
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft transition active:scale-95"
            aria-label={phase === "questions" && step > 0 ? "Question précédente" : "Fermer"}
          >
            {phase === "questions" && step > 0 ? (
              <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden>
                <path d="M8 2 2 8l6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <SunMark className="h-6 w-6" /> one day
          </span>
          <span className="w-10" />
        </div>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-black/[0.06]">
          <div className="ease-spring h-full rounded-full bg-ink transition-all duration-700" style={{ width: `${progress * 100}%` }} />
        </div>

        {phase === "questions" && (
          <div key={step} className="reveal mt-10 flex flex-1 flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Question {step + 1} sur {QUESTIONS.length}
            </p>
            <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-tight">{QUESTIONS[step].title}</h2>
            <p className="mt-2 text-muted">{QUESTIONS[step].hint}</p>
            <div className="mt-8 space-y-3">
              {QUESTIONS[step].options.map((o) => {
                const selected = answers[QUESTIONS[step].key] === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => choose(o.value)}
                    className={`ease-spring flex w-full items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left text-[16px] font-medium shadow-soft ring-1 transition duration-300 hover:-translate-y-0.5 active:scale-[0.99] ${
                      selected ? "ring-2 ring-ink" : "ring-black/[0.04]"
                    }`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-xl">{o.emoji}</span>
                    {o.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-auto pt-8">
              <p className="text-center text-xs text-muted">
                Message analysé : <span className="font-medium text-ink">« {input.message || "ta capture d'écran"} »</span>
              </p>
            </div>
          </div>
        )}

        {phase === "analysing" && (
          <div className="reveal mt-12 flex flex-1 flex-col">
            <h2 className="text-[30px] font-semibold leading-[1.1] tracking-tight">
              {ready ? "Ta réponse est prête." : "J'analyse ta conversation…"}
            </h2>
            <ul className="mt-8 space-y-4">
              {STEPS.map((s, k) => {
                const done = k < tick;
                return (
                  <li key={s} className={`flex items-center gap-3 text-[16px] font-medium transition ${k <= tick ? "text-ink" : "text-muted/40"}`}>
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-[11px] text-white transition ${done ? "bg-ink" : k === tick ? "bg-sun" : "bg-black/[0.08]"}`}
                    >
                      {done ? "✓" : ""}
                    </span>
                    {s}
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 rounded-[28px] bg-black/[0.03] p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[22px] bg-white p-6 text-center shadow-soft">
                <p className="text-[44px] font-semibold leading-none tracking-tight">
                  +{SOCIAL_PROOF.count}
                </p>
                <p className="mt-2 font-medium text-ink">{SOCIAL_PROOF.label}</p>
                <p className="mt-4 text-sm text-muted">Analyse en quelques secondes · Captures jamais conservées · 100 % en français</p>
              </div>
            </div>

            <div className="mt-auto pt-10">
              <button
                disabled={!ready}
                onClick={() => setPhase("result")}
                className="ease-spring group flex w-full items-center justify-between rounded-full bg-ink py-2 pl-7 pr-2 text-[17px] font-semibold text-white transition duration-500 active:scale-[0.98] disabled:opacity-30"
              >
                {ready ? "Voir la réponse" : "Analyse en cours…"}
                <span className="ease-spring grid h-11 w-11 place-items-center rounded-full bg-white/15 transition duration-500 group-hover:translate-x-0.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="reveal mt-16 text-center">
            <p className="text-lg font-semibold">Oups, l&apos;analyse a échoué.</p>
            <p className="mt-2 text-muted">{error}</p>
            <button onClick={() => analyse(answers as Answers)} className="mt-6 rounded-full bg-ink px-7 py-3 font-semibold text-white">
              Réessayer
            </button>
          </div>
        )}

        {phase === "result" && result && (
          <div className="reveal mt-8">
            {result.teaser ? (
              <Teaser r={result} loggedIn={!!me.user} />
            ) : (
              <div className="-mx-5">
                <ResultView r={result} flow={flow} historyId={result.id ?? null} />
              </div>
            )}
          </div>
        )}
      </div>
      <DownsellModal
        open={downsell}
        onClose={() => {
          setDownsell(false);
          onClose();
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aperçu + paywall                                                    */
/* ------------------------------------------------------------------ */

const PAYWALL_ORDER: PlanId[] = ["lifetime", "vip"];

function Teaser({ r, loggedIn }: { r: RelanceResponse; loggedIn: boolean }) {
  const [sel, setSel] = useState<PlanId>(FEATURED);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offersRef = useRef<HTMLDivElement>(null);
  const plan = PLANS[sel];

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: sel }),
      });
      const d = await res.json();
      if (!res.ok || !d.url) throw new Error(d.error ?? "Paiement indisponible");
      window.location.assign(d.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <WeatherCard {...r} />

      <div className="relative">
        <p className="mb-3 text-lg font-semibold tracking-tight">Tes 3 relances</p>
        <div className="space-y-2.5" aria-hidden>
          {r.replies.map((rep, k) => (
            <div key={k} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/[0.04]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{TONE_LABEL[rep.tone]}</p>
              <p className="mt-2 select-none text-[15px] font-medium blur-[7px]">
                {["on se fait un verre jeudi, je t'explique tout", "j'ai repensé à ce que tu m'as dit sur ton week-end", "ok j'avoue, celle-là je la retire"][k % 3]}
              </p>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 top-9 flex items-center justify-center">
          <button
            onClick={() => offersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
          >
            🔒 Débloquer mes relances
          </button>
        </div>
      </div>

      <div ref={offersRef} className="scroll-mt-6 rounded-[32px] bg-black/[0.03] p-1.5 ring-1 ring-black/[0.04]">
        <div className="rounded-[26px] bg-white p-5 shadow-soft">
          <p className="text-[22px] font-semibold leading-tight tracking-tight">Tes relances sont prêtes.</p>
          <p className="mt-1 text-sm text-muted">Paiement unique, sans abonnement. Accès immédiat.</p>

          <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Choisis ton offre">
            {PAYWALL_ORDER.map((id) => {
              const p = PLANS[id];
              const on = sel === id;
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSel(id)}
                  className={`ease-spring flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition duration-300 ${
                    on ? "bg-cream ring-2 ring-ink" : "ring-black/[0.08] hover:ring-black/20"
                  }`}
                >
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ring-2 ${on ? "ring-ink" : "ring-black/15"}`}>
                    {on && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      {p.name}
                      {p.badge && <span className="rounded-full bg-sun px-2 py-0.5 text-[10px] font-semibold text-white">{p.badge}</span>}
                    </span>
                    <span className="block text-[13px] text-muted">{id === "vip" ? "À vie + audit de ton profil + 100 phrases" : p.features[0]}</span>
                  </span>
                  <span className="text-right">
                    <span className="flex items-baseline justify-end gap-1.5">
                      {p.compareAt && <span className="text-[13px] font-medium text-muted line-through">{fmt(p.compareAt)}</span>}
                      <span className="text-lg font-semibold tracking-tight">{fmt(p.price)}</span>
                    </span>
                    <span className="block text-[11px] text-muted">{p.compareAt ? "offre de lancement" : p.period}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={pay}
            disabled={busy}
            className="ease-spring group mt-5 flex w-full items-center justify-between rounded-full bg-sun py-2 pl-6 pr-2 text-[16px] font-semibold text-white transition duration-500 active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Redirection vers le paiement…" : `Débloquer · ${fmt(plan.price)}`}
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 transition duration-500 group-hover:translate-x-0.5">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          {error && <p className="mt-3 text-sm font-medium text-rose">{error}</p>}
          <p className="mt-3 text-center text-xs text-muted">🔒 Paiement sécurisé par Stripe · Carte, Apple Pay, Google Pay</p>
          {!loggedIn && (
            <p className="mt-2 text-center text-xs text-muted">
              Déjà membre ?{" "}
              <Link
                href={`/connexion?next=${encodeURIComponent(`/app?analyse=${r.id ?? ""}`)}`}
                className="font-semibold text-ink underline underline-offset-2"
              >
                Connecte-toi
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
