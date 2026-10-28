/**
 * ATELIER ACCESSORIES - CLIENT INTERACTIVITY
 * Features: Flash sale countdown, Cart management, Toast notifications,
 * Lookbook hotspots, Gallery thumbnail switcher, Live search.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initCountdownTimer();
  initGallerySwitcher();
  initCartInteractions();
  initLookbookHotspots();
  initColorSwatches();
  initQuantitySpinners();
  initToasts();
});

// Sticky Header transition
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Flash Sale Countdown Timer (Hours : Minutes : Seconds)
function initCountdownTimer() {
  const timerHours = document.getElementById('timer-hours');
  const timerMins = document.getElementById('timer-mins');
  const timerSecs = document.getElementById('timer-secs');
  if (!timerHours || !timerMins || !timerSecs) return;

  // Set target to midnight or 8 hours from now
  let totalSeconds = 8 * 3600 + 45 * 60 + 20;

  setInterval(() => {
    if (totalSeconds <= 0) totalSeconds = 24 * 3600;
    totalSeconds--;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    timerHours.textContent = String(h).padStart(2, '0');
    timerMins.textContent = String(m).padStart(2, '0');
    timerSecs.textContent = String(s).padStart(2, '0');
  }, 1000);
}

// Product Detail Image Gallery Switcher
function initGallerySwitcher() {
  const mainImg = document.getElementById('main-product-img');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.src = thumb.dataset.large || thumb.src;
    });
  });
}

// Cart System (LocalStorage + Backend sync)
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('atelier_cart')) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('atelier_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(badge => {
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'flex' : 'none';
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id && item.color === product.color);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + (product.quantity || 1);
  } else {
    cart.push(product);
  }
  saveCart(cart);
  showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
}

function initCartInteractions() {
  updateCartBadge();

  // Quick Add buttons on product cards
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (!card) return;
      const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseInt(card.dataset.price, 10),
        image: card.dataset.image,
        color: card.dataset.color || 'Tiêu chuẩn',
        quantity: 1
      };
      addToCart(product);
    });
  });

  // Product detail "Add To Cart" button
  const detailAddBtn = document.getElementById('detail-add-to-cart');
  if (detailAddBtn) {
    detailAddBtn.addEventListener('click', () => {
      const activeColor = document.querySelector('.variant-btn.active');
      const qtyInput = document.querySelector('.qty-input');
      const product = {
        id: detailAddBtn.dataset.id,
        name: detailAddBtn.dataset.name,
        price: parseInt(detailAddBtn.dataset.price, 10),
        image: detailAddBtn.dataset.image,
        color: activeColor ? activeColor.textContent.trim() : 'Mặc định',
        quantity: qtyInput ? parseInt(qtyInput.value, 10) : 1
      };
      addToCart(product);
    });
  }
}

// Interactive Lookbook Hotspots
function initLookbookHotspots() {
  const hotspots = document.querySelectorAll('.lookbook-hotspot');
  hotspots.forEach(spot => {
    spot.addEventListener('mouseenter', () => {
      const targetId = spot.dataset.target;
      const card = document.getElementById(targetId);
      if (card) {
        card.style.borderColor = 'var(--text-main)';
        card.style.transform = 'translateX(10px)';
        card.style.boxShadow = 'var(--shadow-md)';
      }
    });
    spot.addEventListener('mouseleave', () => {
      const targetId = spot.dataset.target;
      const card = document.getElementById(targetId);
      if (card) {
        card.style.borderColor = 'var(--border-subtle)';
        card.style.transform = 'translateX(0)';
        card.style.boxShadow = 'none';
      }
    });
  });
}

// Color Swatches interaction
function initColorSwatches() {
  document.querySelectorAll('.swatch-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = dot.closest('.product-card');
      if (parent) {
        parent.querySelectorAll('.swatch-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        if (dot.dataset.img) {
          const mainImg = parent.querySelector('.primary-img');
          if (mainImg) mainImg.src = dot.dataset.img;
        }
      }
    });
  });

  // Variant buttons on detail page
  document.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Quantity Spinner (+ / -)
function initQuantitySpinners() {
  document.querySelectorAll('.qty-spinner').forEach(spinner => {
    const minus = spinner.querySelector('.qty-minus');
    const plus = spinner.querySelector('.qty-plus');
    const input = spinner.querySelector('.qty-input');
    if (!input) return;

    if (minus) {
      minus.addEventListener('click', () => {
        let val = parseInt(input.value, 10) || 1;
        if (val > 1) {
          input.value = val - 1;
          input.dispatchEvent(new Event('change'));
        }
      });
    }
    if (plus) {
      plus.addEventListener('click', () => {
        let val = parseInt(input.value, 10) || 1;
        input.value = val + 1;
        input.dispatchEvent(new Event('change'));
      });
    }
  });
}

// Toast Notification System
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ')}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function initToasts() {
  // Expose to window
  window.showToast = showToast;
}
