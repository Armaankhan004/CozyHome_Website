/**
 * Cozy Home - Enhanced Cart System with Responsive Checkout
 */

let cart = [];
let cartInitialized = false;

/**


/**
 * Initialize category filtering
 */
function initCategoryFilters() {
    document.querySelectorAll('.category').forEach(category => {
        category.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryName = category.querySelector('.category-title').textContent.trim();
            filterProductsByCategory(categoryName);
            document.getElementById('products-featured').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

/**
 * Filter products by category
 */
function filterProductsByCategory(categoryName) {
    const products = document.querySelectorAll('.product');
    let foundProducts = false;
    const productsContainer = document.querySelector('.products');
    const existingMsg = document.querySelector('.no-products');
    if (existingMsg) existingMsg.remove();

    products.forEach(product => {
        const productCategory = product.querySelector('.product-category').textContent.trim();
        if (categoryName === 'All' || productCategory === categoryName) {
            product.style.display = 'block';
            foundProducts = true;
        } else {
            product.style.display = 'none';
        }
    });

    const sectionTitle = document.querySelector('#products-featured .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = categoryName === 'All' ? 'Featured Products' : `${categoryName} Products`;
    }

    if (!foundProducts && categoryName !== 'All') {
        const noProductsMsg = document.createElement('div');
        noProductsMsg.className = 'no-products';
        noProductsMsg.textContent = `No products found in ${categoryName} category.`;
        productsContainer.appendChild(noProductsMsg);
    }
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

/**
 * Initialize search overlay
 */
function initSearchOverlay() {
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');
    if (searchToggle && searchOverlay && closeSearch) {
        searchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            searchOverlay.classList.add('active');
        });
        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }
}

/**
 * DOMContentLoaded handler
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    loadSavedData();
    initCartSystem();
    setupProductListeners();
    initCategoryFilters();
    initMobileMenu();
    initSearchOverlay();
    initCheckoutModal();
});

/**
 * Initialize cart system
 */
function initCartSystem() {
    console.log('Initializing cart system');

    // Ensure cart sidebar exists
    if (!document.getElementById('cart-sidebar')) {
        console.error('Cart sidebar missing, creating new one');
        const sidebar = document.createElement('div');
        sidebar.id = 'cart-sidebar';
        sidebar.innerHTML = `
            <div class="cart-header">
                <h3>Your Cart</h3>
                <button id="close-cart">✕</button>
            </div>
            <div id="cart-items"></div>
            <div id="cart-total">
                <span>Total:</span>
                <span>$0.00</span>
            </div>
            <div class="cart-buttons">
                <button class="btn view-cart-btn">View Cart</button>
                <button class="btn buy-now-btn">Buy Now</button>
            </div>
        `;
        document.body.appendChild(sidebar);
    }

    // Ensure overlay exists
    if (!document.getElementById('overlay-bg')) {
        console.log('Creating overlay');
        const overlay = document.createElement('div');
        overlay.id = 'overlay-bg';
        document.body.appendChild(overlay);
    }

    // Ensure toast exists
    if (!document.getElementById('toast')) {
        console.log('Creating toast');
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    initCartCore();
    if (cart.length > 0) {
        console.log('Rendering initial cart:', cart);
        renderCart();
        updateCartCount();
    }
    cartInitialized = true;
}

/**
 * Initialize core cart functionality
 */
function initCartCore() {
    console.log('Initializing cart core');
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const overlayBg = document.getElementById('overlay-bg');

    if (!cartToggle || !closeCart || !overlayBg) {
        console.error('Missing cart elements:', { cartToggle, closeCart, overlayBg });
        return;
    }

    // Add event listeners without replacing elements
    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Cart toggle clicked');
        openCart();
    });

    closeCart.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Close cart clicked');
        closeCart(e);
    });

    overlayBg.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Overlay clicked');
        closeCart(e);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            console.log('Escape key pressed');
            closeCart({ preventDefault: () => {} });
            closeCheckoutModal();
            closeOrderConfirmation();
        }
    });
}

/**
 * Open cart
 */
function openCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlayBg = document.getElementById('overlay-bg');
    if (cartSidebar && overlayBg) {
        console.log('Opening cart');
        cartSidebar.classList.add('active');
        overlayBg.classList.add('active');
        renderCart();
    } else {
        console.error('Cart sidebar or overlay missing');
    }
}

/**
 * Close cart
 */
function closeCart(e) {
    e.preventDefault();
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlayBg = document.getElementById('overlay-bg');
    if (cartSidebar && overlayBg) {
        console.log('Closing cart');
        cartSidebar.classList.remove('active');
        overlayBg.classList.remove('active');
    } else {
        console.error('Cart sidebar or overlay missing');
    }
}

/**
 * Render cart items
 */
function renderCart() {
    console.log('Rendering cart:', cart);
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) {
        console.error('Cart items or total element missing');
        return;
    }

    cartItems.innerHTML = '';
    if (!cart.length) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p class="empty-cart-message">Your cart is empty</p>
                <a href="#products-featured" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
        cartTotal.innerHTML = '<span>Total:</span><span>$0.00</span>';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
                    <button class="cart-item-remove" data-index="${index}">×</button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Decrease quantity:', btn.dataset.index);
            updateCartItem(parseInt(btn.dataset.index), -1);
        });
    });
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Increase quantity:', btn.dataset.index);
            updateCartItem(parseInt(btn.dataset.index), 1);
        });
    });
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Remove item:', btn.dataset.index);
            removeCartItem(parseInt(btn.dataset.index));
        });
    });

    cartTotal.innerHTML = `<span>Total:</span><span>$${total.toFixed(2)}</span>`;
}

