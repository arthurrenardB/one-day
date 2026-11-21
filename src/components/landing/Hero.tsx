"use client";

import { useRef, useState } from "react";
import { SOCIAL_PROOF } from "@/lib/site";
import { Funnel } from "../Funnel";
import { Composer, ResultSheet, useRelance, type Input } from "../Relance";
import { HeroPhoneMobile, HeroPhones } from "./AnimatedPhones";

function SocialProof() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted shadow-soft ring-1 ring-black/[0.04]">
      <span className="h-1.5 w-1.5 rounded-full bg-sun" /> +{SOCIAL_PROOF.count} {SOCIAL_PROOF.label}
    </span>
  );
}

export function Hero() {
  const flow = useRelance();
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const [funnel, setFunnel] = useState<Input | null>(null);
  const focusInput = () => setTimeout(() => (mobileRef.current ?? inputRef.current)?.focus(), 50);

  return (
    <section id="essayer" className="relative overflow-hidden px-4 pb-20 pt-10 md:pb-32 md:pt-20">
      {/* ---------- Mobile : titre centré, champ en avant, téléphone qui dépasse ---------- */}
      <div className="reveal flex flex-col items-center text-center lg:hidden">
        <SocialProof />
        <h1 className="mt-6 text-[44px] font-semibold leading-[0.96] tracking-[-0.035em]">
          Ta conv a pris froid&nbsp;?
          <br />
          <span className="text-sun">On la réchauffe.</span>
        </h1>
        <p className="mt-4 max-w-[19rem] text-[15px] leading-snug text-muted">
          Colle son message, One Day te dit quoi répondre.
        </p>
        <div className="mt-7 w-full max-w-md text-left">
          <Composer onSubmit={(i) => setFunnel(i)} cta="Analyser ma conv" inputRef={mobileRef} chips={false} />
        </div>
        <HeroPhoneMobile />
      </div>

      {/* ---------- Desktop : texte à gauche, téléphones animés à droite ---------- */}
      <div className="relative mx-auto hidden max-w-6xl items-center gap-16 lg:grid lg:grid-cols-[1.05fr_1fr]">
        <div className="reveal">
          <SocialProof />
          <h1 className="mt-6 text-[64px] font-semibold leading-[0.98] tracking-[-0.035em] md:text-[80px]">
            Ta conv a pris froid&nbsp;?
            <br />
            <span className="text-sun">On la réchauffe.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[20px] leading-relaxed text-ink/70">
            Colle son dernier message. One Day te dit si ça vaut le coup de relancer, puis t&apos;écrit{" "}
            <span className="font-medium text-ink">3 relances dans ton style</span> et le bon moment pour les envoyer.
          </p>
          <div className="mt-9 max-w-xl">
            <Composer onSubmit={(i) => setFunnel(i)} cta="Analyser ma conv" inputRef={inputRef} chips={false} />
          </div>
        </div>
        <HeroPhones />
      </div>

      <ResultSheet flow={flow} onTryOwn={focusInput} />
      {funnel && <Funnel input={funnel} onClose={() => setFunnel(null)} />}
    </section>
  );
}
