import "server-only";
import { randomUUID } from "node:crypto";
import { PLANS, isPlanId, type PlanId } from "../plans";
import type { Prefs, RelanceResponse } from "../constants";
import type { Relance } from "../schema";
import { all, one, run } from "./db";
import type { User } from "./auth";

export type Entitlement = {
  id: string;
  user_id: string;
  plan: PlanId;
  expires_at: number | null;
  credits: number | null;
  stripe_session_id: string | null;
  stripe_subscription_id: string | null;
  autologin_used: number;
  created_at: number;
};

/** Formule active la plus avantageuse (illimité avant pass conv). */
export async function activeEntitlement(userId: string): Promise<Entitlement | null> {
  const rows = await all<Entitlement>(
    `SELECT * FROM entitlements WHERE user_id = ?
       AND (expires_at IS NULL OR expires_at > ?)
       AND (credits IS NULL OR credits > 0)`,
    [userId, Date.now()],
  );
  const valid = rows.filter((r) => isPlanId(r.plan));
  valid.sort((a, b) => {
    const ua = a.credits === null ? 1 : 0;
    const ub = b.credits === null ? 1 : 0;
    if (ua !== ub) return ub - ua;
    return (b.expires_at ?? Infinity) - (a.expires_at ?? Infinity);
  });
  return valid[0] ?? null;
}

/** Illimité = formule sans compteur de relances (À vie, VIP). */
export const isUnlimitedPlan = (e: Entitlement | null) => !!e && e.credits === null;

/** Attribue une formule. Idempotent par session Stripe. */
export async function grant(opts: {
  userId: string;
  plan: PlanId;
  stripeSessionId?: string | null;
  stripeSubscriptionId?: string | null;
}): Promise<Entitlement> {
  const p = PLANS[opts.plan];
  const now = Date.now();
  if (opts.stripeSessionId) {
    const existing = await one<Entitlement>("SELECT * FROM entitlements WHERE stripe_session_id = ?", [opts.stripeSessionId]);
    if (existing) return existing;
  }
  const id = randomUUID();
  await run(
    `INSERT OR IGNORE INTO entitlements (id, user_id, plan, expires_at, credits, stripe_session_id, stripe_subscription_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      opts.userId,
      opts.plan,
      p.durationHours === null ? null : now + p.durationHours * 3_600_000,
      p.credits ?? null,
      opts.stripeSessionId ?? null,
      opts.stripeSubscriptionId ?? null,
      now,
    ],
  );
  return (await one<Entitlement>(
    opts.stripeSessionId ? "SELECT * FROM entitlements WHERE stripe_session_id = ?" : "SELECT * FROM entitlements WHERE id = ?",
    [opts.stripeSessionId ?? id],
  ))!;
}

/* --------------------------- Crédits de génération --------------------------- */

export type Source =
  | { kind: "plan"; ent: Entitlement }
  | { kind: "free"; userId: string }
  | { kind: "anon"; anonId: string; ip: string };

export async function sourceForUser(user: User): Promise<{ kind: "plan"; ent: Entitlement } | null> {
  const ent = await activeEntitlement(user.id);
  // Paywall direct : seules les formules payées donnent accès aux relances.
  return ent ? { kind: "plan", ent } : null;
}

const ANON_FREE = 1;
const ANON_PER_IP_PER_DAY = 3;

export async function sourceForAnon(anonId: string, ip: string): Promise<Source | null> {
  const row = await one<{ used: number }>("SELECT used FROM anon_usage WHERE anon_id = ?", [anonId]);
  if ((row?.used ?? 0) >= ANON_FREE) return null;
  const ipRow = await one<{ n: number }>(
    "SELECT COALESCE(SUM(used), 0) AS n FROM anon_usage WHERE ip = ? AND created_at > ?",
    [ip, Date.now() - 86_400_000],
  );
  if (Number(ipRow?.n ?? 0) >= ANON_PER_IP_PER_DAY) return null;
  return { kind: "anon", anonId, ip };
}

/** Débite un crédit après une génération réussie. */
export async function consume(src: Source) {
  if (src.kind === "plan") {
    if (src.ent.credits !== null) {
      await run("UPDATE entitlements SET credits = credits - 1 WHERE id = ? AND credits > 0", [src.ent.id]);
    }
  } else if (src.kind === "free") {
    await run("UPDATE users SET free_left = free_left - 1 WHERE id = ? AND free_left > 0", [src.userId]);
  } else {
    await run(
      `INSERT INTO anon_usage (anon_id, used, ip, created_at) VALUES (?, 1, ?, ?)
       ON CONFLICT(anon_id) DO UPDATE SET used = used + 1`,
      [src.anonId, src.ip, Date.now()],
    );
  }
}

export async function anonUsed(anonId: string | null) {
  if (!anonId) return false;
  const row = await one<{ used: number }>("SELECT used FROM anon_usage WHERE anon_id = ?", [anonId]);
  return (row?.used ?? 0) >= ANON_FREE;
}

/* ------------------------------- Profil complet ------------------------------- */

export type MePayload = {
  user: { email: string; prefs: Prefs | null; referralCode: string | null } | null;
  plan: { id: PlanId; expiresAt: number | null; credits: number | null; subscription: boolean } | null;
  freeLeft: number;
  unlimited: boolean;
  history: { id: string; at: number; input: string; result: RelanceResponse; reminderAt: number | null }[];
};

export async function mePayload(user: User | null, anonId: string | null): Promise<MePayload> {
  if (!user) {
    return { user: null, plan: null, freeLeft: (await anonUsed(anonId)) ? 0 : ANON_FREE, unlimited: false, history: [] };
  }
  const ent = await activeEntitlement(user.id);
  const rows = await all<{ id: string; created_at: number; input: string; result: string; reminder_at: number | null }>(
    "SELECT id, created_at, input, result, reminder_at FROM relances WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    [user.id],
  );
  let prefs: Prefs | null = null;
  try {
    prefs = user.prefs ? JSON.parse(user.prefs) : null;
  } catch {}
  return {
    user: { email: user.email, prefs, referralCode: user.referral_code },
    plan:
      ent && isPlanId(ent.plan)
        ? {
            id: ent.plan,
            expiresAt: ent.expires_at === null ? null : Number(ent.expires_at),
            credits: ent.credits === null ? null : Number(ent.credits),
            subscription: !!ent.stripe_subscription_id,
          }
        : null,
    freeLeft: Number(user.free_left),
    unlimited: isUnlimitedPlan(ent),
    history: rows.map((r) => ({
      id: r.id,
      at: Number(r.created_at),
      input: r.input,
      result: JSON.parse(r.result),
      reminderAt: r.reminder_at === null ? null : Number(r.reminder_at),
    })),
  };
}

/* ------------------------------ Aperçu / déblocage ------------------------------ */

/** Ce qu'on montre avant paiement : la météo, pas les relances. */
export function teaserOf(full: Relance) {
  return {
    ...full,
    strategy: "",
    send_at: "",
    goodbye: "",
    replies: full.replies.map((r) => ({ tone: r.tone, text: "" })),
    locked: full.replies.length,
    teaser: true,
  };
}

/** Ajoute une analyse débloquée à l'historique du membre. */
export async function unlockedRecord(userId: string, analysisId: string, input: string, full: Relance) {
  await run("INSERT OR IGNORE INTO relances (id, user_id, created_at, input, result) VALUES (?, ?, ?, ?, ?)", [
    analysisId,
    userId,
    Date.now(),
    input,
    JSON.stringify(full),
  ]);
}
