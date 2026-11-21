"use client";

import { useEffect, useRef, useState } from "react";
import { DOWNSELL, fmt } from "@/lib/plans";

const SEEN_KEY = "oneday:downsell-seen";

/** Détecte l'intention de sortie : souris qui quitte par le haut (desktop) + bouton retour (mobile). */
export function useExitIntent(enabled: boolean, onExit: () => void) {
  const fired = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {}
    const trigger = () => {
      if (fired.current) return;
      fired.current = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      onExit();
    };
    const onMouse = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    // Piège au bouton retour : on pousse un état, le retour déclenche le downsell au lieu de quitter.
    history.pushState({ ds: true }, "");
    const onPop = () => {
      if (!fired.current) {
        trigger();
        history.pushState({ ds: true }, "");
      }
    };
    document.addEventListener("mouseout", onMouse);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("mouseout", onMouse);
      window.removeEventListener("popstate", onPop);
    };
  }, [enabled, onExit]);
}

export function DownsellModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: DOWNSELL.plan, downsell: true }),
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="animate-sheet w-full max-w-sm rounded-[28px] bg-cream p-6 text-center shadow-2xl">
        <p className="text-4xl">✋</p>
        <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight">Attends, une dernière offre</h2>
        <p className="mt-2 text-[15px] text-muted">
          L&apos;accès <strong className="text-ink">à vie</strong>, illimité, juste pour toi :
        </p>
        <p className="mt-4 flex items-end justify-center gap-2">
          <span className="text-lg font-medium text-muted line-through">{fmt(DOWNSELL.compareAt)}</span>
          <span className="font-display text-[44px] font-semibold leading-none tracking-tight text-sun">{fmt(DOWNSELL.price)}</span>
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Offre unique · maintenant</p>
        <button
          onClick={pay}
          disabled={busy}
          className="ease-spring mt-6 w-full rounded-full bg-sun py-3.5 text-[16px] font-semibold text-white transition duration-500 active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Redirection…" : `Débloquer à vie · ${fmt(DOWNSELL.price)}`}
        </button>
        {error && <p className="mt-3 text-sm font-medium text-rose">{error}</p>}
        <button onClick={onClose} className="mt-4 text-sm font-medium text-muted underline underline-offset-2">
          Non merci, je quitte
        </button>
      </div>
    </div>
  );
}
