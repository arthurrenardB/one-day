import { NextResponse } from "next/server";
import { anonId, currentUser } from "@/lib/server/auth";
import { one, run } from "@/lib/server/db";
import { consume, sourceForUser, unlockedRecord } from "@/lib/server/entitlements";

export const runtime = "nodejs";

type Row = { id: string; anon_id: string | null; user_id: string | null; input: string; result: string; unlocked: number };

// Débloque une analyse faite avant l'achat (même navigateur) ou déjà rattachée au membre.
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi.", code: "auth" }, { status: 401 });
  const { id } = await ctx.params;
  const row = await one<Row>("SELECT * FROM analyses WHERE id = ?", [id]);
  if (!row) return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });

  const anon = await anonId(false);
  const mine = row.user_id === user.id || (!row.user_id && !!anon && row.anon_id === anon);
  if (!mine) return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });

  const full = JSON.parse(row.result);
  if (row.unlocked && row.user_id === user.id) return NextResponse.json({ ...full, id });

  const source = await sourceForUser(user);
  if (!source) return NextResponse.json({ error: "Débloque One Day pour voir tes relances.", code: "paywall" }, { status: 402 });

  const res = await run("UPDATE analyses SET user_id = ?, unlocked = 1 WHERE id = ? AND unlocked = 0", [user.id, id]);
  if (res.rowsAffected === 1) await consume(source);
  await unlockedRecord(user.id, id, row.input, full);
  return NextResponse.json({ ...full, id });
}
