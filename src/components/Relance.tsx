"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PLANS, fmt } from "@/lib/plans";
import {
  GOALS,
  GOAL_LABEL,
  TONES,
  TONE_LABEL,
  type Goal,
  type RelanceResponse,
  type Tone,
  type Weather,
} from "@/lib/constants";
import { refresh, useMe } from "@/lib/store";
import { demoRelance } from "@/lib/demo";

/* ------------------------------------------------------------------ */
/* Hook : un passage complet « message → analyse → relances »          */
/* ------------------------------------------------------------------ */

export type Input = { message: string; image: string | null };
type Status = "idle" | "loading" | "done" | "error" | "paywall";

export function useRelance() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<RelanceResponse | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [input, setInput] = useState<Input | null>(null);
  const [goal, setGoal] = useState<Goal>("relancer");
  const [tone, setTone] = useState<Tone | "mix">("mix");

  const run = useCallback(
    async (inp: Input, opts?: { goal?: Goal; tone?: Tone | "mix"; context?: string }) => {
      const g = opts?.goal ?? goal;
      const t = opts?.tone ?? tone;
      setInput(inp);
      setGoal(g);
      setTone(t);
      setError(null);
      setBlocked(false);
      const hadResult = !!result;
      setStatus("loading");
      try {
        const res = await fetch("/api/relance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: inp.message, image: inp.image ?? undefined, goal: g, tone: t, context: opts?.context }),
        });
        const data = await res.json();
        if (res.status === 402 && data?.code === "paywall") {
          // Plus de crédit (vérifié côté serveur) : on garde le résultat affiché et on montre le paywall.
          if (hadResult) {
            setBlocked(true);
            setStatus("done");
          } else setStatus("paywall");
          return;
        }
        if (!res.ok) throw new Error(data?.error ?? "Erreur");
        setHistoryId(data.id ?? null);
        setResult(data);
        setStatus("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
        setStatus(hadResult ? "done" : "error");
      } finally {
        refresh();
      }
    },
    [goal, tone, result],
  );

  /** Exemple pré-calculé : montre la valeur sans consommer la relance offerte. */
  const showExample = (message: string) => {
    setInput(null);
    setError(null);
    setBlocked(false);
    setHistoryId(null);
    setResult({ ...demoRelance({ message, goal: "relancer", tone: "mix" }), example: true });
    setStatus("done");
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setBlocked(false);
  };

  return { status, result, error, blocked, input, goal, tone, historyId, run, reset, showExample };
}

/* ------------------------------------------------------------------ */
/* Composer : champ + capture + suggestions                            */
/* ------------------------------------------------------------------ */

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

const CHIPS = ["haha", "ok", "Vu", "jsp si j'suis dispo", "bien et toi"];
const EXAMPLES = [
  { label: "Elle a mis un « Vu »", message: "Vu" },
  { label: "« haha » et plus rien", message: "haha" },
  { label: "« jsp si j'suis dispo »", message: "jsp si j'suis dispo" },
  { label: "« bien et toi »", message: "bien et toi" },
];

