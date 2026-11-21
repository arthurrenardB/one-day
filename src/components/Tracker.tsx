"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Signale la visite puis envoie un battement régulier (présence « en direct »).
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const ping = (beat: boolean) =>
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, beat }),
        keepalive: true,
      }).catch(() => {});
    ping(false);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") ping(true);
    }, 20_000);
    return () => clearInterval(id);
  }, [pathname]);
  return null;
}
