import type { Msg } from "@/components/landing/Phone";

// Pages-guides pour le référencement (une par appli / situation). Contenu original.

export type Guide = {
  slug: string;
  title: string; // balise <title>
  description: string; // meta description
  h1: string;
  intro: string;
  app: string;
  name: string;
  convo: Msg[];
  sections: { h2: string; p: string[] }[];
  tips: string[];
};

export const GUIDES: Guide[] = [
  {
    slug: "relancer-conversation-tinder",
    title: "Relancer une conversation Tinder morte : quoi écrire (exemples)",
    description:
      "Ton match Tinder ne répond plus ? Comment relancer la conversation sans paraître lourd, avec des exemples de messages et le bon moment pour envoyer.",
    h1: "Relancer une conversation Tinder qui s'est éteinte",
    intro:
      "Sur Tinder, la plupart des convs ne meurent pas parce que l'autre n'est pas intéressé, mais parce que plus personne ne relance. Un match reçoit beaucoup de messages : le tien a juste besoin d'une bonne raison de remonter.",
    app: "Tinder",
    name: "Camille",
    convo: [
      { from: "me", text: "ta photo au ski c'est où ?" },
      { from: "her", text: "les arcs ! et toi tu skies ?" },
      { from: "me", text: "comme un frigo" },
      { from: "her", text: "mdr" },
      { from: "meta", text: "Lu il y a 4 jours" },
      { from: "od", text: "le frigo a pris 2 cours, il tient debout. un verre jeudi pour fêter ça ?" },
    ],
    sections: [
      {
        h2: "Pourquoi ta conv Tinder s'arrête",
        p: [
          "Une conv qui tourne en questions-réponses (« tu fais quoi ? », « et toi ? ») finit par s'épuiser. Il n'y a rien à quoi rebondir.",
          "Souvent, le dernier message appelait un effort : une question large, ou rien à répondre du tout. Un « mdr » sans relance, c'est poli, mais c'est la fin si personne n'apporte la suite.",
        ],
      },
      {
        h2: "La bonne relance : du neuf, pas un reproche",
        p: [
          "Évite « tu ne réponds plus ? » ou « je te dérange ? ». Ça met l'autre en position de se justifier.",
          "Rebondis sur un détail déjà échangé (une photo, une blague) et propose quelque chose de concret : un jour, un lieu, une activité. Une proposition précise est plus facile à accepter qu'un vague « on se voit un jour ».",
        ],
      },
      {
        h2: "Quand envoyer",
        p: [
          "Après 2 à 5 jours de silence, une seule relance légère suffit. En soirée (19h–22h), les gens sont plus disponibles pour répondre.",
          "Si ta relance reste sans réponse, n'en enchaîne pas une troisième : passe à autre chose avec élégance.",
        ],
      },
    ],
    tips: [
      "Reprends un détail de son profil ou de la conv",
      "Propose un jour précis plutôt qu'un « un de ces jours »",
      "Un seul message, court, sans reproche",
    ],
  },
  {
    slug: "relancer-conversation-hinge",
    title: "Relancer une conversation Hinge : exemples de messages qui marchent",
    description:
      "Ta conv Hinge s'essouffle après un prompt ? Comment relancer avec naturel, rebondir sur ses réponses et proposer un date, avec exemples.",
    h1: "Relancer une conversation Hinge sans forcer",
    intro:
      "Hinge donne une matière en or : les prompts. Quand la conv ralentit, c'est souvent qu'on a quitté ce terrain pour des questions génériques. Le retour au profil est la meilleure relance.",
    app: "Hinge",
    name: "Léa",
    convo: [
      { from: "meta", text: "Son prompt · Mon dimanche idéal : brunch + expo" },
      { from: "me", text: "ça va ton week-end ?" },
      { from: "her", text: "oui tranquille et toi" },
      { from: "meta", text: "Lu il y a 3 jours" },
      { from: "od", text: "j'ai trouvé une expo qui finit dimanche, il manque juste quelqu'un pour juger mes goûts au brunch d'avant" },
    ],
    sections: [
      {
        h2: "Le piège : la conv qui devient générique",
        p: [
          "« Ça va ? », « bon week-end ? » : ces messages ne donnent aucune prise. Sur Hinge, l'autre a pris le temps de remplir des prompts, utilise-les.",
        ],
      },
      {
        h2: "Rebondir sur un prompt pour relancer",
        p: [
          "Relis son profil : un lieu, un goût, une opinion tranchée. Fais-en le point de départ d'une proposition ou d'une question qui donne envie de répondre.",
          "Une pointe d'humour ou d'autodérision aide à casser le côté « entretien d'embauche ».",
        ],
      },
      {
        h2: "Proposer de se voir",
        p: [
          "Hinge est fait pour sortir de l'appli. Après quelques échanges positifs, une proposition simple et précise (« jeudi 19h, un verre ? ») est souvent mieux reçue qu'une conv qui s'éternise.",
        ],
      },
    ],
    tips: ["Repars d'un prompt de son profil", "Une question ouverte et légère", "Propose un créneau concret"],
  },
  {
    slug: "relancer-conversation-instagram",
    title: "Relancer une conversation Instagram (DM, story) sans être lourd",
    description:
      "Ton DM Instagram est resté en « Vu » ? Comment relancer avec une story, un message léger ou une proposition, avec exemples concrets.",
    h1: "Relancer une conversation Instagram",
    intro:
      "Sur Instagram, la relance la plus naturelle existe déjà : la story. Répondre à une story donne un prétexte léger, sans avoir l'air de courir après une réponse.",
    app: "Instagram",
    name: "ines.lmb",
    convo: [
      { from: "me", text: "tu fais quoi ce week-end ?" },
      { from: "meta", text: "Vu il y a 3 j" },
      { from: "meta", text: "Tu as répondu à sa story" },
      { from: "od", text: "ok cette vue c'est illégal. c'est où ? j'ai besoin de vacances" },
    ],
    sections: [
      {
        h2: "Le « Vu » n'est pas un non",
        p: [
          "Un message vu sans réponse veut souvent dire « pas le temps à ce moment-là », puis oubli. Ton message n'avait peut-être rien de facile à répondre.",
        ],
      },
      {
        h2: "Répondre à une story : la relance parfaite",
        p: [
          "Une réaction sincère et précise à sa story (un lieu, un plat, un son) relance sans pression. Évite le simple emoji flamme : il n'appelle aucune réponse.",
        ],
      },
      {
        h2: "Passer du DM au réel",
        p: [
          "Si l'échange reprend bien, propose de continuer autour d'un verre. Rester des semaines en DM finit souvent par refroidir la conv.",
        ],
      },
    ],
    tips: ["Réagis à une story avec un vrai commentaire", "Pas de reproche sur le « Vu »", "Une question facile à répondre"],
  },
  {
    slug: "relancer-conversation-snapchat",
    title: "Relancer une conversation Snapchat qui s'éteint : exemples",
    description:
      "Les snaps s'espacent et les réponses deviennent « bien et toi » ? Comment relancer une conversation Snapchat avec du neuf, exemples à l'appui.",
    h1: "Relancer une conversation Snapchat",
    intro:
      "Sur Snap, la conv peut tourner en pilote automatique : flammes, « bien et toi », photos du plafond. Pour la relancer, il faut casser la routine avec quelque chose de personnel.",
    app: "Snapchat",
    name: "Sarah",
    convo: [
      { from: "me", text: "ça va ?" },
      { from: "her", text: "bien et toi" },
      { from: "od", text: "question sérieuse : pizza ananas, crime ou génie ? je dois savoir avant d'aller plus loin" },
      { from: "her", text: "CRIME." },
    ],
    sections: [
      {
        h2: "Sortir du « ça va / bien et toi »",
        p: [
          "Ces échanges ne racontent rien. Une question décalée, un avis à donner, une anecdote de ta journée : tout ce qui demande une vraie réaction relance mieux.",
        ],
      },
      {
        h2: "Le bon ton sur Snap",
        p: [
          "Court, spontané, un brin joueur. Sur Snap, un long pavé détonne. Mieux vaut une phrase qui donne envie de répondre tout de suite.",
        ],
      },
    ],
    tips: ["Une question qui appelle un avis", "Un message court et spontané", "Évite le « ça va ? » en boucle"],
  },
  {
    slug: "elle-ma-laisse-en-vu",
    title: "Elle m'a laissé en vu : que faire et quoi lui écrire ?",
    description:
      "Laissé en vu après ton message ? Ce que ça veut (vraiment) dire, combien de temps attendre et comment relancer sans paraître insistant.",
    h1: "Elle t'a laissé en vu : que faire ?",
    intro:
      "Être laissé en vu pique. Mais dans la majorité des cas, ce n'est pas un rejet : c'est un message lu au mauvais moment, puis oublié. La suite dépend surtout de ta relance.",
    app: "Instagram",
    name: "Nour",
    convo: [
      { from: "me", text: "on se fait un verre un de ces jours ?" },
      { from: "meta", text: "Vu il y a 4 j" },
      { from: "od", text: "pas grave pour le vu 😌 par contre j'ai trouvé le bar dont je t'avais parlé, jeudi ça te dit ?" },
    ],
    sections: [
      {
        h2: "Ce que veut dire un « Vu »",
        p: [
          "Pas le temps, pas d'idée de réponse, message trop vague… Un « un de ces jours » n'appelle aucune action : il est facile à laisser en suspens.",
        ],
      },
      {
        h2: "Combien de temps attendre",
        p: [
          "Laisse passer 2 à 4 jours. Relancer le lendemain met une pression inutile ; attendre trois semaines, et la conv est froide.",
        ],
      },
      {
        h2: "Comment relancer",
        p: [
          "Pas de reproche, pas de « ? » tout seul. Apporte du neuf et rends la réponse facile : une proposition précise ou une question légère.",
          "Si cette relance reste aussi en vu, c'est une réponse en soi. Un dernier mot élégant, et tu passes à autre chose.",
        ],
      },
    ],
    tips: ["Attends 2 à 4 jours", "Apporte du neuf, sans reproche", "Une seule relance, pas trois"],
  },
  {
    slug: "faut-il-double-texter",
    title: "Faut-il double texter ? Quand renvoyer un message (et quoi dire)",
    description:
      "Double texter, c'est lourd ou pas ? Quand renvoyer un message sans réponse, combien de temps attendre et comment le formuler, avec exemples.",
    h1: "Faut-il double texter ?",
    intro:
      "Envoyer un deuxième message sans réponse au premier, ce n'est pas un crime. Tout dépend du délai, du ton et du contenu. Bien fait, un double texto relance une conv sur deux.",
    app: "WhatsApp",
    name: "Jade",
    convo: [
      { from: "me", text: "tu fais quoi samedi ?" },
      { from: "meta", text: "Lu il y a 3 jours" },
      { from: "od", text: "bon j'ai trouvé un concert samedi, je te garde une place ou je trouve un autre public pour mes commentaires ?" },
      { from: "her", text: "mdr garde-la" },
    ],
    sections: [
      {
        h2: "Quand c'est une bonne idée",
        p: [
          "Si la conv était sympa et que le silence dure quelques jours, un double texto montre de l'intérêt sans excès. C'est souvent ce qui manque pour que la conv reparte.",
        ],
      },
      {
        h2: "Quand s'abstenir",
        p: [
          "Si la personne a exprimé un refus, une gêne ou demandé de l'espace, on n'insiste pas. Et après deux relances sans réponse, mieux vaut lâcher prise.",
        ],
      },
      {
        h2: "Comment le formuler",
        p: [
          "Ne reviens pas sur le silence. Apporte une nouveauté (une idée, une anecdote, une proposition) qui donne une vraie raison de répondre.",
        ],
      },
    ],
    tips: ["Laisse passer quelques jours", "Ne mentionne pas le silence", "Jamais après un refus clair"],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
