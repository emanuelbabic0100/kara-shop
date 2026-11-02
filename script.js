/* ============================================================
   POSTAVKE – ovdje mijenjaš cijene i nazive
   ============================================================ */
const KNIFE_PRICE = 19.99;   // cijena noža u € (promijeni po želji)
const KNIFE_PRICE_2 = 24.99; // cijena noža, Opcija 2 u €
const STAND_PRICE = 7.99;    // cijena stalka u €

const PRODUCTS = [
  { id: 'black',  name: 'Crni karambit',     color: '#222222', price: KNIFE_PRICE,
    options: [{ label: 'Opcija 1', img: 'images/black.jpg' },  { label: 'Opcija 2', img: 'images/black_2.jpg', price: KNIFE_PRICE_2 }] },
  { id: 'blue',   name: 'Plavi karambit',    color: '#1e6bff', price: KNIFE_PRICE,
    options: [{ label: 'Opcija 1', img: 'images/blue.jpg' },   { label: 'Opcija 2', img: 'images/blue_2.jpg', price: KNIFE_PRICE_2 }] },
  { id: 'purple', name: 'Ljubičasti karambit (duga)', color: '#a45cff', price: KNIFE_PRICE,
    options: [{ label: 'Opcija 1', img: 'images/purple.jpg' }, { label: 'Opcija 2', img: 'images/purple_2.jpg', price: KNIFE_PRICE_2 }] },
  { id: 'red',    name: 'Crveni karambit',   color: '#e0262b', price: KNIFE_PRICE,
    options: [{ label: 'Opcija 1', img: 'images/red.jpg' },    { label: 'Opcija 2', img: 'images/red_2.jpg', price: KNIFE_PRICE_2 }] },
  { id: 'yellow', name: 'Žuti (zlatni) karambit', color: '#f2c21b', price: KNIFE_PRICE,
    options: [{ label: 'Opcija 1', img: 'images/yellow.jpg' }, { label: 'Opcija 2', img: 'images/yellow_2.jpg', price: KNIFE_PRICE_2 }] },
  { id: 'stand',  name: 'Stalak za nož',     color: '#555', price: STAND_PRICE, tag: 'Dodatak',
    options: [{ label: 'Standard', img: 'images/stand.jpg' }] },
];

/* ============================================================ */
const $ = s => document.querySelector(s);
const fmt = n => n.toFixed(2).replace('.', ',') + ' €';
const selected = {};              // odabrana opcija po proizvodu
let cart = [];                    // [{key,id,optIndex,qty}]
try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) {}

const save = () => { try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (e) {} };
const find = id => PRODUCTS.find(p => p.id === id);
const priceOf = (p, i) => p.options[i].price ?? p.price;

/* ---------- proizvodi ---------- */
function renderGrid() {
  $('#grid').innerHTML = PRODUCTS.map(p => {
    selected[p.id] ??= 0;
    const o = p.options[selected[p.id]];
    const opts = p.options.length > 1
      ? `<div class="opts">${p.options.map((x, i) =>
          `<button class="opt ${i === selected[p.id] ? 'active' : ''}" data-id="${p.id}" data-i="${i}">${x.label}</button>`).join('')}</div>`
      : '';
    return `
      <article class="card">
        <div class="img"><img id="img-${p.id}" src="${o.img}" alt="${p.name}"></div>
        <div class="body">
          <h3><span class="dot" style="background:${p.color}"></span>${p.name} ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}</h3>
          ${opts}
          <div class="price" id="price-${p.id}">${fmt(priceOf(p, selected[p.id]))}<small>+ besplatna dostava</small></div>
          <button class="btn add" data-id="${p.id}">Dodaj u košaricu</button>
        </div>
      </article>`;
  }).join('');
}

$('#grid').addEventListener('click', e => {
  const opt = e.target.closest('.opt');
  if (opt) {
    const { id, i } = opt.dataset;
    selected[id] = +i;
    $('#img-' + id).src = find(id).options[+i].img;
    $('#price-' + id).firstChild.textContent = fmt(priceOf(find(id), +i));
    opt.parentElement.querySelectorAll('.opt').forEach(b => b.classList.toggle('active', b === opt));
    return;
  }
  const add = e.target.closest('.add');
  if (add) addToCart(add.dataset.id, selected[add.dataset.id]);
});

/* ---------- košarica ---------- */
function addToCart(id, optIndex) {
  const key = id + ':' + optIndex;
  const it = cart.find(c => c.key === key);
  it ? it.qty++ : cart.push({ key, id, optIndex, qty: 1 });
  save(); renderCart(); toast('Dodano u košaricu ✓');
}

const total = () => cart.reduce((s, c) => s + priceOf(find(c.id), c.optIndex) * c.qty, 0);

function renderCart() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  $('#cartCount').textContent = count;
  $('#subtotal').textContent = fmt(total());
  $('#total').textContent = fmt(total());
  $('#checkoutBtn').disabled = !count;
  $('#cartItems').innerHTML = count ? cart.map(c => {
    const p = find(c.id), o = p.options[c.optIndex];
    return `
      <div class="item">
        <img src="${o.img}" alt="">
        <div class="meta"><b>${p.name}</b><span>${o.label} · ${fmt(priceOf(p, c.optIndex))}</span>
          <div class="qty">
            <button data-act="dec" data-key="${c.key}">−</button>${c.qty}
            <button data-act="inc" data-key="${c.key}">+</button>
          </div>
        </div>
        <button class="rm" data-act="rm" data-key="${c.key}">Ukloni</button>
      </div>`;
  }).join('') : '<p class="empty">Košarica je prazna.</p>';
}

$('#cartItems').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const it = cart.find(c => c.key === b.dataset.key); if (!it) return;
  if (b.dataset.act === 'inc') it.qty++;
  if (b.dataset.act === 'dec') it.qty--;
  if (b.dataset.act === 'rm') it.qty = 0;
  cart = cart.filter(c => c.qty > 0);
  save(); renderCart();
});

const drawer = (open) => {
  $('#drawer').classList.toggle('open', open);
  $('#overlay').classList.toggle('show', open);
  $('#drawer').setAttribute('aria-hidden', !open);
};
$('#openCart').onclick = () => drawer(true);
$('#closeCart').onclick = $('#overlay').onclick = () => drawer(false);

/* ---------- plaćanje karticom (Stripe Checkout) ---------- */
$('#checkoutBtn').onclick = async () => {
  if (!cart.length) return;
  const btn = $('#checkoutBtn');
  btn.disabled = true; btn.textContent = 'Preusmjeravam na plaćanje…';
  try {
    const res = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.map(c => ({ id: c.id, optIndex: c.optIndex, qty: c.qty })) }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'Greška');
    window.location = data.url;           // Stripe stranica za plaćanje
  } catch (e) {
    toast('Plaćanje trenutno nije dostupno. Pokušaj ponovno.');
    btn.disabled = false; btn.textContent = 'Plati karticom';
  }
};

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800);
}

$('#year').textContent = new Date().getFullYear();
renderGrid(); renderCart();
