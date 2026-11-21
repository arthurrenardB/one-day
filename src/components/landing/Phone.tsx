import type { ReactNode } from "react";
import { SunMark } from "../Brand";

export type Msg = { from: "her" | "me" | "od" | "meta"; text: string };

/* ------------------------------------------------------------------ */
/* Cadre iPhone réaliste (titane, Dynamic Island, boutons latéraux)   */
/* ------------------------------------------------------------------ */

const TITANIUM = "linear-gradient(145deg,#ecebe7 0%,#b4b1ab 22%,#e2dfd9 48%,#9c9993 72%,#d8d5cf 100%)";

export function IPhone({
  children,
  width = 300,
  className = "",
  dark = false,
}: {
  children: ReactNode;
  width?: number;
  className?: string;
  dark?: boolean;
}) {
  const h = Math.round(width * 2.05);
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width, height: h }}>
      {/* boutons latéraux */}
      <span className="absolute -left-[2px] top-[17%] h-[4.5%] w-[3px] rounded-l-sm" style={{ background: TITANIUM }} />
      <span className="absolute -left-[2px] top-[24%] h-[7.5%] w-[3px] rounded-l-sm" style={{ background: TITANIUM }} />
      <span className="absolute -left-[2px] top-[33%] h-[7.5%] w-[3px] rounded-l-sm" style={{ background: TITANIUM }} />
      <span className="absolute -right-[2px] top-[27%] h-[11%] w-[3px] rounded-r-sm" style={{ background: TITANIUM }} />

      {/* châssis */}
      <div
        className="h-full w-full rounded-[18%/8.6%] p-[3px] shadow-[0_50px_100px_-30px_rgba(14,14,18,0.45),0_30px_60px_-30px_rgba(14,14,18,0.3)]"
        style={{ background: TITANIUM }}
      >
        <div className="h-full w-full rounded-[17.4%/8.3%] bg-[#0a0a0c] p-[3.2%]">
          <div className={`relative h-full w-full overflow-hidden rounded-[14.6%/6.9%] ${dark ? "bg-[#0b0b0f]" : "bg-white"}`}>
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[1.6%] z-30 h-[3.7%] w-[33%] -translate-x-1/2 rounded-full bg-black" />
            <StatusBar dark={dark} />
            <div className="absolute inset-x-0 bottom-0 top-[6.5%] flex flex-col">{children}</div>
            {/* barre d'accueil */}
            <div
              className={`absolute bottom-[1.1%] left-1/2 z-30 h-[0.6%] w-[36%] -translate-x-1/2 rounded-full ${dark ? "bg-white/80" : "bg-black/85"}`}
            />
            {/* reflet du verre */}
            <div
              className="pointer-events-none absolute inset-0 z-40"
              style={{ background: "linear-gradient(118deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 32%)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ dark }: { dark: boolean }) {
  const c = dark ? "#fff" : "#000";
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-[6.5%] items-center justify-between px-[8%] pt-[1%]">
      <span className="text-[13px] font-semibold tracking-tight" style={{ color: c }}>
        21:04
      </span>
      <span className="flex items-center gap-[5px]">
        <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.5} y={8 - i * 2.6} width="3" height={3 + i * 2.6} rx="0.8" fill={c} />
          ))}
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" aria-hidden fill={c}>
          <path d="M7.5 2.2c2.2 0 4.2.9 5.7 2.3l1-1A9.4 9.4 0 0 0 7.5.8 9.4 9.4 0 0 0 .8 3.5l1 1a8 8 0 0 1 5.7-2.3Z" />
          <path d="M7.5 5.2c1.4 0 2.6.5 3.6 1.4l1-1a6.4 6.4 0 0 0-9.2 0l1 1c1-.9 2.2-1.4 3.6-1.4Z" />
          <path d="M7.5 8.1c.6 0 1.1.2 1.5.6L7.5 10.3 6 8.7c.4-.4.9-.6 1.5-.6Z" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke={c} strokeOpacity="0.4" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill={c} />
          <path d="M23 4v4c.8-.3 1.3-1.1 1.3-2S23.8 4.3 23 4Z" fill={c} fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Écran de messagerie (style iOS)                                     */
/* ------------------------------------------------------------------ */

const AVATAR_COLORS = ["#F59E0B", "#FF5B23", "#6366F1", "#10B981", "#EC4899", "#8B5CF6"];

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const c = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: c, fontSize: size * 0.42 }}
      aria-hidden
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}

