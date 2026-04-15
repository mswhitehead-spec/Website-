// ===== UTILITY FUNCTIONS =====
function formatPrice(amount) {
  return amount.toLocaleString('da-DK') + ' DKK';
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getCategoryLabel(category) {
  const labels = {
    'running-shoes': 'Running Shoes',
    't-shirts': 'T-Shirts',
    'shorts': 'Shorts'
  };
  return labels[category] || category;
}

function getCategoryIcon(category) {
  const icons = {
    'running-shoes': 'shoe',
    't-shirts': 'tshirt',
    'shorts': 'shorts'
  };
  return icons[category] || 'shoe';
}

function getProductsByCategory(category) {
  if (!category || category === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function getFeaturedProducts() {
  const featured = PRODUCTS.filter(p => p.badge === 'Bestseller' || p.badge === 'New');
  const others = PRODUCTS.filter(p => !p.badge || p.badge === 'Sale');
  return [...featured, ...others].slice(0, 8);
}

// ===== SVG PLACEHOLDER GENERATOR =====
function generatePlaceholder(product) {
  const color = product.colorHex || '#5a6a7a';
  const lighterColor = lightenColor(color, 30);
  const brandInitial = product.brand.charAt(0).toUpperCase();

  let silhouette = '';
  if (product.category === 'running-shoes') {
    silhouette = `
      <g transform="translate(40, 85) scale(2.2)" opacity="0.15">
        <path d="M10 45 C10 35 15 30 25 28 C30 27 35 20 40 18 C45 16 50 18 52 22 C54 26 58 24 62 22 C66 20 70 22 72 26 C74 30 75 35 75 38 C75 42 72 45 68 45 Z" fill="white"/>
        <path d="M5 45 L75 45" stroke="white" stroke-width="2"/>
      </g>`;
  } else if (product.category === 't-shirts') {
    silhouette = `
      <g transform="translate(55, 55) scale(2.5)" opacity="0.15">
        <path d="M25 8 L20 8 L8 18 L15 22 L20 17 L20 52 L60 52 L60 17 L65 22 L72 18 L60 8 L55 8 C55 8 50 15 40 15 C30 15 25 8 25 8 Z" fill="white"/>
      </g>`;
  } else if (product.category === 'shorts') {
    silhouette = `
      <g transform="translate(65, 60) scale(2.5)" opacity="0.15">
        <path d="M18 10 L62 10 L62 20 C62 25 58 28 55 32 L55 50 L42 50 L40 30 L38 50 L25 50 L25 32 C22 28 18 25 18 20 Z" fill="white"/>
      </g>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <defs>
      <linearGradient id="bg-${product.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color}"/>
        <stop offset="100%" style="stop-color:${lighterColor}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#bg-${product.id})"/>
    ${silhouette}
    <circle cx="355" cy="40" r="22" fill="rgba(255,255,255,0.15)"/>
    <text x="355" y="47" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,0.6)">${brandInitial}</text>
    <text x="200" y="470" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="500" fill="rgba(255,255,255,0.4)" text-transform="uppercase" letter-spacing="2">${product.brand.toUpperCase()}</text>
  </svg>`;

  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ===== PRODUCT CARD RENDERER =====
function renderProductCard(product) {
  const badgeHTML = product.badge
    ? `<span class="product-badge badge-${product.badge.toLowerCase()}">${product.badge}</span>`
    : '';

  const priceClass = product.badge === 'Sale' ? 'product-price sale' : 'product-price';
  const imageSrc = product.image || generatePlaceholder(product);

  return `
    <article class="product-card fade-in" data-product-id="${product.id}">
      <a href="product-detail.html?id=${product.id}" class="product-card-link">
        <div class="product-card-image">
          <img src="${imageSrc}" alt="${product.name} by ${product.brand}" loading="lazy">
          ${badgeHTML}
          <div class="product-quick-add">
            <button onclick="event.preventDefault(); event.stopPropagation(); quickAddToCart('${product.id}')">Quick Add</button>
          </div>
        </div>
        <div class="product-card-info">
          <div class="product-brand">${product.brand}</div>
          <h3 class="product-name">${product.name}</h3>
          <div class="${priceClass}">${formatPrice(product.price)}</div>
        </div>
      </a>
    </article>`;
}

function renderProductGrid(products, container) {
  if (!container) return;
  container.innerHTML = products.map(renderProductCard).join('');
  observeFadeIn();
}

function quickAddToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;
  const defaultSize = product.sizes[Math.floor(product.sizes.length / 2)];
  Cart.addItem(productId, defaultSize, 1);
  Cart.openDrawer();
}

// ===== HEADER =====
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  // Sticky shadow on scroll
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Mobile menu
  const hamburger = document.querySelector('.hamburger');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu-close');

  function openMobileMenu() {
    mobileOverlay.classList.add('active');
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileOverlay.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // Search
  const searchBtn = document.querySelector('.search-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchInput = document.querySelector('.search-input');

  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput && searchInput.focus(), 300);
    });

    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchOverlay.classList.remove('active');
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        if (query.length < 2) {
          resultsContainer.innerHTML = '';
          return;
        }

        const results = PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        ).slice(0, 6);

        if (results.length === 0) {
          resultsContainer.innerHTML = '<div class="search-no-results">No products found</div>';
          return;
        }

        resultsContainer.innerHTML = results.map(p => `
          <a href="product-detail.html?id=${p.id}" class="search-result-item">
            <div class="search-result-image">
              <img src="${generatePlaceholder(p)}" alt="${p.name}">
            </div>
            <div class="search-result-info">
              <div class="search-result-brand">${p.brand}</div>
              <div class="search-result-name">${p.name}</div>
              <div class="search-result-price">${formatPrice(p.price)}</div>
            </div>
          </a>
        `).join('');
      });
    }
  }

  // Cart button
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => Cart.openDrawer());
  }
}

