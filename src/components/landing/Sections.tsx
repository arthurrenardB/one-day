import Link from "next/link";
import { Phone, type Msg } from "./Phone";

export function SectionTitle({ kicker, title, sub, dark = false }: { kicker: string; title: React.ReactNode; sub?: string; dark?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={`text-sm font-semibold tracking-tight uppercase tracking-[0.18em] ${dark ? "text-gold" : "text-sun"}`}>{kicker}</p>
      <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight leading-[1.02] tracking-tight md:text-5xl">{title}</h2>
      {sub && <p className={`mt-4 text-lg ${dark ? "text-cream/70" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}

/* ------------------------------ Ticker ------------------------------ */

const DEAD = ["haha", "ok", "Vu à 23:12", "mdr", "jsp", "on verra", "ah ouais", "👍", "bien et toi", "tkt", "chargée en ce moment", "ptdr"];

export function Ticker() {
  const items = [...DEAD, ...DEAD];
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-ink py-4" aria-label="Messages relancés">
      <div className="animate-marquee flex w-max gap-4">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white/8 px-4 py-2 text-cream">
            <span className="font-semibold text-cream/60 line-through decoration-rose/70">{t}</span>
            <span className="sun-gradient rounded-full px-2 py-0.5 text-xs font-semibold tracking-tight text-white">relancée ☀️</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Comment ça marche --------------------------- */

const STEPS = [
  {
    n: "1",
    title: "Colle ou capture.",
    text: "Son dernier message, ou une capture de la conv. Insta, Tinder, Hinge, Bumble, Snap, WhatsApp : tout passe.",
    visual: (
      <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-2 shadow-soft">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-sand font-bold">+</span>
        <span className="flex-1 text-sm font-medium text-ink/70">jsp si j&apos;suis dispo</span>
        <span className="sun-gradient rounded-lg px-2 py-1 text-xs font-bold text-white">Go</span>
      </div>
    ),
  },
  {
    n: "2",
    title: "One Day analyse la conv.",
    text: "Le ton, le rythme, les signaux : tu sais tes chances qu'elle réponde, et pourquoi.",
    visual: (
      <div className="rounded-xl bg-white p-3 ring-1 ring-line">
        <div className="flex justify-between font-display font-semibold tracking-tight">
          <span>Chances de réponse</span>
          <span className="text-sun">57%</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {["Réponse floue", "Pas de refus", "Idée trop vague"].map((s) => (
            <span key={s} className="rounded bg-sand px-1.5 py-0.5 text-[11px] font-semibold">{s}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    n: "3",
    title: "Tu envoies au bon moment.",
    text: "3 relances dans ton style, prêtes à copier. Et l'heure idéale pour les envoyer.",
    visual: (
      <div className="space-y-1.5">
        <div className="flex justify-end">
          <span className="sun-gradient rounded-2xl rounded-br-md px-3 py-1.5 text-sm font-semibold text-white">mercredi 19h ou samedi 17h ?</span>
        </div>
        <p className="text-right text-xs font-bold text-muted">⏰ demain midi</p>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="comment" className="px-4 py-24">
      <SectionTitle kicker="Comment ça marche" title={<>30 secondes. <span className="sun-text">Trois étapes.</span></>} />
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="flex flex-col rounded-3xl bg-white shadow-soft ring-1 ring-black/[0.04]/70 p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink font-display text-lg font-semibold tracking-tight text-cream">{s.n}</span>
            <p className="mt-5 font-display text-2xl font-semibold tracking-tight">{s.title}</p>
            <p className="mt-2 text-muted">{s.text}</p>
            <div className="mt-6 rounded-2xl bg-sand/70 p-4">{s.visual}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Exemples ------------------------------ */

const EXAMPLES: { app: string; name: string; title: string; msgs: Msg[] }[] = [
  {
    app: "Tinder",
    name: "Camille",
    title: "Le match qui s'éteint",
    msgs: [
      { from: "meta", text: "Match le 11 novembre" },
      { from: "me", text: "ta photo au ski c'est où ?" },
      { from: "her", text: "les arcs ! t'y es déjà allé ?" },
      { from: "me", text: "jamais, je skie comme un frigo" },
      { from: "her", text: "mdrr" },
      { from: "meta", text: "Lu il y a 4 jours" },
      { from: "od", text: "le frigo a progressé, il tient debout. un verre jeudi pour fêter ça ?" },
      { from: "her", text: "ok je veux voir ça 😂 jeudi go" },
    ],
  },
  {
    app: "Instagram",
    name: "nour.sb",
    title: "Le « Vu » qui pique",
    msgs: [
      { from: "me", text: "tu fais quoi ce week-end ?" },
      { from: "meta", text: "Vu il y a 3 j" },
      { from: "od", text: "pas grave pour le vu 😌 par contre j'ai besoin de ton son du moment, c'est urgent" },
      { from: "her", text: "mdr pardon j'étais sous l'eau" },
      { from: "her", text: "là c'est que du afro en boucle" },
    ],
  },
  {
    app: "Hinge",
    name: "Léa",
    title: "La blague qui flop",
    msgs: [
      { from: "meta", text: "Son prompt · Mon métier : infirmière de nuit" },
      { from: "me", text: "donc si je fais un malaise tu me soignes ?" },
      { from: "her", text: "ah ok" },
      { from: "od", text: "ok celle-là je la retire 😭 vraie question : les nuits c'est calme ou c'est série télé ?" },
      { from: "her", text: "c'est JAMAIS calme" },
      { from: "her", text: "merci de rattraper mdr" },
    ],
  },
  {
    app: "WhatsApp",
    name: "Jade",
    title: "Le « on verra »",
    msgs: [
      { from: "me", text: "on se fait un verre cette semaine ?" },
      { from: "her", text: "jsp si j'suis dispo" },
      { from: "od", text: "mercredi 19h ou samedi 17h, je m'adapte. 45 min chrono, tu peux fuir si je suis nul" },
      { from: "her", text: "samedi ça me va 😄" },
    ],
  },
  {
    app: "Snapchat",
    name: "Sarah",
    title: "Le « bien et toi »",
    msgs: [
      { from: "me", text: "ça va ?" },
      { from: "her", text: "bien et toi" },
      { from: "od", text: "question sérieuse : t'es plutôt team pizza ananas ou t'as des principes ?" },
      { from: "her", text: "PRINCIPES." },
      { from: "her", text: "tu me déçois déjà" },
    ],
  },
];

export function Examples() {
  return (
    <section id="exemples" className="overflow-hidden bg-sand/60 py-24">
      <div className="px-4">
        <SectionTitle
          kicker="Exemples"
          title={<>Les moments où tout le monde bloque.</>}
          sub="Et ce que One Day a écrit à leur place."
        />
      </div>
      <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto px-4 pb-6 md:px-[max(1rem,calc((100vw-72rem)/2))]">
        {EXAMPLES.map((e) => (
          <div key={e.title} className="snap-center">
            <p className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
              <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-cream">{e.app}</span>
              {e.title}
            </p>
            <Phone app={e.app} name={e.name} msgs={e.msgs} />
          </div>
        ))}
      </div>
      <p className="mt-2 px-4 text-center text-sm text-muted">Conversations d&apos;illustration. Fais glisser pour voir les autres →</p>
    </section>
  );
}

/* --------------------------- Fonctionnalités --------------------------- */

export function Features() {
  return (
    <section className="px-4 py-24">
      <SectionTitle
        kicker="Fonctionnalités"
        title={<>Plus qu&apos;un générateur. <span className="sun-text">Un coach de poche.</span></>}
        sub="Tout ce qu'il faut pour passer du « ok » au premier verre."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-6">
        <div className="rounded-3xl bg-ink p-7 text-cream md:col-span-4">
          <p className="text-sm font-bold uppercase tracking-wider text-gold">Lit tes captures</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">Une capture suffit.</p>
          <p className="mt-2 max-w-md text-cream/70">One Day lit toute la conv visible : son ton, son rythme, ses émojis, ce qui a marché et ce qui a coincé.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Elle écrit en minuscules", "Elle a ri puis plus rien", "Silence de 4 jours", "Question restée sans réponse"].map((t) => (
              <span key={t} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">{t}</span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white shadow-soft ring-1 ring-black/[0.04] p-7 md:col-span-2">
          <p className="text-sm font-bold uppercase tracking-wider text-sun">Tes chances</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight">Tu sais où t&apos;en es.</p>
          <p className="mt-5 text-5xl font-semibold tracking-tight">64%</p>
          <p className="mt-1 text-sm text-muted">de chances qu&apos;elle te réponde, avec les signaux qui l&apos;expliquent.</p>
        </div>
        <div className="rounded-3xl bg-white shadow-soft ring-1 ring-black/[0.04] p-7 md:col-span-2">
          <p className="text-sm font-bold uppercase tracking-wider text-sun">4 tons</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight">Choisis comment tu sonnes.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Drôle", "Cash", "Tendre", "Taquin"].map((t, i) => (
              <span key={t} className={`rounded-full px-3 py-1.5 text-sm font-bold ${i === 0 ? "bg-ink text-white" : "bg-sand"}`}>{t}</span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white shadow-soft ring-1 ring-black/[0.04] p-7 md:col-span-2">
          <p className="text-sm font-bold uppercase tracking-wider text-sun">Le bon moment</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight">On te dit quand envoyer.</p>
          <div className="mt-5 rounded-2xl bg-ink p-3 text-sm text-cream">
            <p className="font-bold">One Day · maintenant</p>
            <p className="text-cream/70">C&apos;est le moment de relancer Camille ☀️</p>
          </div>
        </div>
        <div className="rounded-3xl bg-white shadow-soft ring-1 ring-black/[0.04] p-7 md:col-span-2">
          <p className="text-sm font-bold uppercase tracking-wider text-sun">Ton style</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight">Ça sonne comme toi.</p>
          <div className="mt-5 space-y-2 text-sm font-semibold">
            {[["Émojis", "parfois"], ["Majuscules", "non"], ["Longueur", "court"]].map(([k, v]) => (
              <p key={k} className="flex justify-between rounded-lg bg-sand px-3 py-1.5"><span>{k}</span><span className="text-sun">{v}</span></p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border-2 border-dashed border-ink/30 p-7 md:col-span-6 md:flex md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-muted">Quand c&apos;est fini</p>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight">Quand c&apos;est fini, on te le dit. Avec un dernier mot classe.</p>
            <p className="mt-1 text-muted">Pas d&apos;acharnement : si la porte est fermée, One Day t&apos;aide à sortir proprement.</p>
          </div>
          <span className="mt-4 inline-block text-5xl md:mt-0">🚪</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Garanties ------------------------------ */

export function Guarantees() {
  const items = [
    { t: "L'analyse est gratuite.", d: "Tu vois tes chances qu'elle réponde avant de payer quoi que ce soit." },
    { t: "Zéro abonnement.", d: "Tu paies une fois, c'est tout. Aucun prélèvement surprise, rien à résilier." },
    { t: "Rien n'est gardé.", d: "Tes captures sont analysées puis supprimées. Personne ne saura jamais rien." },
    { t: "Date décroché ? L'accès à vie offert.", d: "Envoie la conv qui a mené au date. On valide, on t'offre l'accès à vie." },
  ];
  return (
    <section className="bg-ink px-4 py-24 text-cream">
      <SectionTitle dark kicker="Zéro risque" title={<>Tu testes. Tu gardes <span className="sun-text">si ça marche.</span></>} />
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((x, i) => (
          <div key={x.t} className="rounded-3xl bg-white/6 p-6 ring-1 ring-white/10">
            <span className="font-display text-4xl font-semibold tracking-tight text-gold">0{i + 1}</span>
            <p className="mt-4 font-display text-xl font-semibold tracking-tight">{x.t}</p>
            <p className="mt-2 text-cream/70">{x.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- FAQ --------------------------------- */

export const FAQ_ITEMS = [
  {
    q: "C'est quoi exactement, One Day ?",
    a: "Un coach de messages. Tu colles son dernier message (ou une capture), One Day analyse l'ambiance de la conv et t'écrit 3 relances naturelles, dans ton style, avec le meilleur moment pour les envoyer.",
  },
  {
    q: "Elle va voir que c'est écrit par une IA ?",
    a: "Non. Les messages sont courts, écrits comme on écrit vraiment sur son téléphone, et adaptés à ta façon d'écrire (émojis, majuscules, longueur). Et tu peux toujours les retoucher avant d'envoyer.",
  },
  {
    q: "Ça marche sur quelles applis ?",
    a: "Toutes : Tinder, Hinge, Bumble, Fruitz, Instagram, Snapchat, WhatsApp, SMS… One Day lit le texte ou la capture, peu importe l'appli.",
  },
  {
    q: "Mes captures sont-elles conservées ?",
    a: "Non. Elles sont envoyées pour l'analyse puis supprimées. On ne revend rien et on ne contacte jamais personne.",
  },
  {
    q: "Et si la conv est vraiment morte ?",
    a: "On te le dit franchement et on te propose un dernier message élégant. One Day ne t'aidera jamais à insister face à un refus.",
  },
  {
    q: "C'est un abonnement ?",
    a: "Non. Tu paies une seule fois pour l'accès à vie. Aucun prélèvement ensuite, rien à résilier.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="px-4 py-24">
      <SectionTitle kicker="FAQ" title="Les questions qu'on nous pose." />
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {FAQ_ITEMS.map((f) => (
          <details key={f.q} className="group rounded-2xl border-2 border-line bg-white p-5 open:border-ink">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold tracking-tight">
              {f.q}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- CTA final ----------------------------- */

export function FinalCta() {
  return (
    <section className="px-4 pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-ink px-6 py-16 text-center text-cream md:py-24">
        <div className="sun-gradient absolute bottom-[-220px] left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full" aria-hidden />
        <p className="relative font-display text-4xl font-semibold tracking-tight leading-tight md:text-6xl">
          Un jour, elle répond.
          <br />
          <span className="text-gold">Pourquoi pas aujourd&apos;hui ?</span>
        </p>
        <Link href="/#essayer" className="relative mt-10 inline-block rounded-2xl bg-cream px-7 py-4 text-lg font-semibold tracking-tight text-ink shadow-soft transition hover:-translate-y-0.5">
          Analyser ma conv
        </Link>
        <p className="relative mt-4 text-sm text-cream/70">Analyse gratuite · Paiement unique · Sans abonnement</p>
      </div>
    </section>
  );
}

/* ------------------------- Pourquoi pas ChatGPT ------------------------- */

const VS: { label: string; od: string; gpt: string }[] = [
  { label: "Savoir si ça vaut le coup de relancer", od: "Tes chances qu'elle réponde, en %", gpt: "Non, il répond à tout" },
  { label: "Comprendre « vu », « jsp », « mdr », une capture Snap", od: "Oui, pensé pour ça", gpt: "Si tu lui expliques" },
  { label: "Écrire comme toi (minuscules, émojis, longueur)", od: "Ton style mémorisé", gpt: "Souvent trop poli, trop long" },
  { label: "Le bon moment pour envoyer", od: "Créneau + rappel", gpt: "Non" },
  { label: "Ce qu'il faut taper", od: "Rien : tu colles, c'est tout", gpt: "Un prompt à rédiger à chaque fois" },
  { label: "Si la porte est fermée", od: "Te le dit, avec un dernier mot classe", gpt: "Peut t'aider à insister" },
];

export function WhyNotChatGPT() {
  return (
    <section className="px-4 py-24">
      <SectionTitle
        kicker="La question qu'on nous pose"
        title={<>« Pourquoi pas juste <span className="sun-text">ChatGPT</span> ? »</>}
        sub="ChatGPT sait écrire. One Day sait relancer une conv, ce n'est pas le même métier."
      />
      <div className="mx-auto mt-12 max-w-4xl overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 overflow-hidden rounded-3xl border border-black/10 bg-white text-left">
          <thead>
            <tr>
              <th className="bg-sand/70 p-4 text-sm font-bold text-muted"> </th>
              <th className="bg-ink p-4 font-display text-lg font-semibold tracking-tight text-cream">☀️ One Day</th>
              <th className="bg-sand/70 p-4 font-display text-lg font-semibold tracking-tight text-ink/60">ChatGPT</th>
            </tr>
          </thead>
          <tbody>
            {VS.map((r) => (
              <tr key={r.label}>
                <td className="border-t border-line p-4 font-semibold">{r.label}</td>
                <td className="border-t border-line bg-sun/5 p-4 font-bold">✓ {r.od}</td>
                <td className="border-t border-line p-4 text-muted">{r.gpt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