export function Bubble({ m }: { m: Msg }) {
  if (m.from === "meta")
    return <p className="py-1 text-center text-[10px] font-medium text-[#8e8e93]">{m.text}</p>;
  if (m.from === "her")
    return (
      <div className="flex">
        <span className="max-w-[76%] rounded-[18px] rounded-bl-[6px] bg-[#e9e9eb] px-3 py-[7px] text-[13px] leading-snug text-black">
          {m.text}
        </span>
      </div>
    );
  return (
    <div className="flex flex-col items-end">
      <span className="max-w-[78%] rounded-[18px] rounded-br-[6px] bg-[#0b84fe] px-3 py-[7px] text-[13px] leading-snug text-white">
        {m.text}
      </span>
      {m.from === "od" && (
        <span className="mt-1 flex items-center gap-1 rounded-full bg-sun/10 px-2 py-[2px] text-[9.5px] font-semibold text-sun">
          <SunMark className="h-2.5 w-2.5" /> écrit avec One Day
        </span>
      )}
    </div>
  );
}

export function ChatScreen({ app, name, status, msgs }: { app: string; name: string; status?: string; msgs: Msg[] }) {
  return (
    <>
      <div className="flex flex-col items-center border-b border-black/[0.06] bg-[#f9f9f9]/95 px-4 pb-2 pt-1">
        <div className="flex w-full items-center justify-between">
          <svg width="11" height="18" viewBox="0 0 11 18" aria-hidden>
            <path d="M9.5 1.5 2 9l7.5 7.5" fill="none" stroke="#0b84fe" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Avatar name={name} size={36} />
          <span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[9px] font-semibold text-[#8e8e93]">{app}</span>
        </div>
        <p className="mt-1 text-[11px] font-medium text-black">
          {name} <span className="text-[#8e8e93]">›</span>
        </p>
        {status && <p className="text-[9.5px] text-[#8e8e93]">{status}</p>}
      </div>
      <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden bg-white px-3 pb-3">
        {msgs.map((m, i) => (
          <Bubble key={i} m={m} />
        ))}
      </div>
      <div className="flex items-center gap-2 bg-white px-3 pb-[9%] pt-1">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e9e9eb] text-[16px] leading-none text-[#8e8e93]">+</span>
        <span className="flex-1 rounded-full border border-black/10 px-3 py-[6px] text-[12px] text-[#c7c7cc]">iMessage</span>
      </div>
    </>
  );
}

/** Téléphone + conversation (raccourci utilisé partout). */
export function Phone({
  app,
  name,
  status,
  msgs,
  className = "",
  width = 280,
}: {
  app: string;
  name: string;
  status?: string;
  msgs: Msg[];
  className?: string;
  width?: number;
}) {
  return (
    <IPhone width={width} className={className}>
      <ChatScreen app={app} name={name} status={status} msgs={msgs} />
    </IPhone>
  );
}

/* ------------------------------------------------------------------ */
/* Écran de l'appli One Day (résultat)                                 */
/* ------------------------------------------------------------------ */

export function AppResultScreen() {
  return (
    <div className="flex flex-1 flex-col gap-2.5 bg-[#f6f4f0] px-3.5 pb-[9%] pt-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight text-ink">
          <SunMark className="h-5 w-5" /> one day
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[9.5px] font-semibold text-muted shadow-sm">Inès · Insta</span>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(14,14,18,0.2)]">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Analyse de ta conv</p>
        <div className="mt-1 flex items-end justify-between">
          <p className="text-[22px] font-bold leading-none tracking-tight text-ink">64%</p>
          <p className="text-[10px] font-medium text-muted">de chances qu&apos;elle réponde</p>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-sand">
          <div className="h-1.5 w-[64%] rounded-full bg-sun" />
        </div>
        <p className="mt-2 text-[10.5px] leading-snug text-ink/75">Elle a ri puis plus rien. Relance léger, avec une idée concrète.</p>
      </div>
      {[
        ["Drôle", "le frigo a pris 2 cours de ski, il tient debout. un verre jeudi pour fêter ça ?"],
        ["Direct", "on se fait un verre jeudi ? je te raconte mes gamelles"],
        ["Doux", "j'ai repensé à ta photo au ski, ta semaine se passe bien ?"],
      ].map(([t, txt]) => (
        <div key={t} className="rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_-14px_rgba(14,14,18,0.18)]">
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-muted">{t}</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <span className="rounded-[14px] rounded-br-[4px] bg-ink px-2.5 py-1.5 text-[10.5px] leading-snug text-white">{txt}</span>
            <span className="shrink-0 rounded-full bg-sand px-2 py-1 text-[9px] font-semibold text-ink">Copier</span>
          </div>
        </div>
      ))}
      <div className="mt-auto flex items-center justify-between rounded-2xl bg-ink px-3 py-2.5 text-white">
        <span className="text-[11px] font-semibold">⏰ Envoie ce soir vers 21h</span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold">Rappel</span>
      </div>
    </div>
  );
}
