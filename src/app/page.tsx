import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Pricing } from "@/components/Pricing";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import { SITE_URL } from "@/lib/site";

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "One Day",
    url: SITE_URL,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    description: "Assistant IA pour relancer une conversation sur Tinder, Hinge, Instagram, Snapchat ou WhatsApp.",
    offers: PLAN_ORDER.map((id) => ({ "@type": "Offer", name: PLANS[id].name, price: PLANS[id].price.toFixed(2), priceCurrency: "EUR" })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];
import { Newsletter, Referral } from "@/components/landing/Community";
import { Hero } from "@/components/landing/Hero";
import { SocialProofBand } from "@/components/landing/SocialProof";
import { FAQ_ITEMS, Examples, Faq, Features, FinalCta, Guarantees, HowItWorks, SectionTitle, Ticker, WhyNotChatGPT } from "@/components/landing/Sections";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <Hero />
        <SocialProofBand />
        <Ticker />
        <HowItWorks />
        <Examples />
        <Features />
        <WhyNotChatGPT />
        <section id="tarifs" className="scroll-mt-24 px-4 py-24">
          <SectionTitle kicker="Tarifs" title={<>Tu paies une fois. <span className="sun-text">Pas chaque semaine.</span></>} sub="Les applis du genre facturent souvent 5 à 8 € par semaine en abonnement. Ici, c'est un seul paiement, et c'est tout." />
          <div className="mt-12">
            <Pricing />
          </div>
        </section>
        <Guarantees />
        <Faq />
        <Referral />
        <Newsletter />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