/**
 * Update cart item quantity
 */
function updateCartItem(index, change) {
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += change;
        if (cart[index].quantity < 1) cart.splice(index, 1);
        console.log('Updated cart:', cart);
        saveCart();
        renderCart();
        updateCartCount();
    }
}

/**
 * Remove cart item
 */
function removeCartItem(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        console.log('Removed item, cart:', cart);
        saveCart();
        renderCart();
        updateCartCount();
    }
}

/**
 * Update cart count
 */
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log('Updating cart count:', count);
        cartCount.textContent = count;
    }
}

/**
 * Add product to cart
 */
function addToCart(name, price, image) {
    if (!cartInitialized) initCartSystem();
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }
    console.log('Added to cart:', { name, price, image });
    saveCart();
    updateCartCount();
    showToast(`Added ${name} to cart`);
    openCart();
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    try {
        localStorage.setItem('cozyHomeCart', JSON.stringify(cart));
        console.log('Cart saved to localStorage');
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

/**
 * Load cart from localStorage
 */
function loadSavedData() {
    try {
        const savedCart = localStorage.getItem('cozyHomeCart');
        if (savedCart) {
            cart = JSON.parse(savedCart) || [];
            console.log('Loaded cart from localStorage:', cart);
        }
    } catch (e) {
        console.error('Error loading cart:', e);
        cart = [];
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        console.log('Showing toast:', message);
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            console.log('Hiding toast');
        }, 3000);
    } else {
        console.error('Toast element missing');
    }
}

/**
 * Set up product event listeners
 */
function setupProductListeners() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const product = btn.closest('.product');
            if (!product) {
                console.error('Product element not found');
                return;
            }
            const name = product.querySelector('.product-title')?.textContent;
            const priceText = product.querySelector('.price')?.textContent;
            const image = product.querySelector('.product-image img')?.src;
            if (!name || !priceText || !image) {
                console.error('Product details missing:', { name, priceText, image });
                return;
            }
            const price = parseFloat(priceText.replace('$', ''));
            console.log('Add to cart clicked:', { name, price, image });
            addToCart(name, price, image);
        });
    });
}

/**
 * Initialize checkout modal
 */
function initCheckoutModal() {
    console.log('Initializing checkout modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const closeCheckout = document.getElementById('close-checkout');
    const orderConfirmation = document.getElementById('order-confirmation');
    const closeConfirmation = document.getElementById('close-confirmation');

    if (!checkoutModal || !checkoutForm || !closeCheckout || !orderConfirmation || !closeConfirmation) {
        console.error('Checkout elements missing:', {
            checkoutModal,
            checkoutForm,
            closeCheckout,
            orderConfirmation,
            closeConfirmation
        });
        return;
    }

    document.querySelectorAll('.view-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('View Cart clicked');
            showToast('Viewing your cart');
            renderCart();
        });
    });

    document.querySelectorAll('.buy-now-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Buy Now clicked');
            if (cart.length === 0) {
                showToast('Your cart is empty!');
                console.log('Cart empty, showing toast');
                return;
            }
            checkoutModal.style.display = 'flex';
            document.getElementById('full-name')?.focus();
            console.log('Checkout modal opened');
        });
    });

    closeCheckout.addEventListener('click', () => {
        console.log('Closing checkout modal');
        checkoutModal.style.display = 'none';
    });

    closeConfirmation.addEventListener('click', () => {
        console.log('Closing order confirmation');
        orderConfirmation.style.display = 'none';
        cart = [];
        saveCart();
        updateCartCount();
        renderCart();
        closeCart({ preventDefault: () => {} });
    });

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const orderData = {
            name: document.getElementById('full-name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            address: document.getElementById('address')?.value || '',
            payment: document.getElementById('payment')?.value || '',
            items: cart,
            total: cart.reduce((total, item) => total + item.price * item.quantity, 0)
        };
        console.log('Order submitted:', orderData);
        checkoutModal.style.display = 'none';
        checkoutForm.reset();
        orderConfirmation.style.display = 'flex';
        console.log('Order confirmation shown');
    });

    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            console.log('Clicked outside checkout modal');
            checkoutModal.style.display = 'none';
        }
    });

    orderConfirmation.addEventListener('click', (e) => {
        if (e.target === orderConfirmation) {
            console.log('Clicked outside order confirmation');
            orderConfirmation.style.display = 'none';
            cart = [];
            saveCart();
            updateCartCount();
            renderCart();
            closeCart({ preventDefault: () => {} });
        }
    });
}

/**
 * Close checkout modal
 */
function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        console.log('Closing checkout modal');
        checkoutModal.style.display = 'none';
    }
}

/**
 * Close order confirmation
 */
function closeOrderConfirmation() {
    const orderConfirmation = document.getElementById('order-confirmation');
    if (orderConfirmation) {
        console.log('Closing order confirmation');
        orderConfirmation.style.display = 'none';
    }
}