// Constantes partagées client/serveur (sans zod, pour alléger le bundle client).

export const TONES = ["drole", "cash", "tendre", "taquin"] as const;
export type Tone = (typeof TONES)[number];

export const TONE_LABEL: Record<Tone, string> = {
  drole: "Drôle",
  cash: "Cash",
  tendre: "Tendre",
  taquin: "Taquin",
};

export const WEATHERS = ["soleil", "nuageux", "pluie", "tempete"] as const;
export type Weather = (typeof WEATHERS)[number];

export const WEATHER_META: Record<Weather, { emoji: string; label: string; hint: string; color: string }> = {
  soleil: { emoji: "☀️", label: "Ensoleillé", hint: "Ça répond, ça accroche. Fonce.", color: "#F5A524" },
  nuageux: { emoji: "⛅", label: "Nuageux", hint: "Ça flotte, mais rien n'est perdu.", color: "#FF8A3D" },
  pluie: { emoji: "🌧️", label: "Pluie", hint: "Ça s'essouffle. Il faut du neuf.", color: "#6C7BD8" },
  tempete: { emoji: "🌪️", label: "Tempête", hint: "C'est sûrement fini. Sors avec classe.", color: "#5B556E" },
};

export const GOALS = ["relancer", "date", "numero", "lien"] as const;
export type Goal = (typeof GOALS)[number];
export const GOAL_LABEL: Record<Goal, string> = {
  relancer: "Relancer la conv",
  date: "Décrocher un date",
  numero: "Avoir son 06",
  lien: "Garder le lien, sans pression",
};

export const RELATIONS = {
  match: "Un match, on ne s'est pas encore vus",
  vus: "On s'est déjà vus",
  crush: "Un crush (ami·e, collègue…)",
  ex: "Un·e ex",
} as const;
export type Relation = keyof typeof RELATIONS;

export const DELAYS = {
  "24h": "Moins de 24 h",
  "3j": "1 à 3 jours",
  "7j": "4 à 7 jours",
  plus: "Plus d'une semaine",
} as const;
export type Delay = keyof typeof DELAYS;

export type Answers = { relation: Relation; goal: Goal; delay: Delay; tone: Tone | "mix" };


export type Prefs = {
  emojis: "souvent" | "parfois" | "jamais";
  majuscules: boolean;
  longueur: "court" | "moyen";
  prenom?: string;
};

export type RelanceRequest = {
  message?: string;
  image?: string; // data URL
  context?: string;
  goal: Goal;
  tone: Tone | "mix";
  prefs?: Prefs | null;
  answers?: Partial<Answers>;
};

export type RelanceResponse = import("./schema").Relance & { demo?: boolean; id?: string | null; example?: boolean; locked?: number; teaser?: boolean };