export function Composer({
  onSubmit,
  busy,
  size = "lg",
  cta = "Analyser ma conv",
  onExample,
  inputRef,
  chips = true,
}: {
  onSubmit: (i: Input) => void;
  onExample?: (message: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  busy?: boolean;
  size?: "lg" | "md";
  cta?: string;
  chips?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imgErr, setImgErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (m = message) => {
    if (busy) return;
    if (!m.trim() && !image) return;
    onSubmit({ message: m.trim(), image });
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    setImgErr(null);
    if (!f.type.startsWith("image/")) return setImgErr("Ajoute une image (capture d'écran).");
    try {
      setImage(await fileToDataUrl(f));
    } catch {
      setImgErr("Impossible de lire cette image.");
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex items-center gap-2 rounded-full bg-white p-1.5 shadow-soft ring-1 ring-black/[0.06] transition focus-within:ring-2 focus-within:ring-ink/20 ${
          size === "lg" ? "md:p-2" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-cream text-ink transition hover:bg-sand"
          aria-label="Ajouter une capture d'écran"
          title="Ajouter une capture"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Capture ajoutée" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={(e) => {
            const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith("image/"));
            if (f) {
              e.preventDefault();
              onFile(f);
            }
          }}
          placeholder={image ? "Capture ajoutée · ajoute un mot si tu veux" : "Colle son dernier message…"}
          aria-label="Son dernier message"
          className="min-w-0 flex-1 bg-transparent px-1 text-[16px] font-medium outline-none placeholder:text-muted/70"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={busy || (!message.trim() && !image)}
          className="ease-spring flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink pl-5 pr-4 font-medium text-white transition duration-500 hover:bg-ink-2 active:scale-[0.98] disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">{busy ? "J'écris…" : cta}</span>
          <span className="sm:hidden">{busy ? "…" : "Go"}</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      {image && (
        <button onClick={() => setImage(null)} className="mt-2 text-xs font-semibold text-muted underline">
          Retirer la capture
        </button>
      )}
      {imgErr && <p className="mt-2 text-sm font-semibold text-rose">{imgErr}</p>}
      <p className="mt-2 text-xs font-medium text-muted">
        🔒 Captures supprimées juste après l&apos;analyse · jamais revendues · jamais utilisées pour entraîner l&apos;IA
      </p>
      {chips &&
        (onExample ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted">Voir un exemple</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => onExample(ex.message)}
              className="ease-spring rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink/80 shadow-soft ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-0.5 hover:text-ink"
            >
              {ex.label}
            </button>
          ))}
        </div>
      ) : (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted">Essaie avec</span>
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setMessage(c);
              submit(c);
            }}
            className="ease-spring rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink/80 shadow-soft ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-0.5 hover:text-ink"
          >
            {c}
          </button>
        ))}
      </div>
        ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vue de chargement                                                   */
/* ------------------------------------------------------------------ */

const STEPS = ["Je lis la conv", "J'analyse son intérêt", "J'écris dans ton style", "Je choisis le bon moment"];