// ===== INTERSECTION OBSERVER FOR FADE-IN =====
function observeFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
}

// ===== NEWSLETTER =====
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (input && input.value.trim()) {
      const success = document.querySelector('.newsletter-success');
      if (success) {
        success.style.display = 'block';
        form.style.display = 'none';
      }
    }
  });
}

// ===== PAGE INITIALIZATION =====
function initPage() {
  const page = document.body.dataset.page;

  initHeader();
  initNewsletter();

  if (page === 'home') {
    initHomePage();
  } else if (page === 'products') {
    initProductsPage();
  } else if (page === 'detail') {
    initDetailPage();
  }

  // Update cart badge
  Cart.updateBadge();
}

function initHomePage() {
  const featuredGrid = document.querySelector('.featured-grid');
  if (featuredGrid) {
    renderProductGrid(getFeaturedProducts(), featuredGrid);
  }
}

function initProductsPage() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || 'all';

  // Update active filter pill
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.category === category);
  });

  // Update page title and breadcrumb
  const pageTitle = document.querySelector('.page-title h1');
  const breadcrumbSpan = document.querySelector('.breadcrumb span');
  const productCount = document.querySelector('.product-count');

  if (category !== 'all' && pageTitle) {
    pageTitle.textContent = getCategoryLabel(category);
  }
  if (category !== 'all' && breadcrumbSpan) {
    breadcrumbSpan.textContent = getCategoryLabel(category);
  }

  const products = getProductsByCategory(category);
  if (productCount) {
    productCount.textContent = `${products.length} products`;
  }

  renderAndSort(products);

  // Filter pills click
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.category;
      const url = cat === 'all' ? 'products.html' : `products.html?category=${cat}`;
      window.location.href = url;
    });
  });

  // Sort
  const sortSelect = document.querySelector('.sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const products = getProductsByCategory(category);
      renderAndSort(products);
    });
  }
}

function renderAndSort(products) {
  const sortSelect = document.querySelector('.sort-select');
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  let sorted = [...products];
  if (sortSelect) {
    const sortValue = sortSelect.value;
    if (sortValue === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sortValue === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sortValue === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderProductGrid(sorted, grid);
}

function initDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const product = getProductById(productId);

  if (!product) {
    document.querySelector('.product-detail-container').innerHTML =
      '<div class="container" style="text-align:center;padding:96px 24px"><h2>Product not found</h2><p>The product you\'re looking for doesn\'t exist.</p><a href="products.html" class="btn btn-primary" style="margin-top:24px">Browse All Products</a></div>';
    return;
  }

  // Fill in product details
  const img = document.querySelector('.product-detail-image img');
  if (img) {
    img.src = generatePlaceholder(product);
    img.alt = `${product.name} by ${product.brand}`;
  }

  const badge = document.querySelector('.detail-badge');
  if (badge && product.badge) {
    badge.textContent = product.badge;
    badge.classList.add(`badge-${product.badge.toLowerCase()}`);
    badge.style.display = 'inline-block';
  }

  setText('.detail-brand', product.brand);
  setText('.detail-name', product.name);
  setText('.detail-price', formatPrice(product.price));
  setText('.detail-description', product.description);
  setText('.detail-materials', product.materials || '');
  setText('.detail-weight', product.weight ? `Weight: ${product.weight}` : '');

  if (product.badge === 'Sale') {
    const priceEl = document.querySelector('.detail-price');
    if (priceEl) priceEl.classList.add('sale');
  }

  // Breadcrumb
  const breadcrumbCat = document.querySelector('.breadcrumb-category');
  if (breadcrumbCat) {
    breadcrumbCat.textContent = getCategoryLabel(product.category);
    breadcrumbCat.href = `products.html?category=${product.category}`;
  }
  const breadcrumbProduct = document.querySelector('.breadcrumb-product');
  if (breadcrumbProduct) breadcrumbProduct.textContent = product.name;

  // Update page title
  document.title = `${product.name} - Nordic Trail`;

  // Size selector
  const sizeOptions = document.querySelector('.size-options');
  if (sizeOptions) {
    sizeOptions.innerHTML = product.sizes.map(size =>
      `<button class="size-btn" data-size="${size}">${size}</button>`
    ).join('');

    sizeOptions.addEventListener('click', (e) => {
      if (e.target.classList.contains('size-btn')) {
        sizeOptions.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        document.querySelector('.add-to-cart-btn').disabled = false;
      }
    });
  }

  // Add to cart
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const selectedSize = sizeOptions.querySelector('.size-btn.selected');
      if (!selectedSize) return;
      Cart.addItem(product.id, selectedSize.dataset.size, 1);
      Cart.openDrawer();
    });
  }

  // Accordion
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      trigger.classList.toggle('open');
      const content = trigger.nextElementSibling;
      if (content) content.classList.toggle('open');
    });
  });

  // Related products
  const relatedGrid = document.querySelector('.related-grid');
  if (relatedGrid) {
    const related = PRODUCTS
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    renderProductGrid(related, relatedGrid);
  }
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

// ===== INIT ON DOM READY =====
document.addEventListener('DOMContentLoaded', initPage);
