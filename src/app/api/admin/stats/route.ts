import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin";
import { all, one } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const n = (v: unknown) => Number(v ?? 0);

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const now = Date.now();

  const live = await one<{ c: number }>("SELECT COUNT(*) AS c FROM presence WHERE last_seen > ?", [now - 45_000]);
  const uniques = await one<{ c: number }>("SELECT COUNT(DISTINCT visitor_id) AS c FROM visits");
  const views = await one<{ c: number }>("SELECT COUNT(*) AS c FROM visits");
  const today = await one<{ c: number }>("SELECT COUNT(DISTINCT visitor_id) AS c FROM visits WHERE created_at > ?", [now - 86_400_000]);

  // Visiteurs uniques par jour, 7 derniers jours.
  const days = await all<{ d: string; c: number }>(
    `SELECT strftime('%Y-%m-%d', created_at / 1000, 'unixepoch') AS d, COUNT(DISTINCT visitor_id) AS c
     FROM visits WHERE created_at > ? GROUP BY d ORDER BY d`,
    [now - 7 * 86_400_000],
  );
  // Pages les plus vues (top 6).
  const pages = await all<{ path: string; c: number }>(
    "SELECT path, COUNT(*) AS c FROM visits GROUP BY path ORDER BY c DESC LIMIT 6",
  );

  return NextResponse.json({
    live: n(live?.c),
    uniques: n(uniques?.c),
    views: n(views?.c),
    today: n(today?.c),
    days: days.map((x) => ({ d: x.d, c: n(x.c) })),
    pages: pages.map((x) => ({ path: x.path || "/", c: n(x.c) })),
  });
}
