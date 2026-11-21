import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { one, run } from "./db";

export const SESSION_COOKIE = "od_session";
export const ANON_COOKIE = "od_anon";
const SESSION_DAYS = 60;
const LOGIN_TOKEN_MINUTES = 20;

export type User = {
  id: string;
  email: string;
  free_left: number;
  prefs: string | null;
  referral_code: string | null;
  stripe_customer_id: string | null;
  created_at: number;
};

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const token = () => randomBytes(32).toString("base64url");

export function normalizeEmail(e: unknown): string | null {
  if (typeof e !== "string") return null;
  const v = e.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254 ? v : null;
}

/** Chemin de redirection interne uniquement (évite les open redirects). */
export function safeRedirect(p: unknown, fallback = "/app") {
  return typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && !p.includes("\\") ? p : fallback;
}

/* ------------------------------ Utilisateurs ------------------------------ */

/** Renvoie l'utilisateur et `created: true` s'il vient d'être créé par cet appel. */
export async function upsertUser(email: string, opts?: { freeLeft?: number }): Promise<{ user: User; created: boolean }> {
  const existing = await one<User>("SELECT * FROM users WHERE email = ?", [email]);
  if (existing) return { user: existing, created: false };
  const id = randomUUID();
  const code = randomBytes(4).toString("hex").toUpperCase();
  await run(
    "INSERT OR IGNORE INTO users (id, email, created_at, free_left, referral_code) VALUES (?, ?, ?, ?, ?)",
    [id, email, Date.now(), opts?.freeLeft ?? 1, code],
  );
  const user = (await one<User>("SELECT * FROM users WHERE email = ?", [email]))!;
  return { user, created: user.id === id };
}

export async function findOrCreateUser(email: string, opts?: { freeLeft?: number }): Promise<User> {
  return (await upsertUser(email, opts)).user;
}

/* -------------------------------- Lien magique -------------------------------- */

export async function createLoginToken(email: string, redirect: string) {
  const t = token();
  await run("INSERT INTO login_tokens (token_hash, email, redirect, expires_at) VALUES (?, ?, ?, ?)", [
    sha256(t),
    email,
    redirect,
    Date.now() + LOGIN_TOKEN_MINUTES * 60_000,
  ]);
  return t;
}

export async function consumeLoginToken(t: string) {
  const hash = sha256(t);
  // Usage unique : on marque le jeton avant de le lire.
  const res = await run("UPDATE login_tokens SET used = 1 WHERE token_hash = ? AND used = 0 AND expires_at > ?", [
    hash,
    Date.now(),
  ]);
  if (res.rowsAffected !== 1) return null;
  return one<{ email: string; redirect: string | null }>("SELECT email, redirect FROM login_tokens WHERE token_hash = ?", [hash]);
}

/* --------------------------------- Sessions --------------------------------- */

export async function startSession(userId: string) {
  const t = token();
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  await run("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", [sha256(t), userId, expires]);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, t, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  const jar = await cookies();
  const t = jar.get(SESSION_COOKIE)?.value;
  if (t) await run("DELETE FROM sessions WHERE token_hash = ?", [sha256(t)]);
  jar.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const t = jar.get(SESSION_COOKIE)?.value;
  if (!t) return null;
  return one<User>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
    [sha256(t), Date.now()],
  );
}

/* --------------------------- Visiteur sans compte --------------------------- */

export async function anonId(create: boolean): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing && /^[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing;
  if (!create) return null;
  const id = token();
  jar.set(ANON_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 86_400,
  });
  return id;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

/** E-mails de démo (DEMO_EMAILS, séparés par des virgules) : connexion directe, accès « À vie ». */
export function isDemoEmail(email: string) {
  const list = (process.env.DEMO_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
