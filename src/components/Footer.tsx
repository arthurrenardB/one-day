import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { Logo } from "./Brand";

export function Footer() {
  return (
    <footer className="bg-ink px-4 pb-10 pt-16 text-cream/70">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.3fr_1fr_1.3fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Le coach de poche qui réchauffe tes convs. Un jour, elle répond. Souvent, c&apos;est aujourd&apos;hui.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-cream">Produit</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#comment" className="hover:text-cream">Comment ça marche</Link></li>
            <li><Link href="/#exemples" className="hover:text-cream">Exemples</Link></li>
            <li><Link href="/offres" className="hover:text-cream">Tarifs</Link></li>
            <li><Link href="/app" className="hover:text-cream">Mon espace</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-cream">Guides</p>
          <ul className="space-y-2 text-sm">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/${g.slug}`} className="hover:text-cream">
                  {g.h1.replace("Relancer une conversation", "Relancer sur").replace(" qui s'est éteinte", "").replace(" sans forcer", "")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-cream">Communauté</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#parrainage" className="hover:text-cream">Parrainage</Link></li>
            <li><Link href="/#parrainage" className="hover:text-cream">Programme créateurs</Link></li>
            <li><a href="#" className="hover:text-cream">TikTok</a></li>
            <li><a href="#" className="hover:text-cream">Instagram</a></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-cream">Légal</p>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cream">CGV</a></li>
            <li><a href="#" className="hover:text-cream">Confidentialité</a></li>
            <li><a href="#" className="hover:text-cream">Mentions légales</a></li>
            <li><a href="mailto:contact@oneday.app" className="hover:text-cream">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-cream/10 pt-6 text-xs md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} One Day. Tous droits réservés.</p>
        <p>One Day n&apos;est affilié à aucune des applis citées. Les noms appartiennent à leurs propriétaires.</p>
      </div>
    </footer>
  );
}
