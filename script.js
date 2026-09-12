'use strict';

/* ==========================================================================
   DATA
   ========================================================================== */
const PRICE = 2500;
const WHATSAPP_NUMBER = '254720540961'; // 0720 540 961 in international format
const ADMIN_EMAIL = 'Expensivecloset869@gmail.com';

const PRODUCTS = [
  { id: 1, name: 'The Mogul',    tagline: 'Clean lines, boardroom-ready polish.',   image: 'assets/images/shoe1.jpg' },
  { id: 2, name: 'The Baron',    tagline: 'Heritage tones, old-money finish.',      image: 'assets/images/shoe2.jpg' },
  { id: 3, name: 'The Diplomat', tagline: 'Sharp silhouette, made for entrances.',  image: 'assets/images/shoe3.jpg' },
  { id: 4, name: 'The Heiress',  tagline: 'Soft palette, statement heel.',          image: 'assets/images/shoe4.jpg' },
  { id: 5, name: 'The Tycoon',   tagline: 'Bold profile, unmistakable stance.',     image: 'assets/images/shoe5.jpg' },
];

// Cart lives in memory only — it resets on page reload by design.
const cart = {}; // { [productId]: quantity }

/* ==========================================================================
   HELPERS
   ========================================================================== */
function formatKsh(amount){
  return 'KSH ' + amount.toLocaleString('en-KE');
}

function findProduct(id){
  return PRODUCTS.find(p => p.id === id);
}

function handleImgError(imgEl){
  imgEl.parentElement.classList.add('img-fallback');
}
window.handleImgError = handleImgError;

function showToast(message){
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ==========================================================================
   RENDER: SHOP GRID
   ========================================================================== */
function renderShopGrid(){
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = PRODUCTS.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name} sneaker" onerror="handleImgError(this)">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-tagline">${product.tagline}</p>
        <span class="product-price">${formatKsh(PRICE)}</span>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm" data-add="${product.id}">Add to cart</button>
          <button class="btn btn-ghost btn-sm" data-quick="${product.id}">WhatsApp</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.add)));
  });
  grid.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', () => quickOrder(Number(btn.dataset.quick)));
  });
}

/* ==========================================================================
   CART LOGIC
   ========================================================================== */
function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  const product = findProduct(id);
  showToast(`Added ${product.name} to cart`);
}

function changeQty(id, delta){
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function removeFromCart(id){
  delete cart[id];
  renderCart();
}

function cartEntries(){
  return Object.keys(cart).map(id => {
    const product = findProduct(Number(id));
    return { product, qty: cart[id] };
  });
}

function cartTotal(){
  return cartEntries().reduce((sum, entry) => sum + entry.qty * PRICE, 0);
}

function cartCount(){
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function renderCart(){
  const itemsEl = document.getElementById('cartItems');
  const entries = cartEntries();

  if (entries.length === 0){
    itemsEl.innerHTML = `<p class="cart-empty">Your cart is empty. Add a pair to get started.</p>`;
  } else {
    itemsEl.innerHTML = entries.map(({ product, qty }) => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${product.image}" alt="${product.name}" onerror="handleImgError(this)">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">${formatKsh(PRICE)} each</div>
        </div>
        <div class="cart-item-right">
          <button class="cart-item-remove" data-remove="${product.id}">Remove</button>
          <div class="qty-stepper">
            <button class="qty-btn" data-minus="${product.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${qty}</span>
            <button class="qty-btn" data-plus="${product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>
    `).join('');

    itemsEl.querySelectorAll('[data-plus]').forEach(btn =>
      btn.addEventListener('click', () => changeQty(Number(btn.dataset.plus), 1)));
    itemsEl.querySelectorAll('[data-minus]').forEach(btn =>
      btn.addEventListener('click', () => changeQty(Number(btn.dataset.minus), -1)));
    itemsEl.querySelectorAll('[data-remove]').forEach(btn =>
      btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.remove))));
  }

  document.getElementById('cartTotal').textContent = formatKsh(cartTotal());

  const countEl = document.getElementById('cartCount');
  const count = cartCount();
  countEl.textContent = count;
  countEl.hidden = count === 0;
}

/* ==========================================================================
   WHATSAPP ORDERING
   ========================================================================== */
function openWhatsapp(message){
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}

function quickOrder(id){
  const product = findProduct(id);
  const message =
`Hello Expensive Luks! I would like to order:

- ${product.name} — ${formatKsh(PRICE)}

Is it available?`;
  openWhatsapp(message);
}

function checkoutOrder(){
  const entries = cartEntries();
  if (entries.length === 0){
    showToast('Your cart is empty');
    return;
  }
  const lines = entries.map(({ product, qty }) =>
    `- ${product.name} x${qty} — ${formatKsh(qty * PRICE)}`
  ).join('\n');

  const message =
`Hello Expensive Luks! I would like to place an order:

${lines}

Total: ${formatKsh(cartTotal())}

Name:
Delivery location:`;

  openWhatsapp(message);
}

/* ==========================================================================
   CART DRAWER OPEN/CLOSE
   ========================================================================== */
function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').setAttribute('aria-hidden', 'false');
  document.getElementById('cartToggle').setAttribute('aria-expanded', 'true');
}
function closeCart(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').setAttribute('aria-hidden', 'true');
  document.getElementById('cartToggle').setAttribute('aria-expanded', 'false');
}

/* ==========================================================================
   HERO 3D TILT
   ========================================================================== */
function initHeroTilt(){
  const stage = document.getElementById('heroStage');
  const card = document.getElementById('heroShoeCard');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!stage || !card || reduceMotion) return;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * 22;
    const rotateX = y * -22;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  stage.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

/* ==========================================================================
   HEADER + NAV
   ========================================================================== */
function initHeaderScroll(){
  const header = document.getElementById('siteHeader');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileNav(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

/* ==========================================================================
   INIT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderShopGrid();
  renderCart();
  initHeroTilt();
  initHeaderScroll();
  initMobileNav();

  document.getElementById('cartToggle').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('cartCheckout').addEventListener('click', checkoutOrder);

  document.getElementById('heroWhatsapp').addEventListener('click', (e) => {
    e.preventDefault();
    openWhatsapp('Hello Expensive Luks! I would like to know more about your collection.');
  });
});