export function LoadingView() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center" role="status" aria-live="polite">
      <div className="relative h-20 w-20">
        <div className="sun-gradient absolute inset-3 rounded-full" />
        <svg viewBox="0 0 80 80" className="animate-sunspin absolute inset-0 h-full w-full" aria-hidden>
          {Array.from({ length: 12 }).map((_, k) => (
            <rect key={k} x="38.5" y="2" width="3" height="9" rx="1.5" fill="#FFC447" transform={`rotate(${k * 30} 40 40)`} />
          ))}
        </svg>
      </div>
      <ul className="mt-8 space-y-2 text-left">
        {STEPS.map((s, k) => (
          <li key={s} className={`flex items-center gap-2 font-semibold transition ${k <= i ? "text-ink" : "text-muted/40"}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${k < i ? "bg-ink text-cream" : k === i ? "sun-gradient text-white" : "bg-sand"}`}>
              {k < i ? "✓" : ""}
            </span>
            {s}
            {k === i && (
              <span className="typing ml-1 text-sun">
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Résultat                                                            */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setOk(true);
        setTimeout(() => setOk(false), 1600);
      }}
      className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold transition ${ok ? "bg-ink text-cream" : "bg-sand text-ink hover:bg-line"}`}
    >
      {ok ? "Copié ✓" : "Copier"}
    </button>
  );
}

/** Analyse de la conv : chances de réponse, verdict, signaux. */
export function WeatherCard({ verdict, signals, reading, strategy }: RelanceResponse) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-black/[0.04]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Analyse de ta conv</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[44px] font-semibold leading-none tracking-tight">98%</span>
        <span className="text-[15px] font-medium text-ink/70">de chances qu&apos;elle te réponde</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand">
        <div className="h-full rounded-full bg-sun" style={{ width: "98%" }} />
      </div>
      <p className="mt-3 font-semibold">{verdict}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {signals.map((s) => (
          <span key={s} className="rounded-md bg-sand px-2 py-1 text-xs font-semibold text-ink/80">
            {s}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{reading}</p>
      {strategy && (
        <p className="mt-2 flex gap-2 text-[15px] font-semibold">
          <span className="text-sun">→</span>
          {strategy}
        </p>
      )}
      {true && (
        <p className="mt-3 rounded-lg bg-sand/70 px-3 py-2 text-xs font-semibold text-ink/70">
          ⏳ Chaque jour sans réponse refroidit la conv : le mieux, c&apos;est de relancer aujourd&apos;hui.
        </p>
      )}
    </div>
  );
}

function reminderTime(sendAt: string) {
  const d = new Date();
  const m = /(\d{1,2})\s*h\s*(\d{2})?/i.exec(sendAt);
  let h = m ? parseInt(m[1], 10) : /midi/i.test(sendAt) ? 12 : 21;
  const min = m?.[2] ? parseInt(m[2], 10) : 0;
  if (h > 23) h = 21;
  if (/demain/i.test(sendAt)) d.setDate(d.getDate() + 1);
  d.setHours(h, min, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

export function ResultView({
  r,
  flow,
  historyId = null,
  compact = false,
  onTryOwn,
}: {
  r: RelanceResponse;
  flow: ReturnType<typeof useRelance>;
  historyId?: string | null;
  compact?: boolean;
  onTryOwn?: () => void;
}) {
  const me = useMe();
  const unlimited = me.unlimited;
  const hasPlan = !!me.plan;
  const [goal, setGoal] = useState<Goal>(flow.goal);
  const [tone, setTone] = useState<Tone | "mix">(flow.tone);
  const [lockMsg, setLockMsg] = useState<string | null>(null);
  const [reminder, setReminderAt] = useState<Date | null>(null);
  const paywallRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (flow.blocked) paywallRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [flow.blocked]);

  const pickTone = (t: Tone | "mix") => {
    if (t === "taquin" && !unlimited) {
      setLockMsg("Le ton Taquin est inclus dans l'offre À vie.");
      return;
    }
    setLockMsg(null);
    setTone(t);
  };

  const remind = async () => {
    if (!unlimited) {
      setLockMsg("Les rappels au bon moment sont inclus dans l'offre À vie.");
      return;
    }
    const at = reminderTime(r.send_at);
    const id = historyId ?? flow.historyId;
    if (id) {
      const res = await fetch(`/api/relances/${id}/reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ at: at.getTime() }),
      });
      if (!res.ok) {
        setLockMsg((await res.json().catch(() => null))?.error ?? "Impossible de programmer le rappel.");
        return;
      }
      refresh();
    }
    setReminderAt(at);
    try {
      if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
      const delay = at.getTime() - Date.now();
      if ("Notification" in window && Notification.permission === "granted" && delay < 86_400_000) {
        setTimeout(() => new Notification("One Day ☀️", { body: `C'est le moment de relancer${r.contact_name ? ` ${r.contact_name}` : ""}.` }), delay);
      }
    } catch {
      /* notifications non disponibles */
    }
  };

  const changed = goal !== flow.goal || tone !== flow.tone;

  return (
    <div className={`space-y-4 ${compact ? "" : "p-4 sm:p-5"}`}>
      {r.example && (
        <div className="rounded-2xl border-2 border-dashed border-sun/50 bg-white p-4">
          <p className="font-display text-lg font-semibold tracking-tight">Ceci est un exemple ☀️</p>
          <p className="mt-1 text-sm text-muted">
            Colle son vrai message (ou une capture) pour une analyse de <strong>ta</strong> conv. L&apos;analyse est gratuite, sans compte.
          </p>
          <button onClick={onTryOwn} className="sun-gradient mt-3 w-full rounded-xl py-3 font-bold text-white">
            À moi de jouer
          </button>
        </div>
      )}
      {r.demo && !r.example && (
        <p className="rounded-xl bg-gold/25 px-3 py-2 text-xs font-semibold text-ink/80">
          Mode démo : réponses d&apos;exemple.
        </p>
      )}

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
          Son message{r.contact_name ? ` · ${r.contact_name}` : ""}
          {r.app ? ` · ${r.app}` : ""}
        </p>
        <span className="inline-block max-w-[85%] rounded-2xl rounded-bl-md bg-sand px-3.5 py-2 text-[15px] font-medium">
          {r.last_message}
        </span>
      </div>

      <WeatherCard {...r} />

      {r.weather === "tempete" && r.goodbye && (
        <div className="rounded-2xl border border-ink/10 bg-ink p-4 text-cream">
          <p className="text-xs font-bold uppercase tracking-wider text-cream/60">Le dernier mot, avec classe</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="font-semibold">{r.goodbye}</p>
            <CopyButton text={r.goodbye} />
          </div>
          <p className="mt-2 text-xs text-cream/60">Le respect, c&apos;est aussi savoir s&apos;arrêter. La prochaine conv sera la bonne.</p>
        </div>
      )}

      <div>
        <p className="mb-2 font-display text-lg font-semibold tracking-tight">
          {r.weather === "tempete" ? "Pour clore proprement" : "Tes 3 relances"}
        </p>
        <div className="space-y-2.5">
          {r.replies.map((rep, k) =>
            !rep.text ? (
              <div key={k} className="relative overflow-hidden rounded-2xl border border-line bg-white p-3">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{TONE_LABEL[rep.tone]}</p>
                <span aria-hidden className="sun-gradient inline-block select-none rounded-2xl rounded-br-md px-3.5 py-2 text-[15px] font-semibold text-white blur-[6px]">
                  {k === 1 ? "on se capte jeudi pour un verre, je t'explique tout" : "j'ai repensé à ton histoire de ski, raconte la suite"}
                </span>
                <Link
                  href="/offres"
                  className="absolute inset-0 flex items-center justify-center bg-white/40 text-sm font-semibold tracking-tight text-ink"
                >
                  <span className="rounded-full bg-ink px-4 py-2 text-cream shadow-lg">🔒 Débloquer · dès {fmt(PLANS.pack10.price)}</span>
                </Link>
              </div>
            ) : (
            <div key={k} className="rounded-2xl border border-line bg-white p-3">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{TONE_LABEL[rep.tone]}</p>
              <div className="flex items-end justify-between gap-3">
                <span className="sun-gradient inline-block rounded-2xl rounded-br-md px-3.5 py-2 text-[15px] font-semibold text-white">
                  {rep.text}
                </span>
                <CopyButton text={rep.text} />
              </div>
            </div>
            ),
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sand/70 px-4 py-3">
        <p className="font-semibold">
          <span className="mr-1.5">⏰</span>Envoie {r.send_at}
        </p>
        {r.example ? null : reminder ? (
          <span className="text-sm font-bold text-sun">
            Rappel prévu à {reminder.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        ) : (
          <button onClick={remind} className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold shadow-sm hover:bg-cream">
            Me le rappeler {!unlimited && "🔒"}
          </button>
        )}
      </div>

      {!r.example && (
      <div className="rounded-2xl border border-line bg-white p-4">
        <p className="text-sm font-bold">Ton objectif</p>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-sand p-1">
          {GOALS.map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`rounded-lg px-2 py-2 text-xs font-bold sm:text-sm ${goal === g ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"}`}
            >
              {GOAL_LABEL[g]}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm font-bold">Le ton</p>
        <div className="mt-2 grid grid-cols-5 gap-1 rounded-xl bg-sand p-1">
          {(["mix", ...TONES] as const).map((t) => (
            <button
              key={t}
              onClick={() => pickTone(t)}
              className={`rounded-lg px-1 py-2 text-xs font-bold sm:text-sm ${tone === t ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"}`}
            >
              {t === "mix" ? "Les 3" : TONE_LABEL[t]}
              {t === "taquin" && !unlimited ? " 🔒" : ""}
            </button>
          ))}
        </div>
        {lockMsg && (
          <p className="mt-3 rounded-lg bg-gold/25 px-3 py-2 text-sm font-semibold">
            {lockMsg}{" "}
            <Link href="/offres" className="text-sun underline">
              Voir les formules
            </Link>
          </p>
        )}
        <button
          disabled={!changed}
          onClick={() => flow.input && flow.run(flow.input, { goal, tone })}
          className="mt-4 w-full rounded-xl bg-ink py-3 font-bold text-cream transition hover:bg-ink-2 disabled:opacity-40"
        >
          Réécrire avec ces réglages
        </button>
        {flow.error && <p className="mt-3 text-sm font-semibold text-rose">{flow.error}</p>}
      </div>
      )}

      {!hasPlan && !r.example && (
        <div ref={paywallRef} className="scroll-mt-20">
          <InlinePaywall weather={r.weather as Weather} blocked={flow.blocked} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paywall en ligne (après la relance offerte)                         */
/* ------------------------------------------------------------------ */

export function InlinePaywall({ weather, blocked = false }: { weather?: Weather; blocked?: boolean }) {
  const me = useMe();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-cream">
      <div className="sun-gradient absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-80 blur-2xl" aria-hidden />
      <p className="relative font-display text-xl font-semibold tracking-tight">
        {blocked ? "Débloque One Day pour continuer" : "Tes relances t'attendent"}
      </p>
      <p className="relative mt-1.5 text-[15px] text-cream/75">
{weather !== "tempete"
          ? `C'est maintenant que ça se joue. Débloque l'accès à vie, pour le prix d'un café.`
          : "Débloque l'accès à vie, pour le prix d'un café."}
      </p>
      <div className="relative mt-4">
        <Link href="/checkout?plan=lifetime" className="sun-gradient block rounded-xl px-4 py-3 text-center font-bold text-white transition hover:brightness-105">
          Débloquer à vie · {fmt(PLANS.lifetime.price)}
        </Link>
      </div>
      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-cream/60">
        <span>
          Paiement unique · Sans abonnement
          {!me.user && (
            <>
              {" · "}
              <Link href="/connexion" className="font-bold text-cream underline">
                Déjà client ?
              </Link>
            </>
          )}
        </span>
        <Link href="/offres" className="font-bold text-cream underline">
          Voir toutes les formules
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feuille modale (utilisée sur la landing)                            */
/* ------------------------------------------------------------------ */

export function ResultSheet({ flow, onTryOwn }: { flow: ReturnType<typeof useRelance>; onTryOwn?: () => void }) {
  const open = flow.status !== "idle";
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && flow.reset();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, flow]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-center sm:p-6" onClick={flow.reset}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tes relances"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream/95 px-5 py-3 backdrop-blur">
          <p className="font-display text-lg font-semibold tracking-tight">Tes relances</p>
          <button onClick={flow.reset} className="grid h-9 w-9 place-items-center rounded-full bg-sand hover:bg-line" aria-label="Fermer">
            ✕
          </button>
        </div>
        {flow.status === "loading" && <LoadingView />}
        {flow.status === "done" && flow.result && (
          <ResultView
            r={flow.result}
            flow={flow}
            onTryOwn={() => {
              flow.reset();
              onTryOwn?.();
            }}
          />
        )}
        {flow.status === "paywall" && (
          <div className="p-5">
            <InlinePaywall blocked />
          </div>
        )}
        {flow.status === "error" && (
          <div className="p-6 text-center">
            <p className="font-semibold text-rose">{flow.error}</p>
            <button onClick={() => flow.input && flow.run(flow.input)} className="mt-4 rounded-xl bg-ink px-5 py-2.5 font-bold text-cream">
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
