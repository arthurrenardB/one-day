import type { Goal, Relance, RelanceRequest, Tone } from "./schema";

// Réponses de démonstration utilisées quand ANTHROPIC_API_KEY n'est pas configurée.

type Scenario = Omit<Relance, "last_message" | "contact_name" | "app" | "replies"> & {
  replies: Record<Tone, string[]>;
};

const SCENARIOS: { match: RegExp; s: Scenario }[] = [
  {
    match: /^(haha+|hahah|mdr+|ptdr|lol|😂|🤣)/i,
    s: {
      weather: "nuageux",
      score: 68,
      verdict: "Elle a ri, puis plus rien. La porte est ouverte.",
      signals: ["Un rire sans question", "Aucune relance de sa part", "Ton positif"],
      reading: "Un « haha » seul, c'est poli mais ça ne relance rien. Elle attend que tu apportes la suite.",
      strategy: "Rebondis sur ta propre blague avec une idée concrète, sans demander pourquoi elle répond peu.",
      replies: {
        drole: ["ok je note que t'as ri, c'est officiel je suis drôle. je te le prouve jeudi autour d'un verre ?"],
        cash: ["j'aime bien te faire rire. un verre cette semaine, mardi ou jeudi ?"],
        tendre: ["ton rire m'a fait plaisir. ta semaine se passe bien ?"],
        taquin: ["« haha » c'est tout ? je mérite au moins un emoji là 😤"],
      },
      send_at: "ce soir vers 21h",
      goodbye: "",
    },
  },
  {
    match: /^(vu|seen|lu)\b/i,
    s: {
      weather: "pluie",
      score: 41,
      verdict: "Un « Vu » n'est pas un non. Juste un message sans accroche.",
      signals: ["Message vu sans réponse", "Silence depuis plusieurs jours", "Dernière question fermée"],
      reading: "Ton dernier message demandait un effort sans donner envie. Elle l'a laissé glisser.",
      strategy: "Change d'angle avec quelque chose de léger et facile à répondre, sans reproche.",
      replies: {
        drole: ["je viens de voir passer un chien qui te ressemblait trop. bref. ton son du moment ?"],
        cash: ["je relance parce que j'avais vraiment envie de te parler. un café ce week-end ?"],
        tendre: ["pas grave pour le vu 😌 j'espère que ta semaine est moins chargée que la mienne"],
        taquin: ["t'as mis un vu à mon meilleur message. je te laisse une seconde chance"],
      },
      send_at: "demain vers 19h",
      goodbye: "",
    },
  },
  {
    match: /(jsp|je sais pas|dispo|on verra|peut[- ]être|ptet|chargée|crevée)/i,
    s: {
      weather: "nuageux",
      score: 57,
      verdict: "Elle hésite. Rends le oui plus simple à dire.",
      signals: ["Réponse floue", "Pas de refus clair", "Elle ne propose pas d'alternative"],
      reading: "« Jsp si je suis dispo » veut souvent dire que l'idée est trop vague pour s'engager.",
      strategy: "Propose deux options précises et courtes, sans insister.",
      replies: {
        drole: ["je te propose un deal : 1 verre, 45 min chrono, et tu peux partir si je suis nul"],
        cash: ["mercredi 19h ou samedi 17h, je m'adapte. ça te dit ?"],
        tendre: ["aucune pression, dis-moi juste quand t'es plus tranquille et on cale ça"],
        taquin: ["t'es plus dure à booker qu'un resto étoilé 😏 mercredi ou samedi ?"],
      },
      send_at: "demain midi",
      goodbye: "",
    },
  },
  {
    match: /(arr[eê]te|stop|pas int[ée]ress|laisse[- ]moi|bloque)/i,
    s: {
      weather: "tempete",
      score: 4,
      verdict: "Elle a posé une limite claire. On respecte.",
      signals: ["Refus explicite", "Demande d'arrêter"],
      reading: "Ce message ferme la porte. Relancer serait insistant et contre-productif.",
      strategy: "Pas de relance. Un dernier mot élégant, puis tu passes à autre chose.",
      replies: {
        drole: ["compris 🙂 bonne continuation"],
        cash: ["ok, je te laisse tranquille. bonne journée"],
        tendre: ["pas de souci, merci d'avoir été claire. prends soin de toi"],
        taquin: ["compris 🙂 bonne continuation"],
      },
      send_at: "maintenant, puis on passe à autre chose",
      goodbye: "pas de souci, merci d'avoir été claire. prends soin de toi",
    },
  },
  {
    match: /^(ok|okay|oki|d'?acc?|dac|ouais|ah ok|bien|cool|👍|tkt)(\s|$|[!.?,])/i,
    s: {
      weather: "pluie",
      score: 46,
      verdict: "Réponse sèche. Il faut remettre du neuf.",
      signals: ["Réponse en un mot", "Aucune question en retour", "Pas d'emoji ni d'élan"],
      reading: "Un message très court, c'est soit de la fatigue, soit une conv qui tourne en rond.",
      strategy: "Apporte un sujet neuf et une perche facile, sans commenter son ton.",
      replies: {
        drole: ["question sérieuse : t'es plutôt team pizza ananas ou t'as des principes ?"],
        cash: ["on se capte en vrai ? un verre jeudi, je te raconte ma semaine improbable"],
        tendre: ["j'ai repensé à ce que tu m'as dit sur ton taf, ça s'est arrangé ?"],
        taquin: ["« ok » ? tu me brises le cœur là 💀 raconte-moi un truc cool de ta journée"],
      },
      send_at: "ce soir vers 20h30",
      goodbye: "",
    },
  },
];

const FALLBACK: Scenario = {
  weather: "nuageux",
  score: 62,
  verdict: "La conv a ralenti mais l'intérêt est là.",
  signals: ["Échange qui s'essouffle", "Pas de question en retour", "Aucun signal négatif"],
  reading: "Rien d'alarmant : la conv manque juste d'un nouveau souffle.",
  strategy: "Relance avec une touche perso et une question facile, puis propose de se voir.",
  replies: {
    drole: ["j'ai une théorie : les meilleures convs ont toutes un deuxième souffle. on teste ?"],
    cash: ["j'ai bien aimé te parler. un verre cette semaine pour continuer en vrai ?"],
    tendre: ["je pensais à toi en passant devant un café trop mignon. ta semaine se passe bien ?"],
    taquin: ["tu m'as oublié ou tu prépares une réponse de 3 pages ? 😏"],
  },
  send_at: "ce soir vers 21h",
  goodbye: "",
};

function goalTwist(text: string, goal: Goal, tone: Tone) {
  if (goal === "numero" && tone === "cash") return "on continue sur whatsapp ? ce sera plus simple pour s'organiser";
  return text;
}

export function demoRelance(req: RelanceRequest): Relance {
  const msg = (req.message ?? "").trim();
  const found = SCENARIOS.find((x) => x.match.test(msg))?.s ?? FALLBACK;
  const tones: Tone[] = req.tone === "mix" ? ["drole", "cash", "tendre"] : [req.tone, req.tone, req.tone];
  const variants: Record<Tone, string[]> = {
    ...found.replies,
  };
  const replies = tones.map((tone, i) => {
    const pool = variants[tone];
    const base = req.tone === "mix" ? pool[0] : [pool[0], FALLBACK.replies[tone][0], SCENARIOS[4].s.replies[tone][0]][i];
    return { tone, text: goalTwist(base, req.goal, tone) };
  });
  return {
    ...found,
    replies,
    last_message: msg || "(capture d'écran)",
    contact_name: "",
    app: "",
  };
}
