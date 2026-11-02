/**
 * ATELIER ACCESSORIES - CLIENT INTERACTIVITY
 * Features: Flash sale countdown, Cart management, Toast notifications,
 * Lookbook hotspots, Gallery thumbnail switcher, Live search.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMegaDropdowns();
  initCountdownTimer();
  initGallerySwitcher();
  initCartInteractions();
  initLookbookHotspots();
  initColorSwatches();
  initQuantitySpinners();
  initToasts();
  initHeroVideo();
  initAdminSidebar();
});

// Hero Video Autoplay Assurance
function initHeroVideo() {
  const heroVideo = document.querySelector('.portal-bg-video');
  if (!heroVideo) return;
  heroVideo.muted = true;
  heroVideo.play().catch(() => {});
}

// Sticky Header transition
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const isHome = header.classList.contains('home-header');
  const onScroll = () => {
    const threshold = isHome ? 80 : 30;
    if (window.scrollY > threshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Mega Dropdowns hover and click handling
function initMegaDropdowns() {
  const dropdownItems = document.querySelectorAll('.nav-item.has-mega-dropdown');
  if (!dropdownItems.length) return;

  dropdownItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.classList.add('hover-active');
    });
    item.addEventListener('mouseleave', () => {
      item.classList.remove('hover-active');
    });

    const trigger = item.querySelector('.dropdown-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        const isActive = item.classList.contains('is-active');
        dropdownItems.forEach(other => other.classList.remove('is-active'));
        if (!isActive) {
          item.classList.add('is-active');
        }
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item.has-mega-dropdown')) {
      dropdownItems.forEach(item => item.classList.remove('is-active'));
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
      thumbs.forEach(t => {
        t.classList.remove('active');
        t.style.borderColor = 'transparent';
      });
      thumb.classList.add('active');
      thumb.style.borderColor = '#0F172A';
      const targetSrc = thumb.dataset.large || thumb.src;
      mainImg.src = targetSrc;

      if (typeof window.syncVariantFromImage === 'function') {
        window.syncVariantFromImage(targetSrc);
      }
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
  if (!product || !product.id) return;

  // Strict price validation: NEVER allow 0 VND or NaN
  let price = Number(product.price);
  if (isNaN(price) || price <= 0) {
    showToast('Lỗi: Giá sản phẩm không hợp lệ, không thể thêm vào giỏ hàng!', 'error');
    console.error('addToCart blocked invalid price:', product);
    return;
  }
  product.price = price;

  // Strict integer quantity validation
  product.quantity = Math.max(1, parseInt(product.quantity, 10) || 1);

  const cart = getCart();
  const existing = cart.find(item => item.id === product.id && item.color === product.color);
  if (existing) {
    const prevQty = parseInt(existing.quantity, 10) || 0;
    existing.quantity = prevQty + product.quantity;
    // Always preserve or repair valid price
    existing.price = price;
  } else {
    cart.push(product);
  }
  saveCart(cart);
  showToast(`Đã thêm ${product.quantity}x "${product.name}" vào giỏ hàng!`, 'success');
}

function initCartInteractions() {
  updateCartBadge();

  // Quick Add buttons on product cards
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (!card) return;
      const rawPrice = card.dataset.price;
      const cleanPrice = Number(rawPrice) || 0;
      if (cleanPrice <= 0) {
        showToast('Lỗi: Giá sản phẩm không hợp lệ!', 'error');
        return;
      }
      const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: cleanPrice,
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
      const cleanColor = detailAddBtn.dataset.color || (activeColor ? (activeColor.dataset.name || activeColor.textContent.trim()) : 'Tiêu chuẩn');
      
      // Multi-layer price resolution:
      // 1. From button dataset.price
      let resolvedPrice = Number(detailAddBtn.dataset.price);

      // 2. If invalid, try active variant dataset.price
      if (!resolvedPrice || isNaN(resolvedPrice) || resolvedPrice <= 0) {
        if (activeColor && activeColor.dataset.price && Number(activeColor.dataset.price) > 0) {
          resolvedPrice = Number(activeColor.dataset.price);
        }
      }

      // 3. If still invalid, parse text directly from #detail-price-main
      if (!resolvedPrice || isNaN(resolvedPrice) || resolvedPrice <= 0) {
        const priceText = document.getElementById('detail-price-main')?.textContent || '';
        const digits = priceText.replace(/[^\d]/g, '');
        if (digits) resolvedPrice = Number(digits);
      }

      // Security check: Must never be 0 or negative
      if (!resolvedPrice || isNaN(resolvedPrice) || resolvedPrice <= 0) {
        showToast('Lỗi: Không tìm thấy giá sản phẩm hợp lệ. Vui lòng tải lại trang!', 'error');
        return;
      }

      const cleanQty = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);

      const product = {
        id: detailAddBtn.dataset.id,
        name: detailAddBtn.dataset.name,
        price: resolvedPrice,
        image: detailAddBtn.dataset.image,
        color: cleanColor,
        quantity: cleanQty
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

// Mobile Navigation Drawer Toggle
function initMobileDrawer() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('close-drawer-btn');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const accordionBtn = document.getElementById('shop-accordion-btn');
  const accordionContent = document.getElementById('shop-accordion-content');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeDrawer = () => {
    if (drawer) {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  if (accordionBtn && accordionContent) {
    accordionBtn.addEventListener('click', () => {
      accordionContent.classList.toggle('open');
      const icon = accordionBtn.querySelector('i');
      if (icon) {
        icon.style.transform = accordionContent.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }
}

// Header Search Suggestions
function initSearchSuggestions() {
  const searchInput = document.getElementById('header-search-input');
  const suggestions = document.getElementById('search-suggestions');
  if (!searchInput || !suggestions) return;

  searchInput.addEventListener('focus', () => {
    suggestions.classList.add('show');
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.remove('show');
    }
  });
}

// Mega Dropdown (Click Toggle + Smooth Hover + Outside Dismiss)
function initMegaDropdown() {
  const megaItems = document.querySelectorAll('.nav-item.has-mega-dropdown');
  if (!megaItems.length) return;

  megaItems.forEach(item => {
    const trigger = item.querySelector('.dropdown-trigger');

    // Desktop hover
    item.addEventListener('mouseenter', () => {
      megaItems.forEach(other => {
        if (other !== item) other.classList.remove('is-active');
      });
      item.classList.add('is-active');
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-active');
    });

    // Click / Touch toggle
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth < 1200) {
          e.preventDefault();
          const wasActive = item.classList.contains('is-active');
          megaItems.forEach(other => other.classList.remove('is-active'));
          if (!wasActive) item.classList.add('is-active');
        }
      });
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item.has-mega-dropdown')) {
      megaItems.forEach(item => item.classList.remove('is-active'));
    }
  });
}

// Call initializers on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  initSearchSuggestions();
  initMegaDropdown();
  initHeroSlider();
});

// Hero Portal Slider (SceneAI Inset Card)
function initHeroSlider() {
  const portal = document.querySelector('.sceneai-portal-card, .hero-slider-section');
  if (!portal) return;

  const slides = portal.querySelectorAll('.portal-slide, .hero-slide');
  const dots = portal.querySelectorAll('.portal-dot, .hero-dot');
  const prevBtn = portal.querySelector('.portal-nav-arrow.prev, .hero-slider-nav.prev');
  const nextBtn = portal.querySelector('.portal-nav-arrow.next, .hero-slider-nav.next');

  if (!slides.length) return;

  let currentIndex = 0;
  let timer = null;

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

    currentIndex = (index + slides.length) % slides.length;

    slides[currentIndex].classList.add('active');
    if (dots[currentIndex]) dots[currentIndex].classList.add('active');
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5500);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentIndex - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentIndex + 1);
      startAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      startAutoplay();
    });
  });

  portal.addEventListener('mouseenter', stopAutoplay);
  portal.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

// Admin Sidebar Collapsible Toggle & LocalStorage State
function initAdminSidebar() {
  const toggleBtn = document.getElementById('adminSidebarToggle');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  const adminLayout = document.querySelector('.admin-layout');

  if (!adminLayout && !toggleBtn && !collapseBtn) return;

  function setSidebarState(isCollapsed) {
    if (isCollapsed) {
      document.documentElement.classList.add('admin-sidebar-collapsed');
      if (adminLayout) adminLayout.classList.add('collapsed');
      try { localStorage.setItem('admin_sidebar_collapsed', 'true'); } catch (e) {}
    } else {
      document.documentElement.classList.remove('admin-sidebar-collapsed');
      if (adminLayout) adminLayout.classList.remove('collapsed');
      try { localStorage.setItem('admin_sidebar_collapsed', 'false'); } catch (e) {}
    }

    // Trigger window resize so Chart.js charts and layout recalculate width smoothly
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 240);

    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  function toggleSidebar() {
    const isCurrentlyCollapsed = document.documentElement.classList.contains('admin-sidebar-collapsed') ||
      (adminLayout && adminLayout.classList.contains('collapsed'));
    setSidebarState(!isCurrentlyCollapsed);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  }

  if (collapseBtn) {
    collapseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  }

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar (familiar standard)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      if (document.querySelector('.admin-layout')) {
        e.preventDefault();
        toggleSidebar();
      }
    }
  });
}
