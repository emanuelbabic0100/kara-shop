# KARA – postavljanje (Stripe + e-mail + Netlify)

## 1. Stripe
1. Registriraj se na https://dashboard.stripe.com (za početak ostani u **Test mode**).
2. Developers → API keys → kopiraj **Secret key** (`sk_test_...`).

## 2. Resend (e-mail obavijesti)
1. Registriraj se na https://resend.com (besplatno).
2. API Keys → Create → kopiraj ključ (`re_...`).
3. Bez vlastite domene Resend šalje samo na e-mail kojim si se registrirao – za tebe je to dovoljno.
   Zato se registriraj e-mailom na koji želiš primati narudžbe.

## 3. Netlify
1. Registriraj se na https://netlify.com.
2. Add new site → **Deploy manually** → povuci cijelu mapu `shop` u prozor.
   (Bolje: stavi mapu na GitHub pa Import from Git – tada se stranica sama osvježava.)
3. Site configuration → Environment variables → dodaj:
   - `STRIPE_SECRET_KEY` = sk_test_...
   - `RESEND_API_KEY` = re_...
   - `NOTIFY_EMAIL` = tvoj e-mail
   - `STRIPE_WEBHOOK_SECRET` = (dodaje se u koraku 4)
4. Deploy ponovno nakon dodavanja varijabli.

## 4. Webhook (javlja stranici da je netko platio)
1. Stripe → Developers → Webhooks → Add endpoint
2. URL: `https://TVOJA-STRANICA.netlify.app/.netlify/functions/stripe-webhook`
3. Event: `checkout.session.completed`
4. Kopiraj **Signing secret** (`whsec_...`) u Netlify kao `STRIPE_WEBHOOK_SECRET`, pa ponovno deploy.

## 5. Test
Otvori stranicu, dodaj nož, plati testnom karticom `4242 4242 4242 4242`
(bilo koji budući datum, bilo koji CVC). Na e-mail ti mora stići narudžba.

## 6. Pravi novac
U Stripeu aktiviraj račun (podaci o firmi + IBAN), prebaci na **Live mode**,
zamijeni `sk_test_` ključ s `sk_live_`, napravi webhook ponovno u Live modeu
i upiši novi `whsec_`.

## Gdje se što mijenja
- Cijene: `script.js` (prikaz) **i** `netlify/functions/catalog.js` (naplata, u centima).
- Države dostave: `netlify/functions/create-checkout.js` (`COUNTRIES`).
