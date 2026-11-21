"use client";

import { useSyncExternalStore } from "react";
import { PLANS, type PlanId } from "./plans";
import type { Prefs, RelanceResponse } from "./constants";

// État côté client = reflet de /api/me. Les droits sont vérifiés côté serveur.

export type HistoryItem = { id: string; at: number; input: string; result: RelanceResponse; reminderAt: number | null };
export type Me = {
  loaded: boolean;
  user: { email: string; prefs: Prefs | null; referralCode: string | null } | null;
  plan: { id: PlanId; expiresAt: number | null; credits: number | null; subscription: boolean } | null;
  freeLeft: number;
  unlimited: boolean;
  history: HistoryItem[];
};

const EMPTY: Me = { loaded: false, user: null, plan: null, freeLeft: 1, unlimited: false, history: [] };

let state: Me = EMPTY;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: Me) {
  state = next;
  listeners.forEach((l) => l());
}

export function refresh(): Promise<void> {
  if (!inflight) {
    inflight = fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => set({ ...d, loaded: true }))
      .catch(() => set({ ...state, loaded: true }))
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useMe(): Me {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      if (!state.loaded && !inflight) refresh();
      return () => listeners.delete(l);
    },
    () => state,
    () => EMPTY,
  );
}

export async function savePrefs(prefs: Prefs) {
  set({ ...state, user: state.user ? { ...state.user, prefs } : state.user });
  await fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefs }),
  });
  await refresh();
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.replace(window.location.origin + "/");
}

export function planLabel(me: Me) {
  const p = me.plan;
  if (!p) return "Aucune offre active";
  const name = PLANS[p.id].name;
  if (p.credits !== null) return `${p.credits} relance${p.credits > 1 ? "s" : ""} restante${p.credits > 1 ? "s" : ""}`;
  if (p.expiresAt === null) return `${name} · illimité`;
  const h = Math.max(1, Math.round((p.expiresAt - Date.now()) / 3_600_000));
  return `${name} · ${h > 48 ? `${Math.round(h / 24)} j` : `${h} h`} restant${h > 1 ? "s" : ""}`;
}
