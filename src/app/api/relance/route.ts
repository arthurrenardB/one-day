import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { demoRelance } from "@/lib/demo";
import { DELAYS, GOALS, GOAL_LABEL, RELATIONS, RelanceSchema, TONES, TONE_LABEL, type Prefs, type Relance, type RelanceRequest } from "@/lib/schema";
import { anonId, clientIp, currentUser } from "@/lib/server/auth";
import { run } from "@/lib/server/db";
import { consume, isUnlimitedPlan, sourceForUser, teaserOf, unlockedRecord } from "@/lib/server/entitlements";
import { limited } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";

const SYSTEM = `Tu es One Day, un coach de messages pour les applis de rencontre et les réseaux (Tinder, Hinge, Bumble, Instagram, Snapchat, WhatsApp, SMS).
On te donne le dernier message reçu (en texte ou en capture d'écran) d'une conversation qui s'essouffle. Ton travail :
1. Évaluer la « météo » de la conv : soleil (ça répond bien), nuageux (ça flotte), pluie (ça s'essouffle), tempete (c'est fini ou la personne a posé une limite).
2. Donner un score de 0 à 100 : les chances que la conv reparte.
3. Écrire exactement 3 relances prêtes à envoyer.

Règles d'écriture des relances :
- Écris comme un vrai message de téléphone en français courant : court, naturel, sans formules de politesse, sans tiret long, sans point final systématique.
- Respecte le style de l'utilisateur (émojis, majuscules, longueur) quand il est fourni. Par défaut : minuscules, 1 émoji max, 1 à 2 phrases.
- Jamais de reproche (« tu réponds plus ? »), jamais de commentaire sur sa sécheresse, jamais de culpabilisation.
- Apporte du neuf : un rebond sur un détail de la conv, une question facile, ou une proposition concrète (jour + activité).
- Pas de phrases de drague toutes faites, pas de compliments physiques lourds, pas de sous-entendus sexuels.
- Le registre change selon le ton demandé : drole (humour, autodérision), cash (direct, propose quelque chose), tendre (attentionné, doux), taquin (joueur, léger défi).

Respect et consentement :
- Si le message exprime un refus, une demande d'arrêter, de l'inconfort ou une limite, la météo est « tempete », le score est bas, et les 3 relances sont des sorties élégantes qui respectent la décision (aucune tentative de faire changer d'avis). Remplis alors « goodbye » avec la meilleure.
- Ne propose jamais de manipuler, de mentir, d'insister lourdement ou de contourner un refus.

Pour « send_at », indique un créneau naturel (« ce soir vers 21h », « demain midi »…).
Les signaux sont des constats concrets et très courts (5 à 8 mots).`;

