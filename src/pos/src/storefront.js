const products = [
  { id: 'house-blend', name: 'House Blend', detail: 'Chocolate · orange · honey', price: 18, category: 'Coffee', image: 'beans', tag: 'BESTSELLER' },
  { id: 'single-origin', name: 'Seasonal Single Origin', detail: 'Stone fruit · jasmine · cacao', price: 22, category: 'Coffee', image: 'beans', tag: 'JUST IN' },
  { id: 'ceramic-mug', name: 'Everyday Ceramic Mug', detail: 'Hand-finished stoneware · 12 oz', price: 28, category: 'Gear', image: 'mug' },
  { id: 'travel-tumbler', name: 'Daily Travel Tumbler', detail: 'Double-wall stainless steel', price: 34, category: 'Gear', image: 'tumbler' },
  { id: 'decaf', name: 'Easy Does It Decaf', detail: 'Caramel · almond · cocoa', price: 19, category: 'Coffee', image: 'beans', tag: 'SLOW EVENINGS' },
  { id: 'canvas-tote', name: 'Corner Roast Canvas Tote', detail: 'Heavyweight organic cotton', price: 24, category: 'Everyday', image: 'tote' },
  { id: 'coffee-kit', name: 'The Slow Morning Kit', detail: 'Pour-over dripper · filters · coffee', price: 46, category: 'Gear', image: 'mug', tag: 'A GOOD GIFT' },
  { id: 'cold-brew', name: 'Weekend Cold Brew', detail: 'Smooth, ready-to-pour · 32 oz', price: 16, category: 'Coffee', image: 'tumbler' },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const grid = document.querySelector('#product-grid');
const search = document.querySelector('#product-search');
const sort = document.querySelector('#sort-products');
const cartButton = document.querySelector('.cart-trigger');
const cartPanel = document.querySelector('.cart-panel');
const cartBackdrop = document.querySelector('.cart-backdrop');
const cartItems = document.querySelector('#cart-items');
const cartEmpty = document.querySelector('#cart-empty');
const cartFooter = document.querySelector('.cart-footer');
const cartCount = document.querySelector('.cart-count');
const toast = document.querySelector('.toast');
const cart = new Map();
let category = 'All';
let toastTimer;

function productImage(product) {
  return `<div class="product-image product-image-${product.image}" role="img" aria-label="${product.name}"><img src="/storefront/coffee-products.png" alt="" /></div>`;
}

function renderProducts() {
  const term = search.value.trim().toLowerCase();
  let visible = products.filter((product) => (category === 'All' || product.category === category)
    && `${product.name} ${product.detail}`.toLowerCase().includes(term));
  if (sort.value === 'price-asc') visible = [...visible].sort((a, b) => a.price - b.price);
  if (sort.value === 'price-desc') visible = [...visible].sort((a, b) => b.price - a.price);
  grid.innerHTML = visible.length ? visible.map((product) => `
    <article class="product-card">
      <div class="product-visual">${productImage(product)}${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}<button class="quick-add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">+</button></div>
      <div class="product-info"><div><h3>${product.name}</h3><p>${product.detail}</p></div><strong>${money.format(product.price)}</strong></div>
      <button class="product-add" type="button" data-add="${product.id}">Add to bag <span aria-hidden="true">+</span></button>
    </article>`).join('') : '<p class="no-results">Nothing here by that name. Try another search.</p>';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

function renderCart() {
  const entries = [...cart.values()];
  const quantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = entries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  cartCount.textContent = String(quantity);
  cartItems.innerHTML = entries.map(({ product, quantity: count }) => `
    <article class="cart-line"><div class="cart-thumb">${productImage(product)}</div><div class="cart-line-copy"><h3>${product.name}</h3><p>${money.format(product.price)}</p><div class="quantity-control"><button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Remove one ${product.name}">−</button><span>${count}</span><button type="button" data-quantity="${product.id}" data-change="1" aria-label="Add one ${product.name}">+</button></div></div><strong>${money.format(product.price * count)}</strong></article>`).join('');
  cartEmpty.hidden = quantity > 0;
  cartFooter.hidden = quantity === 0;
  document.querySelector('#cart-subtotal').textContent = money.format(subtotal);
}

function setCartOpen(open) {
  cartPanel.classList.toggle('open', open);
  cartPanel.setAttribute('aria-hidden', String(!open));
  cartBackdrop.hidden = !open;
  document.body.classList.toggle('cart-open', open);
  if (open) document.querySelector('.close-cart').focus();
  else cartButton.focus();
}

grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.add);
  if (!product) return;
  const entry = cart.get(product.id) || { product, quantity: 0 };
  entry.quantity += 1;
  cart.set(product.id, entry);
  renderCart();
  showToast(`${product.name} added to your bag`);
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-quantity]');
  if (!button) return;
  const entry = cart.get(button.dataset.quantity);
  if (!entry) return;
  entry.quantity += Number(button.dataset.change);
  if (entry.quantity <= 0) cart.delete(button.dataset.quantity);
  renderCart();
});

document.querySelectorAll('.category-chip').forEach((button) => button.addEventListener('click', () => {
  category = button.dataset.category;
  document.querySelectorAll('.category-chip').forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
  renderProducts();
}));

search.addEventListener('input', renderProducts);
sort.addEventListener('change', renderProducts);
document.querySelector('.search-toggle').addEventListener('click', () => {
  search.focus();
  document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' });
});
cartButton.addEventListener('click', () => setCartOpen(true));
document.querySelector('.close-cart').addEventListener('click', () => setCartOpen(false));
document.querySelector('.continue-shopping').addEventListener('click', () => setCartOpen(false));
cartBackdrop.addEventListener('click', () => setCartOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cartPanel.classList.contains('open')) setCartOpen(false);
});
document.querySelector('.checkout-button').addEventListener('click', () => showToast('Checkout will be available when payments are connected.'));
document.querySelector('#newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#newsletter-message').textContent = 'Thanks for stopping by. Newsletter signup is a storefront preview.';
  event.currentTarget.reset();
});

renderProducts();
renderCart();
