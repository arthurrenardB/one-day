"use client";

import { useState, useSyncExternalStore } from "react";
import { SunMark } from "./Brand";

/*
 * Écran affiché quand le site est ouvert dans le navigateur intégré d'une appli
 * (TikTok, Instagram, Snapchat, Facebook). Ces navigateurs bloquent le paiement,
 * la connexion et l'ajout à l'écran d'accueil : on invite à ouvrir dans le vrai navigateur.
 * Impossible de rediriger de force depuis une webview : on guide + on propose de copier le lien.
 */

type App = "TikTok" | "Instagram" | "Snapchat" | "Facebook" | null;

function detectInApp(ua: string): App {
  if (/BytedanceWebview|musical_ly|trill|ByteLo|TikTok|Bytedance/i.test(ua)) return "TikTok";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  return null;
}

const DISMISS_KEY = "oneday:inapp-dismissed";

export function InAppGate() {
  // Détection synchrone après hydratation (pas de setState dans un effet).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  let app: App = null;
  if (mounted && !dismissed) {
    try {
      const params = new URLSearchParams(window.location.search);
      // ?inappdemo=tiktok force l'affichage (prévisualisation) ; ?inappoff=1 le désactive.
      if (params.get("inappoff") !== "1" && !sessionStorage.getItem(DISMISS_KEY)) {
        app = params.get("inappdemo") ? ((params.get("inappdemo") as App) || "TikTok") : detectInApp(navigator.userAgent);
      }
    } catch {
      /* indisponible */
    }
  }

  if (!app) return null;

  const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "https://heyoneday.vercel.app";
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  // TikTok, Insta et Snap mettent le menu en haut à droite ; iOS Insta/Snap plutôt en bas.
  const menuTop = app === "TikTok" || app === "Facebook" || !isIOS;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-cream px-6 pb-8 pt-7 text-ink">
      {/* flèche vers le menu ⋯ */}
      <div className={`pointer-events-none absolute inset-x-0 flex ${menuTop ? "top-0 justify-end pr-4 pt-1" : "bottom-2 justify-center"}`}>
        <div className={`flex flex-col items-center ${menuTop ? "" : "flex-col-reverse"}`}>
          <Arrow up={menuTop} />
          <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-cream">⋯</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-ink shadow-soft">
          <SunMark className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-[30px] font-semibold leading-[1.05] tracking-tight">
          Ouvre One Day dans
          <br />
          ton navigateur
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Le navigateur de {app} bloque le paiement et la connexion. En 2 secondes, ouvre le site dans Safari ou Chrome :
        </p>

        <div className="mt-6 w-full rounded-2xl bg-white p-4 text-left shadow-soft ring-1 ring-black/[0.04]">
          <Step n={1}>
            Appuie sur <span className="font-semibold text-ink">⋯</span> {menuTop ? "en haut à droite" : "en bas de l'écran"}
          </Step>
          <Step n={2}>
            Choisis <span className="font-semibold text-ink">« Ouvrir dans le navigateur »</span>
            {isIOS ? " (ou Safari)" : " (ou Chrome)"}
          </Step>
        </div>

        <button
          onClick={copy}
          className="ease-spring mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[15px] font-semibold text-cream transition duration-500 active:scale-[0.98]"
        >
          {copied ? "Lien copié ✓" : "Copier le lien du site"}
        </button>
        <p className="mt-2 text-xs text-muted">{url.replace("https://", "")}</p>

        <button onClick={dismiss} className="mt-6 text-sm font-medium text-muted underline underline-offset-2">
          Continuer ici quand même
        </button>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-[15px]">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sun text-xs font-bold text-white">{n}</span>
      <span className="leading-snug text-ink/80">{children}</span>
    </div>
  );
}

function Arrow({ up }: { up: boolean }) {
  return (
    <svg width="34" height="54" viewBox="0 0 34 54" fill="none" className={`text-ink ${up ? "animate-bounce" : "rotate-180 animate-bounce"}`} aria-hidden>
      <path d="M17 50V6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 17 17 5l11 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
