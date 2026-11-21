import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { run } from "@/lib/server/db";

export const runtime = "nodejs";

const VID = "od_vid";

// Comptage visiteurs + présence « en direct ». Appelé au chargement (visite) puis en heartbeat (beat).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const path = typeof body?.path === "string" ? body.path.slice(0, 200) : "/";
  if (path.startsWith("/admin")) return NextResponse.json({ ok: true });

  const jar = await cookies();
  let vid = jar.get(VID)?.value;
  if (!vid || !/^[A-Za-z0-9_-]{16,64}$/.test(vid)) {
    vid = randomUUID().replace(/-/g, "");
    jar.set(VID, vid, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 365 * 86400 });
  }
  const now = Date.now();

  await run(
    `INSERT INTO presence (visitor_id, last_seen, path) VALUES (?, ?, ?)
     ON CONFLICT(visitor_id) DO UPDATE SET last_seen = excluded.last_seen, path = excluded.path`,
    [vid, now, path],
  );
  if (!body?.beat) {
    await run("INSERT INTO visits (id, visitor_id, path, created_at) VALUES (?, ?, ?, ?)", [randomUUID(), vid, path, now]);
  }
  return NextResponse.json({ ok: true });
}
