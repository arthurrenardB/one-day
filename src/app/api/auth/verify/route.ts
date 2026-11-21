import { NextResponse } from "next/server";
import { anonId, consumeLoginToken, findOrCreateUser, safeRedirect, startSession } from "@/lib/server/auth";
import { anonUsed } from "@/lib/server/entitlements";

export const runtime = "nodejs";

// POST (et non GET) pour que les antivirus de messagerie qui « cliquent » les liens ne consomment pas le jeton.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token : "";
  const row = token ? await consumeLoginToken(token) : null;
  if (!row) return NextResponse.json({ error: "Lien expiré ou déjà utilisé." }, { status: 400 });

  // Un visiteur qui a déjà utilisé sa relance offerte sans compte ne la récupère pas en s'inscrivant.
  const alreadyUsed = await anonUsed(await anonId(false));
  const user = await findOrCreateUser(row.email, { freeLeft: alreadyUsed ? 0 : 1 });
  await startSession(user.id);
  return NextResponse.json({ ok: true, next: safeRedirect(row.redirect) });
}
