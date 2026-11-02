const Stripe = require('stripe');

const eur = (c) => (c / 100).toFixed(2).replace('.', ',') + ' €';
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

exports.handler = async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

  let ev;
  try {
    ev = stripe.webhooks.constructEvent(raw, event.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return { statusCode: 400, body: 'Neispravan potpis' };
  }

  if (ev.type === 'checkout.session.completed') {
    const session = await stripe.checkout.sessions.retrieve(ev.data.object.id, { expand: ['line_items'] });
    const cd = session.customer_details || {};
    const sh = session.shipping_details || {};
    const a = sh.address || cd.address || {};

    const rows = session.line_items.data
      .map((l) => `<tr><td>${esc(l.description)}</td><td>× ${l.quantity}</td><td>${eur(l.amount_total)}</td></tr>`)
      .join('');

    const html = `
      <h2>🛒 Nova narudžba – ${eur(session.amount_total)}</h2>
      <p><b>Kupac:</b> ${esc(sh.name || cd.name)}<br>
         <b>E-mail:</b> ${esc(cd.email)}<br>
         <b>Telefon:</b> ${esc(cd.phone || '-')}</p>
      <p><b>Adresa za dostavu:</b><br>
         ${esc(a.line1)} ${esc(a.line2 || '')}<br>
         ${esc(a.postal_code)} ${esc(a.city)}<br>
         ${esc(a.country)}</p>
      <table cellpadding="6" style="border-collapse:collapse">${rows}</table>
      <p>Dostava: besplatno · Plaćeno karticom<br>
         Stripe ID: ${esc(session.payment_intent)}</p>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'KARA narudžbe <onboarding@resend.dev>',
        to: [process.env.NOTIFY_EMAIL],
        subject: `Nova narudžba: ${sh.name || cd.name || ''} – ${eur(session.amount_total)}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error('Resend greška', res.status, await res.text());
      return { statusCode: 500, body: 'Email nije poslan' };   // Stripe će pokušati ponovno
    }
  }
  return { statusCode: 200, body: 'ok' };
};
