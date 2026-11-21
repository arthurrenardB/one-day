import "server-only";
import { createClient, type Client, type InValue } from "@libsql/client";
import { mkdirSync } from "node:fs";

// Base libSQL : fichier SQLite local par défaut, Turso (libsql://…) en production.
//   DATABASE_URL=libsql://ton-db.turso.io   DATABASE_AUTH_TOKEN=…

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    free_left INTEGER NOT NULL DEFAULT 1,
    prefs TEXT,
    referral_code TEXT UNIQUE,
    stripe_customer_id TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS login_tokens (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    redirect TEXT,
    expires_at INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS entitlements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT NOT NULL,
    expires_at INTEGER,
    credits INTEGER,
    stripe_session_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    autologin_used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS entitlements_user ON entitlements(user_id)`,
  `CREATE INDEX IF NOT EXISTS entitlements_sub ON entitlements(stripe_subscription_id)`,
  `CREATE TABLE IF NOT EXISTS relances (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    input TEXT NOT NULL,
    result TEXT NOT NULL,
    reminder_at INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS relances_user ON relances(user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS anon_usage (
    anon_id TEXT PRIMARY KEY,
    used INTEGER NOT NULL DEFAULT 0,
    ip TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS anon_ip ON anon_usage(ip, created_at)`,
  `CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    anon_id TEXT,
    user_id TEXT,
    created_at INTEGER NOT NULL,
    input TEXT NOT NULL,
    answers TEXT,
    result TEXT NOT NULL,
    unlocked INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS analyses_anon ON analyses(anon_id)`,
  `CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    path TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS visits_time ON visits(created_at)`,
  `CREATE INDEX IF NOT EXISTS visits_visitor ON visits(visitor_id)`,
  `CREATE TABLE IF NOT EXISTS presence (
    visitor_id TEXT PRIMARY KEY,
    last_seen INTEGER NOT NULL,
    path TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS presence_seen ON presence(last_seen)`,
];

const g = globalThis as unknown as { __odDb?: Client; __odReady?: Promise<void> };

function client(): Client {
  if (!g.__odDb) {
    const url = process.env.DATABASE_URL || "file:./data/oneday.db";
    if (url.startsWith("file:")) mkdirSync("./data", { recursive: true });
    g.__odDb = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  }
  return g.__odDb;
}

async function ready() {
  if (!g.__odReady) {
    g.__odReady = client()
      .batch(SCHEMA, "write")
      .then(() => undefined)
      .catch((e) => {
        g.__odReady = undefined;
        throw e;
      });
  }
  return g.__odReady;
}

export async function run(sql: string, args: InValue[] = []) {
  await ready();
  return client().execute({ sql, args });
}

export async function one<T>(sql: string, args: InValue[] = []): Promise<T | null> {
  const r = await run(sql, args);
  return (r.rows[0] as unknown as T) ?? null;
}

export async function all<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  const r = await run(sql, args);
  return r.rows as unknown as T[];
}
