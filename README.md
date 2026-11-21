# One Day

Coach de messages pour relancer les conversations (Tinder, Hinge, Insta, Snap, WhatsApp…).
L'utilisateur colle le dernier message reçu ou une capture : One Day donne la « météo » de la conv, écrit 3 relances dans son style et indique quand les envoyer.

## Lancer en local

```bash
npm install
cp .env.example .env.local   # puis remplis les clés
npm run dev
```

Sans clé, tout fonctionne en **mode démo** : relances d'exemple, paiement simulé (dev uniquement), lien de connexion affiché à l'écran. La base SQLite est créée automatiquement dans `./data`.

## Comptes et droits

- **Connexion sans mot de passe** : `/connexion` envoie un lien magique (Resend), valable 20 min et à usage unique. Le lien ouvre `/connexion/verifier`, où un clic confirme la connexion (les antivirus de messagerie qui « cliquent » les liens ne consomment donc pas le jeton). Session en cookie httpOnly, 60 jours.
- **Tout est vérifié côté serveur** dans `/api/relance` : relance offerte (1 par visiteur sans compte, 3 max par IP et par jour), crédits du Pass Conv, formules illimitées, ton Taquin. Les rappels aussi.
- **Après paiement** : `/merci` vérifie la session Stripe, active la formule et connecte l'acheteur **uniquement si le compte vient d'être créé par cet achat** (sinon, payer avec l'email de quelqu'un d'autre donnerait accès à son compte : la personne doit alors passer par le lien magique).
- **Webhook Stripe** `/api/stripe/webhook` : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid` (prolonge l'abonnement), `customer.subscription.deleted` (coupe l'accès).
- **Résiliation** : bouton « Gérer / résilier mon abonnement » dans `/app` → portail client Stripe (à activer dans Stripe > Paramètres > Portail client).

En local, tester le webhook :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Parcours client

1. **Landing** `/` : champ « colle son dernier message » + capture, 1 relance offerte sans compte.
2. **Résultat** (feuille modale) : météo + score, signaux, stratégie, 3 relances à copier, créneau d'envoi, réglages objectif / ton.
3. **Paywall** : après la relance offerte → « 10 relances · 4,90 € » ou « Illimité à vie · 12,90 € », lien vers les 3 offres.
4. **Offres** `/offres` : 3 offres sans abonnement (10 relances 4,90 €, À vie 12,90 €, VIP 89 € qui sert d'ancrage), comparatif.
5. **Checkout** `/checkout?plan=…` : récap, proposition de passer à « À vie », Stripe Checkout.
6. **Merci** `/merci` : vérifie la session Stripe puis active la formule.
7. **Espace** `/app` (connexion requise) : onboarding style, générateur, historique, rappels, gestion de l'abonnement.

## Où modifier quoi

| Quoi | Fichier |
|---|---|
| Prix, formules, bonus | `src/lib/plans.ts` |
| Prompt de génération, modèle | `src/app/api/relance/route.ts` |
| Relances du mode démo | `src/lib/demo.ts` |
| Droits, crédits, formules actives | `src/lib/server/entitlements.ts` |
| Auth (lien magique, sessions) | `src/lib/server/auth.ts` |
| Base de données (schéma) | `src/lib/server/db.ts` |
| Stripe (activation, renouvellement) | `src/lib/server/stripe.ts` |
| Sections de la landing | `src/components/landing/` |

## Avant la mise en prod

- **Base en prod** : le fichier SQLite local ne survit pas sur Vercel. Crée une base Turso et renseigne `DATABASE_URL` / `DATABASE_AUTH_TOKEN`.
- **Emails** : domaine vérifié sur Resend + `RESEND_API_KEY` et `EMAIL_FROM`.
- **Stripe** : produits/prix, `STRIPE_PRICE_*`, endpoint webhook + `STRIPE_WEBHOOK_SECRET`, portail client activé.
- **Rate limit** : les limites sont en mémoire (une instance), à passer sur Redis/Upstash si tu scales.
- **Rappels** : notifications navigateur uniquement si l'onglet reste ouvert. Pour de vrais rappels, il faut du push web ou des emails.
- **Pages légales** (CGV, confidentialité, mentions) et **newsletter** à brancher.
- Créer les produits/prix dans Stripe et remplir les `STRIPE_PRICE_*`.
