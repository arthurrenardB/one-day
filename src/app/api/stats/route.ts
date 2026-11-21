import { NextResponse } from "next/server";
import { one } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Chiffres publics réels : analyses faites sur le site + visiteurs actifs « en direct ».
export async function GET() {
  try {
    const a = await one<{ n: number }>("SELECT COUNT(*) AS n FROM relances");
    const b = await one<{ n: number }>("SELECT COALESCE(SUM(used), 0) AS n FROM anon_usage");
    const live = await one<{ n: number }>("SELECT COUNT(*) AS n FROM presence WHERE last_seen > ?", [Date.now() - 45_000]);
    return NextResponse.json({
      relances: Number(a?.n ?? 0) + Number(b?.n ?? 0),
      live: Number(live?.n ?? 0),
    });
  } catch {
    return NextResponse.json({ relances: null, live: 0 });
  }
}