const IMAGE_RE = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/;

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (limited(`relance:${ip}`, 25, 10 * 60_000)) {
    return NextResponse.json({ error: "Doucement 😅 Réessaie dans quelques minutes." }, { status: 429 });
  }

  let body: RelanceRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.slice(0, 2000).trim() : "";
  const image = typeof body.image === "string" ? body.image : "";
  const context = typeof body.context === "string" ? body.context.slice(0, 600).trim() : "";
  const a = body.answers ?? {};
  const rawGoal = a.goal ?? body.goal;
  const goal = GOALS.includes(rawGoal as never) ? rawGoal! : "relancer";
  const rawTone = a.tone ?? body.tone;
  const tone = rawTone === "mix" || TONES.includes(rawTone as never) ? rawTone! : "mix";
  const relation = a.relation && a.relation in RELATIONS ? a.relation : null;
  const delay = a.delay && a.delay in DELAYS ? a.delay : null;
  const answers = { relation, goal, delay, tone };

  if (!message && !image) {
    return NextResponse.json({ error: "Colle son dernier message ou ajoute une capture." }, { status: 400 });
  }
  const imgMatch = image ? IMAGE_RE.exec(image) : null;
  if (image && (!imgMatch || image.length > 6_000_000)) {
    return NextResponse.json({ error: "Capture illisible ou trop lourde (5 Mo max)." }, { status: 400 });
  }

  // Paywall direct : sans formule payée, on génère l'analyse mais on ne renvoie qu'un aperçu
  // (météo + score). Les relances se débloquent après paiement via /api/analyses/[id]/unlock.
  const user = await currentUser();
  const source = user ? await sourceForUser(user) : null;
  const unlimited = !!source && isUnlimitedPlan(source.ent);
  if (tone === "taquin" && !unlimited) {
    return NextResponse.json({ error: "Le ton Taquin est inclus dans l'offre À vie.", code: "locked" }, { status: 402 });
  }
  if (!source && limited(`teaser:${ip}`, 8, 86_400_000)) {
    return NextResponse.json({ error: "Tu as fait beaucoup d'analyses aujourd'hui. Débloque One Day pour continuer." }, { status: 429 });
  }
  const anon = user ? null : await anonId(true);

  let prefs: Prefs | null = null;
  try {
    prefs = user?.prefs ? JSON.parse(user.prefs) : null;
  } catch {}

  const finish = async (full: Relance & { demo?: boolean }) => {
    const id = randomUUID();
    const input = (message || "(capture)").slice(0, 300);
    await run(
      "INSERT INTO analyses (id, anon_id, user_id, created_at, input, answers, result, unlocked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, anon, user?.id ?? null, Date.now(), input, JSON.stringify(answers), JSON.stringify(full), source ? 1 : 0],
    );
    if (source) {
      await consume(source);
      await unlockedRecord(user!.id, id, input, full);
      return NextResponse.json({ ...full, id });
    }
    return NextResponse.json({ ...teaserOf(full), id });
  };

  // Mode démo : pas de clé API configurée.
  if (!process.env.ANTHROPIC_API_KEY) {
    await new Promise((r) => setTimeout(r, 1400));
    return finish({ ...demoRelance({ ...body, message, goal, tone }), demo: true });
  }

  const p = prefs;
  const styleLine = p
    ? `Style de l'utilisateur : émojis ${p.emojis}, ${p.majuscules ? "avec majuscules" : "tout en minuscules"}, messages ${p.longueur}s.${p.prenom ? ` Il s'appelle ${p.prenom.slice(0, 40)}.` : ""}`
    : "Style de l'utilisateur : inconnu, utilise le style par défaut.";
  const toneLine =
    tone === "mix"
      ? `Écris une relance par ton : ${TONE_LABEL.drole} (drole), ${TONE_LABEL.cash} (cash), ${TONE_LABEL.tendre} (tendre).`
      : `Écris 3 variantes différentes, toutes dans le ton ${TONE_LABEL[tone]} (${tone}).`;

  const text = [
    message ? `Dernier message reçu : « ${message} »` : "Le dernier message est sur la capture d'écran jointe : lis toute la conv visible.",
    context ? `Contexte donné par l'utilisateur : ${context}` : "",
    relation ? `Relation avec cette personne : ${RELATIONS[relation]}.` : "",
    delay ? `Temps écoulé sans réponse : ${DELAYS[delay]}.` : "",
    `Objectif : ${GOAL_LABEL[goal]}.`,
    styleLine,
    toneLine,
  ]
    .filter(Boolean)
    .join("\n");

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (imgMatch) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imgMatch[1] as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
        data: imgMatch[2],
      },
    });
  }
  content.push({ type: "text", text });

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(RelanceSchema) },
      system: SYSTEM,
      messages: [{ role: "user", content }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "On ne peut pas aider sur cette conv-là." }, { status: 422 });
    }
    const out = response.parsed_output;
    if (!out) {
      return NextResponse.json({ error: "Réponse incomplète, réessaie." }, { status: 502 });
    }
    out.score = Math.max(0, Math.min(100, Math.round(out.score)));
    out.replies = out.replies.slice(0, 3);
    return finish(out);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Beaucoup de monde en ce moment, réessaie dans une minute." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API error", error.status, error.message);
      return NextResponse.json({ error: "One Day a eu un raté. Réessaie." }, { status: 502 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur inattendue." }, { status: 500 });
  }
}
