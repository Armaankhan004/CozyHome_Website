/**
 * Cozy Home - Login Page Script
 * Handles login redirect, cart, search, and mobile menu functionality
 */

let cart = [];
let cartInitialized = false;

/**
 * DOMContentLoaded handler
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded for login page');
    loadSavedData();
    initCartSystem();
    initMobileMenu();
    initSearchOverlay();
    initLoginForm();
});

/**
 * Initialize login form
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Login form submitted, redirecting to index1.html');
            window.location.href = 'index1.html';
        });
    } else {
        console.error('Login form not found');
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
            console.log('Mobile menu toggled');
            navLinks.classList.toggle('active');
        });
    } else {
        console.error('Mobile menu elements missing');
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
            console.log('Search overlay opened');
            searchOverlay.classList.add('active');
        });
        closeSearch.addEventListener('click', () => {
            console.log('Search overlay closed');
            searchOverlay.classList.remove('active');
        });
    } else {
        console.error('Search overlay elements missing');
    }
}

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
                <a href="#" class="btn view-cart-btn">View Cart</a>
                <a href="#" class="btn buy-now-btn">Checkout</a>
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
        }
    });

    // Initialize cart buttons (View Cart, Checkout)
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
            console.log('Checkout clicked, redirecting to index1.html');
            showToast('Please login to proceed to checkout');
            window.location.href = 'index1.html';
        });
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
                <a href="index1.html#products-featured" class="continue-shopping">Continue Shopping</a>
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