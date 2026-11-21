"use client";

import { useEffect, useState } from "react";
import { SunMark } from "../Brand";
import { Avatar, Bubble, IPhone, type Msg } from "./Phone";

/*
 * Mini-démo en boucle, synchronisée entre les deux téléphones :
 * la conv s'éteint → One Day analyse → 3 relances → la relance est envoyée → elle répond.
 */

const RELANCE = "indice : y'a des pastéis de nata et je cherche une guide. t'es dispo jeudi ?";

// [délai depuis l'étape précédente (ms), étape]
const TIMELINE: number[] = [900, 800, 800, 700, 1100, 1300, 350, 350, 400, 900, 700, 1000, 1000, 1200, 3200];
const LAST = TIMELINE.length; // étape finale (état complet)

// Étapes (index) :
// 1 « devine » · 2 « ok » · 3 « Vu il y a 3 j » · 4 analyse en cours · 5 score
// 6-8 relances 1-3 · 9 créneau · 10 « Copié » · 11 je tape · 12 relance envoyée
// 13 elle tape · 14 sa réponse · 15 pause puis reboucle

function useTimeline() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = setTimeout(() => setStep(LAST - 1), 0);
      return () => clearTimeout(t);
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      timer = setTimeout(() => {
        i = i + 1 >= LAST ? 0 : i + 1;
        setStep(i);
        tick();
      }, TIMELINE[i]);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  return step;
}

function Typing({ mine = false }: { mine?: boolean }) {
  return (
    <div className={`bubble-in flex ${mine ? "justify-end" : ""}`}>
      <span
        className={`typing flex items-center gap-[3px] rounded-[18px] px-3 py-[9px] text-[10px] leading-none ${
          mine ? "rounded-br-[6px] bg-[#0b84fe]/80 text-white" : "rounded-bl-[6px] bg-[#e9e9eb] text-[#8e8e93]"
        }`}
      >
        <span>●</span>
        <span>●</span>
        <span>●</span>
      </span>
    </div>
  );
}

function AnimatedChat({ step }: { step: number }) {
  const msgs: (Msg & { at: number })[] = [
    { from: "meta", text: "Tu as répondu à sa story", at: 0 },
    { from: "her", text: "c'est où ça 😍", at: 0 },
    { from: "me", text: "devine", at: 1 },
    { from: "her", text: "ok", at: 2 },
    { from: "meta", text: "Vu · il y a 3 j", at: 3 },
    { from: "od", text: RELANCE, at: 12 },
    { from: "her", text: "mdrr lisbonne ?? jeudi ça marche 😂", at: 14 },
  ];
  const visible = msgs.filter((m) => step >= m.at);
  return (
    <>
      <div className="flex flex-col items-center border-b border-black/[0.06] bg-[#f9f9f9]/95 px-4 pb-2 pt-1">
        <div className="flex w-full items-center justify-between">
          <svg width="11" height="18" viewBox="0 0 11 18" aria-hidden>
            <path d="M9.5 1.5 2 9l7.5 7.5" fill="none" stroke="#0b84fe" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Avatar name="ines.lmb" size={36} />
          <span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[9px] font-semibold text-[#8e8e93]">Instagram</span>
        </div>
        <p className="mt-1 text-[11px] font-medium text-black">
          ines.lmb <span className="text-[#8e8e93]">›</span>
        </p>
        <p className="text-[9.5px] text-[#8e8e93]">{step >= 13 ? "En train d'écrire…" : "En ligne il y a 3 h"}</p>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden bg-white px-3 pb-3">
        {visible.map((m) => (
          <div key={m.text} className="bubble-in">
            <Bubble m={m} />
          </div>
        ))}
        {step === 11 && <Typing mine />}
        {step === 13 && <Typing />}
      </div>
      <div className="flex items-center gap-2 bg-white px-3 pb-[9%] pt-1">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e9e9eb] text-[16px] leading-none text-[#8e8e93]">+</span>
        <span className="flex-1 truncate rounded-full border border-black/10 px-3 py-[6px] text-[12px] text-[#c7c7cc]">
          {step === 11 ? <span className="text-black">{RELANCE.slice(0, 28)}…</span> : "iMessage"}
        </span>
      </div>
    </>
  );
}

function CountUp({ to, active }: { to: number; active: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, to]);
  return <>{active ? v : 0}</>;
}

