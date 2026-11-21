import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Phone } from "@/components/landing/Phone";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { PLANS, fmt } from "@/lib/plans";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return {
    title: { absolute: `${g.title} · One Day` },
    description: g.description,
    alternates: { canonical: `/${g.slug}` },
    openGraph: { title: g.title, description: g.description, type: "article", locale: "fr_FR" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.h1,
    description: g.description,
    inLanguage: "fr-FR",
    mainEntityOfPage: `${SITE_URL}/${g.slug}`,
    publisher: { "@type": "Organization", name: "One Day", url: SITE_URL },
  };

  return (
    <>
      <Nav />
      <main className="px-4 pb-24 pt-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <article className="mx-auto max-w-5xl">
          <nav className="text-sm text-muted" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:text-ink">
              Accueil
            </Link>{" "}
            › Guides
          </nav>
          <div className="mt-6 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight leading-tight tracking-tight md:text-5xl">{g.h1}</h1>
              <p className="mt-5 text-lg leading-relaxed text-ink/80">{g.intro}</p>

              <div className="mt-8 rounded-3xl border border-black/10 bg-white p-5 shadow-soft">
                <p className="font-display text-lg font-semibold tracking-tight">L&apos;essentiel</p>
                <ul className="mt-3 space-y-2">
                  {g.tips.map((t) => (
                    <li key={t} className="flex gap-2 font-semibold">
                      <span className="text-sun">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {g.sections.map((s) => (
                <section key={s.h2} className="mt-10">
                  <h2 className="font-display text-2xl font-semibold tracking-tight">{s.h2}</h2>
                  {s.p.map((p, i) => (
                    <p key={i} className="mt-3 leading-relaxed text-ink/80">
                      {p}
                    </p>
                  ))}
                </section>
              ))}

              <div className="relative mt-12 overflow-hidden rounded-3xl bg-ink p-7 text-cream">
                <div className="sun-gradient absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-80 blur-2xl" aria-hidden />
                <p className="relative font-display text-2xl font-semibold tracking-tight">Ta conv à toi, on la relance ?</p>
                <p className="relative mt-2 text-cream/75">
                  Colle son dernier message : One Day te dit si ça vaut le coup, t&apos;écrit 3 relances dans ton style et le bon moment pour
                  les envoyer. Analyse en 30 secondes.
                </p>
                <Link href="/#essayer" className="sun-gradient relative mt-5 inline-block rounded-xl px-5 py-3 font-bold text-white">
                  Analyser ma conv
                </Link>
                <p className="relative mt-3 text-xs text-cream/60">
                  Accès à vie à {fmt(PLANS.lifetime.price)}, paiement unique, sans abonnement.
                </p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="mb-3 text-center text-sm font-bold text-muted">Exemple de relance écrite avec One Day</p>
              <Phone app={g.app} name={g.name} msgs={g.convo} className="mx-auto" />
            </aside>
          </div>

          <section className="mt-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Autres guides</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/${o.slug}`} className="rounded-2xl border-2 border-line bg-white p-4 font-semibold transition hover:border-black/30">
                  {o.h1} →
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
