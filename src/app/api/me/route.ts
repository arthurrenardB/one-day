import { NextResponse } from "next/server";
import { anonId, currentUser } from "@/lib/server/auth";
import { run } from "@/lib/server/db";
import { mePayload } from "@/lib/server/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return NextResponse.json(await mePayload(user, user ? null : await anonId(false)));
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const p = body?.prefs ?? {};
  const prefs = {
    emojis: ["souvent", "parfois", "jamais"].includes(p.emojis) ? p.emojis : "parfois",
    majuscules: !!p.majuscules,
    longueur: p.longueur === "moyen" ? "moyen" : "court",
    prenom: typeof p.prenom === "string" && p.prenom.trim() ? p.prenom.trim().slice(0, 40) : undefined,
  };
  await run("UPDATE users SET prefs = ? WHERE id = ?", [JSON.stringify(prefs), user.id]);
  return NextResponse.json({ ok: true, prefs });
}