const RELANCES = [
  ["Drôle", RELANCE],
  ["Direct", "on se fait un verre jeudi ? je te raconte où c'était"],
  ["Doux", "ta story m'a donné envie de partir. t'y retournes quand ?"],
];

function AnimatedApp({ step }: { step: number }) {
  const analysing = step === 4;
  const scored = step >= 5;
  return (
    <div className="flex flex-1 flex-col gap-2.5 bg-[#f6f4f0] px-3.5 pb-[9%] pt-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight text-ink">
          <SunMark className="h-5 w-5" /> one day
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[9.5px] font-semibold text-muted shadow-sm">Inès · Insta</span>
      </div>

      {step < 4 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm">
            <SunMark className="h-7 w-7" />
          </span>
          <p className="mt-3 text-[12px] font-semibold text-ink">Colle son dernier message</p>
          <div className="mt-3 w-full rounded-full bg-white px-3 py-2 text-left text-[11px] text-muted shadow-sm">
            {step >= 3 ? <span className="text-ink">« ok »</span> : "…"}
          </div>
        </div>
      ) : (
        <>
          <div className="bubble-in rounded-2xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(14,14,18,0.2)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Analyse de ta conv</p>
            {analysing ? (
              <p className="typing mt-2 flex gap-1 text-[12px] font-medium text-ink/70">
                J&apos;analyse
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
            ) : (
              <>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <p className="text-[22px] font-bold leading-none tracking-tight text-ink">
                    <CountUp to={98} active={scored} />%
                  </p>
                  <p className="text-[10px] font-medium text-muted">de chances qu&apos;elle réponde</p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                  <div
                    className="ease-spring h-1.5 rounded-full bg-sun transition-all duration-1000"
                    style={{ width: scored ? "98%" : "0%" }}
                  />
                </div>
                <p className="mt-2 text-[10.5px] leading-snug text-ink/75">Elle a répondu sec, mais rien de perdu. Relance avec une idée concrète.</p>
              </>
            )}
          </div>
          {RELANCES.map(([t, txt], k) =>
            step >= 6 + k ? (
              <div
                key={t}
                className={`bubble-in rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_-14px_rgba(14,14,18,0.18)] transition ${
                  k === 0 && step >= 10 && step < 12 ? "ring-2 ring-sun" : ""
                }`}
              >
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-muted">{t}</p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <span className="rounded-[14px] rounded-br-[4px] bg-ink px-2.5 py-1.5 text-[10.5px] leading-snug text-white">{txt}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold transition ${
                      k === 0 && step >= 10 ? "bg-ink text-white" : "bg-sand text-ink"
                    }`}
                  >
                    {k === 0 && step >= 10 ? "Copié ✓" : "Copier"}
                  </span>
                </div>
              </div>
            ) : null,
          )}
          {step >= 9 && (
            <div className="bubble-in mt-auto flex items-center justify-between rounded-2xl bg-ink px-3 py-2.5 text-white">
              <span className="text-[11px] font-semibold">⏰ Envoie ce soir vers 21h</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold">Rappel</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Mobile : le haut d'un téléphone One Day qui dépasse en bas du hero. */
export function HeroPhoneMobile() {
  const step = useTimeline();
  return (
    <div className="pointer-events-none relative mx-auto mt-10 h-[196px] w-full max-w-[320px] overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-4 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-sun/10 blur-3xl" />
      <div className="phone-float relative mx-auto w-fit">
        <IPhone width={270}>
          <AnimatedApp step={step} />
        </IPhone>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cream to-transparent" />
    </div>
  );
}

export function HeroPhones() {
  const step = useTimeline();
  return (
    <div className="relative mx-auto flex h-[620px] w-full max-w-[520px] items-center justify-center" aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sun/10 blur-3xl" />
      <div className="absolute left-0 top-10 hidden sm:block">
        <div className="phone-float">
          <IPhone width={250} className="-rotate-[7deg]">
            <AnimatedChat step={step} />
          </IPhone>
        </div>
      </div>
      <div className="relative z-10 sm:translate-x-16">
        <div className="phone-float-delayed">
          <IPhone width={280} className="sm:rotate-[3deg]">
            <AnimatedApp step={step} />
          </IPhone>
        </div>
      </div>
    </div>
  );
}
