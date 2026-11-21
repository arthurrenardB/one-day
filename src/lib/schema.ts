import { z } from "zod";
import { TONES, WEATHERS } from "./constants";

export * from "./constants";

export const RelanceSchema = z.object({
  last_message: z.string().describe("Le dernier message reçu, recopié tel quel (lu sur la capture si besoin)."),
  contact_name: z.string().describe("Prénom ou pseudo de la personne si visible, sinon chaîne vide."),
  app: z.string().describe("Appli détectée (Instagram, Tinder, Hinge, Snapchat, WhatsApp, SMS…) ou chaîne vide."),
  weather: z.enum(WEATHERS),
  score: z.number().int().describe("Chances que la conv reparte, de 0 à 100."),
  verdict: z.string().describe("Une phrase courte qui résume la situation."),
  signals: z.array(z.string()).describe("2 à 3 indices concrets observés, très courts."),
  reading: z.string().describe("Lecture de la situation en 1 à 2 phrases."),
  strategy: z.string().describe("La stratégie de relance en une phrase."),
  replies: z
    .array(z.object({ tone: z.enum(TONES), text: z.string() }))
    .describe("Exactement 3 relances prêtes à copier-coller."),
  send_at: z.string().describe("Quand envoyer, ex : « ce soir vers 21h »."),
  goodbye: z.string().describe("Si tempête : un dernier message élégant pour clore. Sinon chaîne vide."),
});

export type Relance = z.infer<typeof RelanceSchema>;
