// ===== CART MODULE =====
const Cart = (() => {
  const STORAGE_KEY = 'nordicTrailCart';

  function getItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateBadge();
  }

  function addItem(productId, size, quantity) {
    const items = getItems();
    const existing = items.find(i => i.productId === productId && i.size === size);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId, size, quantity });
    }
    saveItems(items);
    renderDrawer();
  }

  function removeItem(index) {
    const items = getItems();
    items.splice(index, 1);
    saveItems(items);
    renderDrawer();
  }

  function updateQuantity(index, newQty) {
    const items = getItems();
    if (newQty <= 0) {
      items.splice(index, 1);
    } else {
      items[index].quantity = newQty;
    }
    saveItems(items);
    renderDrawer();
  }

  function getTotal() {
    return getItems().reduce((sum, item) => {
      const product = getProductById(item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  function getCount() {
    return getItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateBadge() {
    const badge = document.querySelector('.cart-count');
    if (!badge) return;
    const count = getCount();
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }

  function openDrawer() {
    const overlay = document.querySelector('.cart-overlay');
    const drawer = document.querySelector('.cart-drawer');
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderDrawer();
  }

  function closeDrawer() {
    const overlay = document.querySelector('.cart-overlay');
    const drawer = document.querySelector('.cart-drawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderDrawer() {
    const itemsContainer = document.querySelector('.cart-items');
    const footerEl = document.querySelector('.cart-drawer-footer');
    const headerEl = document.querySelector('.cart-drawer-header h3');
    if (!itemsContainer) return;

    const items = getItems();
    const count = getCount();

    if (headerEl) {
      headerEl.textContent = `Your Cart (${count})`;
    }

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p>Your cart is empty</p>
          <a href="products.html" class="btn btn-outline" style="margin-top:16px;display:inline-flex">Start Shopping</a>
        </div>`;
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (footerEl) footerEl.style.display = 'block';

    itemsContainer.innerHTML = items.map((item, index) => {
      const product = getProductById(item.productId);
      if (!product) return '';
      const imageSrc = generatePlaceholder(product);
      return `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${imageSrc}" alt="${product.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-brand">${product.brand}</div>
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-size">Size: ${item.size}</div>
            <div class="cart-item-bottom">
              <div class="quantity-controls">
                <button class="qty-btn" onclick="Cart.updateQuantity(${index}, ${item.quantity - 1})">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="Cart.updateQuantity(${index}, ${item.quantity + 1})">+</button>
              </div>
              <div class="cart-item-price">${formatPrice(product.price * item.quantity)}</div>
            </div>
            <button class="cart-item-remove" onclick="Cart.removeItem(${index})">Remove</button>
          </div>
        </div>`;
    }).join('');

    // Update subtotal
    const subtotalEl = document.querySelector('.cart-subtotal-amount');
    if (subtotalEl) {
      subtotalEl.textContent = formatPrice(getTotal());
    }

    updateBadge();
  }

  function initDrawer() {
    // Close button
    const closeBtn = document.querySelector('.cart-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Overlay click
    const overlay = document.querySelector('.cart-overlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    // Continue shopping
    const continueBtn = document.querySelector('.cart-continue');
    if (continueBtn) continueBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
    });
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initDrawer();
    updateBadge();
  });

  return {
    addItem,
    removeItem,
    updateQuantity,
    getItems,
    getTotal,
    getCount,
    updateBadge,
    openDrawer,
    closeDrawer,
    renderDrawer
  };
})();
