const Stripe = require('stripe');
const { CATALOG } = require('./catalog');

// Države u koje dostavljaš (ISO kodovi). Dodaj/ukloni po želji.
const COUNTRIES = ['HR','SI','AT','DE','IT','HU','SK','CZ','PL','FR','ES','NL','BE','BG','RO','GR','PT','IE','SE','DK','FI','LT','LV','EE','LU','CY','MT'];

const json = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const { items } = JSON.parse(event.body || '{}');
    if (!Array.isArray(items) || !items.length || items.length > 20) return json(400, { error: 'Prazna košarica' });

    const line_items = items.map((it) => {
      const p = CATALOG[it.id];
      const i = Number(it.optIndex), q = Number(it.qty);
      if (!p || !Number.isInteger(i) || !p.prices[i] || !Number.isInteger(q) || q < 1 || q > 10) throw new Error('Neispravan artikl');
      return {
        quantity: q,
        price_data: {
          currency: 'eur',
          unit_amount: p.prices[i],
          product_data: { name: `${p.name} – ${p.labels[i]}` },
        },
      };
    });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = event.headers.origin || process.env.URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],                       // samo kartice
      line_items,
      shipping_address_collection: { allowed_countries: COUNTRIES },
      phone_number_collection: { enabled: true },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'eur' },     // besplatna dostava
          display_name: 'Besplatna dostava',
        },
      }],
      locale: 'hr',
      success_url: `${origin}/hvala.html`,
      cancel_url: origin,
    });
    return json(200, { url: session.url });
  } catch (e) {
    console.error(e);
    return json(400, { error: 'Greška pri kreiranju plaćanja' });
  }
};
