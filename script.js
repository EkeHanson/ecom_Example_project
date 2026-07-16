// ============================================
//  MAIN APPLICATION CONTROLLER
// ============================================

import { renderHeader, renderFooter } from './components/header.js';
import { renderHome } from './pages/home.js';
import { renderShop } from './pages/shop.js';
import { renderProductDetail } from './pages/product.js';
import { renderCart } from './pages/cart.js';
import { renderCheckout } from './pages/checkout.js';
import { renderOrders } from './pages/orders.js';
import { renderAdmin } from './pages/admin.js';
import { showToast } from './components/modal.js';

// ============================================
//  STATE MANAGEMENT
// ============================================

class Store {
    constructor() {
        this.state = {
            products: [],
            categories: [],
            cart: [],
            orders: [],
            currentUser: null,
            currentPage: 'home',
            currentProductId: null,
            filters: {
                category: 'all',
                priceRange: [0, 1000],
                rating: 0,
                search: ''
            },
            isAdmin: false
        };
        this.loadFromStorage();
        this.initProducts();
    }

    initProducts() {
        if (this.state.products.length === 0) {
            this.state.products = this.generateMockProducts();
            this.state.categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];
            this.saveToStorage();
        }
    }

    generateMockProducts() {
        const products = [];
        const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];
        const names = {
            'Electronics': ['Smartphone X', 'Laptop Pro', 'Wireless Headphones', 'Smart Watch', 'Tablet', 'Speaker'],
            'Clothing': ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers', 'Dress', 'Hat'],
            'Books': ['JavaScript Guide', 'Python Basics', 'Data Science', 'Fiction Novel', 'Biography', 'Cookbook'],
            'Home & Garden': ['Lamp', 'Vase', 'Rug', 'Pillow', 'Plant Pot', 'Mirror'],
            'Sports': ['Yoga Mat', 'Dumbbells', 'Basketball', 'Soccer Ball', 'Tennis Racket', 'Running Shoes'],
            'Toys': ['Lego Set', 'Action Figure', 'Board Game', 'Puzzle', 'Doll', 'Remote Control Car']
        };
        const icons = ['📱', '💻', '🎧', '⌚', '📊', '🔊', '👕', '👖', '🧥', '👟', '👗', '🧢', 
                     '📚', '🐍', '📖', '📕', '👤', '🍳', '💡', '🏺', '🧶', '🪑', '🪴', '🪞',
                     '🧘', '🏋️', '🏀', '⚽', '🎾', '🏃', '🧱', '🎭', '🎲', '🧩', '🎎', '🚗'];

        let id = 1;
        categories.forEach(category => {
            const productNames = names[category] || ['Product'];
            productNames.forEach((name, index) => {
                const price = Math.round((Math.random() * 200 + 10) * 100) / 100;
                const rating = Math.round((Math.random() * 2 + 3) * 10) / 10;
                const inStock = Math.random() > 0.2;
                const isNew = Math.random() > 0.7;
                const onSale = Math.random() > 0.8;
                products.push({
                    id: id++,
                    name: `${category} ${name}`,
                    category: category,
                    price: price,
                    originalPrice: onSale ? Math.round(price * 1.3 * 100) / 100 : null,
                    description: `High quality ${category.toLowerCase()} product. Perfect for your needs.`,
                    rating: rating,
                    reviews: Math.floor(Math.random() * 500 + 10),
                    inStock: inStock,
                    isNew: isNew,
                    onSale: onSale,
                    image: icons[(id - 1) % icons.length],
                    specifications: {
                        brand: ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Penguin'][Math.floor(Math.random() * 6)],
                        model: `Model ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
                        warranty: `${Math.floor(Math.random() * 2 + 1)} year`
                    }
                });
            });
        });
        return products;
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('shopverse_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('shopverse_state', JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    // ===== CART OPERATIONS =====
    addToCart(productId, quantity = 1) {
        const product = this.getProduct(productId);
        if (!product) return false;
        
        const existing = this.state.cart.find(item => item.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.state.cart.push({ productId, quantity });
        }
        this.saveToStorage();
        this.notifyListeners();
        return true;
    }

    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item.productId !== productId);
        this.saveToStorage();
        this.notifyListeners();
    }

    updateCartQuantity(productId, quantity) {
        const item = this.state.cart.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.notifyListeners();
            }
        }
    }

    getCartTotal() {
        return this.state.cart.reduce((total, item) => {
            const product = this.getProduct(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    getCartCount() {
        return this.state.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.state.cart = [];
        this.saveToStorage();
        this.notifyListeners();
    }

    // ===== PRODUCT OPERATIONS =====
    getProduct(id) {
        return this.state.products.find(p => p.id === id);
    }

    getProductsByCategory(category) {
        if (category === 'all') return this.state.products;
        return this.state.products.filter(p => p.category === category);
    }

    getFilteredProducts() {
        let products = this.state.products;
        const filters = this.state.filters;
        
        if (filters.category !== 'all') {
            products = products.filter(p => p.category === filters.category);
        }
        
        if (filters.search) {
            const term = filters.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.description.toLowerCase().includes(term)
            );
        }
        
        products = products.filter(p => 
            p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
        );
        
        if (filters.rating > 0) {
            products = products.filter(p => p.rating >= filters.rating);
        }
        
        return products;
    }

    // ===== ORDER OPERATIONS =====
    createOrder(orderData) {
        const order = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            ...orderData,
            items: [...this.state.cart],
            total: this.getCartTotal(),
            date: new Date().toISOString(),
            status: 'processing'
        };
        this.state.orders.push(order);
        this.clearCart();
        this.saveToStorage();
        this.notifyListeners();
        return order;
    }

    // ===== AUTH OPERATIONS =====
    login(email, password) {
        // Simulated login - in real app, this would be an API call
        if (email && password) {
            this.state.currentUser = {
                id: 'user_1',
                name: email.split('@')[0],
                email: email,
                isAdmin: email.includes('admin')
            };
            this.state.isAdmin = this.state.currentUser.isAdmin;
            this.saveToStorage();
            this.notifyListeners();
            return true;
        }
        return false;
    }

    logout() {
        this.state.currentUser = null;
        this.state.isAdmin = false;
        this.saveToStorage();
        this.notifyListeners();
    }

    // ===== OBSERVER PATTERN =====
    listeners = [];

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.state));
    }
}

// ============================================
//  ROUTER
// ============================================

class Router {
    constructor(store) {
        this.store = store;
        this.routes = {
            'home': renderHome,
            'shop': renderShop,
            'product': renderProductDetail,
            'cart': renderCart,
            'checkout': renderCheckout,
            'orders': renderOrders,
            'admin': renderAdmin
        };
        
        // Listen for navigation
        window.addEventListener('popstate', () => this.navigate(window.location.pathname));
        
        // Initial navigation
        this.navigate('/');
    }

    navigate(path) {
        // Parse route
        let page = 'home';
        let params = {};
        
        if (path === '/' || path === '') {
            page = 'home';
        } else if (path.startsWith('/shop')) {
            page = 'shop';
            const urlParams = new URLSearchParams(path.split('?')[1]);
            const category = urlParams.get('category');
            if (category) {
                this.store.state.filters.category = category;
                this.store.saveToStorage();
            }
        } else if (path.startsWith('/product/')) {
            page = 'product';
            const id = parseInt(path.split('/')[2]);
            params.id = id;
            this.store.state.currentProductId = id;
        } else if (path.startsWith('/cart')) {
            page = 'cart';
        } else if (path.startsWith('/checkout')) {
            page = 'checkout';
        } else if (path.startsWith('/orders')) {
            page = 'orders';
        } else if (path.startsWith('/admin')) {
            page = 'admin';
        }
        
        this.store.state.currentPage = page;
        this.store.saveToStorage();
        this.renderPage(page, params);
        
        // Update URL
        const url = this.getUrl(page, params);
        if (window.location.pathname !== url) {
            window.history.pushState({ page, params }, '', url);
        }
    }

    getUrl(page, params = {}) {
        switch(page) {
            case 'home': return '/';
            case 'shop': return `/shop${params.category ? `?category=${params.category}` : ''}`;
            case 'product': return `/product/${params.id || this.store.state.currentProductId}`;
            case 'cart': return '/cart';
            case 'checkout': return '/checkout';
            case 'orders': return '/orders';
            case 'admin': return '/admin';
            default: return '/';
        }
    }

    renderPage(page, params) {
        const container = document.getElementById('mainContent');
        const renderFn = this.routes[page];
        
        if (renderFn) {
            renderFn(this.store, container, params);
        } else {
            container.innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }
}

// ============================================
//  INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Create store instance
    const store = new Store();
    
    // Render header and footer
    const headerContainer = document.getElementById('mainHeader');
    const footerContainer = document.getElementById('mainFooter');
    renderHeader(store, headerContainer);
    renderFooter(store, footerContainer);
    
    // Initialize router
    const router = new Router(store);
    
    // Store router globally for navigation
    window.router = router;
    window.store = store;
    
    // Update header when state changes
    store.addListener((state) => {
        renderHeader(store, headerContainer);
    });
});

// ============================================
//  EXPOSE GLOBALS FOR CONSOLE DEBUGGING
// ============================================
console.log('🛍️ ShopVerse Loaded!');
console.log('Available commands:');
console.log('  store.state - View current state');
console.log('  store.addToCart(id) - Add product to cart');
console.log('  store.getCartTotal() - Get cart total');
console.log('  store.getFilteredProducts() - Get filtered products');
console.log('  store.login(email, pass) - Login user');
console.log('  store.logout() - Logout user');
console.log('  router.navigate(path) - Navigate to page');
console.log('  window.router - Access router instance');
console.log('  window.store - Access store instance');