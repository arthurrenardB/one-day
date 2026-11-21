import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { run } from "@/lib/server/db";
import { activeEntitlement, isUnlimitedPlan } from "@/lib/server/entitlements";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi.", code: "auth" }, { status: 401 });
  if (!isUnlimitedPlan(await activeEntitlement(user.id))) {
    return NextResponse.json({ error: "Les rappels sont inclus dans l'offre À vie.", code: "locked" }, { status: 402 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const at = Number(body?.at);
  if (!Number.isFinite(at) || at < Date.now() - 60_000 || at > Date.now() + 14 * 86_400_000) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  const res = await run("UPDATE relances SET reminder_at = ? WHERE id = ? AND user_id = ?", [at, id, user.id]);
  if (res.rowsAffected !== 1) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
