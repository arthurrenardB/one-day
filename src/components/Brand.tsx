import Link from "next/link";

export function SunMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" fill="#0E0E12" />
      <path d="M9 26a11 11 0 0 1 22 0Z" fill="#FF5B23" />
      <g stroke="#FF5B23" strokeWidth="2.2" strokeLinecap="round">
        <path d="M20 8.5v3.2M10.6 12.4l2.2 2.2M29.4 12.4l-2.2 2.2M6.8 21h3M30.2 21h3" />
      </g>
      <path d="M7 29.5h26" stroke="#F6F4F0" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="One Day, accueil">
      <SunMark />
      <span className={`text-[20px] font-semibold tracking-tight ${dark ? "text-cream" : "text-ink"}`}>
        one day
      </span>
    </Link>
  );
}
