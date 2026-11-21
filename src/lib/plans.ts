// Toute la grille tarifaire de One Day est ici : modifie les prix / textes à un seul endroit.
// 3 offres, sans abonnement. « VIP » sert d'ancrage de prix pour rendre « À vie » évidente.

export type PlanId = "pack10" | "lifetime" | "vip";

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // en euros TTC
  period: string; // affiché après le prix
  kind: "one_time" | "subscription";
  pitch: string;
  badge?: string;
  compareAt?: number; // prix barré affiché à côté (ancrage)
  features: string[];
  cta: string;
  // Durée d'accès en heures (null = à vie). `credits` = nombre de relances (absent = illimité).
  durationHours: number | null;
  credits?: number;
};

export const PLANS: Record<PlanId, Plan> = {
  pack10: {
    id: "pack10",
    name: "10 relances",
    price: 4.9,
    period: "une fois",
    kind: "one_time",
    pitch: "Pour relancer une ou deux convs qui comptent.",
    features: ["10 relances, sans date limite", "Analyse de chaque conv", "Tons Drôle, Cash, Tendre"],
    cta: "Prendre 10 relances",
    durationHours: null,
    credits: 10,
  },
  lifetime: {
    id: "lifetime",
    name: "À vie",
    price: 2.9,
    period: "une fois",
    kind: "one_time",
    pitch: "Toutes tes convs, illimité, pour toujours.",
    badge: "Le + choisi",
    features: [
      "Relances illimitées, à vie",
      "Les 4 tons, Taquin compris",
      "Rappels au bon moment",
      "Ton style mémorisé",
      "Toutes les futures nouveautés",
    ],
    cta: "Débloquer à vie",
    durationHours: null,
  },
  vip: {
    id: "vip",
    name: "VIP",
    price: 34,
    period: "une fois",
    kind: "one_time",
    pitch: "L'accès à vie, plus un vrai coup de main sur ton profil.",
    features: [
      "Tout de l'offre À vie",
      "Audit de ton profil Tinder / Hinge : bio, photos, prompts",
      "100 premières phrases et réponses aux stories",
      "Support prioritaire",
    ],
    cta: "Devenir VIP",
    durationHours: null,
  },
};

/** Ordre d'affichage : l'offre chère à droite pour servir d'ancrage. */
export const PLAN_ORDER: PlanId[] = ["lifetime", "vip"];
export const FEATURED: PlanId = "lifetime";

// Downsell « intention de sortie » : accès à vie à prix cassé.
export const DOWNSELL = { plan: "lifetime" as PlanId, price: 1.5, compareAt: 2.9 };

export const FREE_RELANCES = 1;

export const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }) + " €";

export function isPlanId(v: unknown): v is PlanId {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(PLANS, v);
}
