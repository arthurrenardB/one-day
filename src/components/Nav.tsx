"use client";

import Link from "next/link";
import { useState } from "react";
import { useMe } from "@/lib/store";
import { Logo } from "./Brand";

const LINKS = [
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/#exemples", label: "Exemples" },
  { href: "/offres", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const me = useMe();
  const account = me.user ? { href: "/app", label: "Mon espace" } : { href: "/connexion", label: "Connexion" };
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-full bg-white/80 py-2 pl-5 pr-2 shadow-soft ring-1 ring-black/[0.05] backdrop-blur-xl">
        <Logo />
        <div className="hidden items-center gap-8 text-[14px] font-medium text-ink/70 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors duration-300 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-1 md:flex">
          <Link href={account.href} className="rounded-full px-4 py-2 text-[14px] font-medium text-ink/80 transition-colors hover:text-ink">
            {account.label}
          </Link>
          <Link
            href="/#essayer"
            className="ease-spring rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white transition duration-500 hover:bg-ink-2 active:scale-[0.98]"
          >
            Analyser ma conv
          </Link>
        </div>
        <button
          className="relative h-10 w-10 rounded-full md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`ease-spring absolute left-3 right-3 h-[1.5px] rounded bg-ink transition duration-500 ${open ? "top-1/2 rotate-45" : "top-[15px]"}`} />
          <span className={`ease-spring absolute left-3 right-3 h-[1.5px] rounded bg-ink transition duration-500 ${open ? "top-1/2 -rotate-45" : "top-[23px]"}`} />
        </button>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-5xl rounded-[28px] bg-white/95 p-3 shadow-soft ring-1 ring-black/[0.05] backdrop-blur-xl md:hidden">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="reveal block rounded-2xl px-4 py-3.5 text-lg font-medium hover:bg-cream"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link href={account.href} className="rounded-full px-3 py-3 text-center font-medium ring-1 ring-black/10">
              {account.label}
            </Link>
            <Link href="/#essayer" onClick={() => setOpen(false)} className="rounded-full bg-ink px-3 py-3 text-center font-medium text-white">
              Analyser
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
