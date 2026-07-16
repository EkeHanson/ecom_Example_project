// ============================================
//  SHOPVERSE - Complete E-Commerce Platform
//  Single File Version (No Modules)
// ============================================

// ============================================
//  UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function closeModal() {
    const container = document.getElementById('modalContainer');
    if (container) container.innerHTML = '';
}

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
        this.listeners = [];
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

    getProduct(id) {
        return this.state.products.find(p => p.id === id);
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

    login(email, password) {
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

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.state));
    }
}

// ============================================
//  RENDER FUNCTIONS
// ============================================

function renderHeader(store) {
    const container = document.getElementById('mainHeader');
    const state = store.state;
    const cartCount = store.getCartCount();
    const user = state.currentUser;
    
    container.innerHTML = `
        <div class="header-container">
            <div class="logo" onclick="navigate('/')">
                <i class="fas fa-store"></i>
                Shop<span>Verse</span>
            </div>
            
            <div class="search-bar">
                <input type="text" id="globalSearch" placeholder="Search products..." 
                       value="${state.filters.search || ''}">
                <button id="globalSearchBtn"><i class="fas fa-search"></i></button>
            </div>
            
            <nav class="nav-links">
                <a href="#" onclick="navigate('/')">Home</a>
                <a href="#" onclick="navigate('/shop')">Shop</a>
                ${user ? `<a href="#" onclick="navigate('/orders')">Orders</a>` : ''}
                ${user && user.isAdmin ? `<a href="#" onclick="navigate('/admin')">Admin</a>` : ''}
                <a href="#" onclick="navigate('/cart')" class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">${cartCount}</span>
                </a>
                <div class="user-menu">
                    ${user ? `
                        <div class="user-avatar" title="${user.name}">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <button class="auth-btn" onclick="handleLogout()">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    ` : `
                        <button class="auth-btn" onclick="showLoginModal()">
                            <i class="fas fa-user"></i> Login
                        </button>
                    `}
                </div>
            </nav>
        </div>
    `;
    
    // Search functionality
    const searchInput = document.getElementById('globalSearch');
    const searchBtn = document.getElementById('globalSearchBtn');
    
    const performSearch = () => {
        const term = searchInput.value.trim();
        store.state.filters.search = term;
        store.saveToStorage();
        navigate('/shop');
    };
    
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
}

function renderFooter(store) {
    const container = document.getElementById('mainFooter');
    const categories = store.state.categories || [];
    
    container.innerHTML = `
        <footer style="background:#2c3e50; color:white; padding:2rem; margin-top:3rem;">
            <div style="max-width:1400px; margin:0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:2rem;">
                <div>
                    <h3 style="color:#3498db;">ShopVerse</h3>
                    <p style="color:#bdc3c7; margin-top:0.5rem;">Your premium e-commerce destination.</p>
                </div>
                <div>
                    <h4>Quick Links</h4>
                    <ul style="list-style:none; margin-top:0.5rem;">
                        <li><a href="#" onclick="navigate('/')" style="color:#bdc3c7;">Home</a></li>
                        <li><a href="#" onclick="navigate('/shop')" style="color:#bdc3c7;">Shop</a></li>
                        <li><a href="#" onclick="navigate('/cart')" style="color:#bdc3c7;">Cart</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Categories</h4>
                    <ul style="list-style:none; margin-top:0.5rem;">
                        ${categories.slice(0, 4).map(cat => `
                            <li><a href="#" onclick="navigate('/shop?category=${cat}')" style="color:#bdc3c7;">${cat}</a></li>
                        `).join('')}
                    </ul>
                </div>
                <div>
                    <h4>Contact</h4>
                    <p style="color:#bdc3c7; margin-top:0.5rem;">
                        <i class="fas fa-envelope"></i> support@shopverse.com<br>
                        <i class="fas fa-phone"></i> +1 (555) 123-4567
                    </p>
                </div>
            </div>
            <div style="text-align:center; margin-top:2rem; padding-top:1rem; border-top:1px solid #34495e; color:#bdc3c7;">
                &copy; 2024 ShopVerse. All rights reserved.
            </div>
        </footer>
    `;
}

// ============================================
//  PAGE RENDER FUNCTIONS
// ============================================

function renderHome(store) {
    const container = document.getElementById('mainContent');
    const products = store.state.products.slice(0, 8);
    const categories = store.state.categories;
    
    container.innerHTML = `
        <section class="hero">
            <h1>Welcome to ShopVerse</h1>
            <p>Discover premium products at unbeatable prices. Quality guaranteed.</p>
            <button class="cta-button" onclick="navigate('/shop')">
                <i class="fas fa-shopping-bag"></i> Start Shopping
            </button>
        </section>
        
        <h2 style="margin-bottom:1.5rem;">Shop by Category</h2>
        <div class="category-grid">
            ${categories.slice(0, 6).map(cat => `
                <div class="category-card" onclick="navigate('/shop?category=${cat}')">
                    <i class="fas fa-${getCategoryIcon(cat)}"></i>
                    <h3>${cat}</h3>
                </div>
            `).join('')}
        </div>
        
        <h2 style="margin:2rem 0 1.5rem;">Featured Products</h2>
        <div class="featured-products">
            ${products.map(product => `
                <div class="product-card" onclick="navigate('/product/${product.id}')" style="cursor:pointer;">
                    ${product.onSale ? `<span class="badge sale">SALE</span>` : ''}
                    ${product.isNew ? `<span class="badge new">NEW</span>` : ''}
                    <div class="product-image">${product.image}</div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="rating">
                            ${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '★' : ''}
                            (${product.reviews})
                        </div>
                        <div class="price">
                            $${product.price.toFixed(2)}
                            ${product.originalPrice ? `<span style="text-decoration:line-through; color:#999; font-size:0.9rem; margin-left:0.5rem;">$${product.originalPrice.toFixed(2)}</span>` : ''}
                        </div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); handleAddToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align:center; margin-top:2rem;">
            <button class="cta-button" onclick="navigate('/shop')" style="background:#2c3e50;">
                View All Products <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

function renderShop(store) {
    const container = document.getElementById('mainContent');
    const products = store.getFilteredProducts();
    const categories = store.state.categories;
    const filters = store.state.filters;
    
    container.innerHTML = `
        <div class="shop-layout">
            <aside class="sidebar-filters">
                <h3><i class="fas fa-filter"></i> Filters</h3>
                
                <div class="filter-group">
                    <label>Category</label>
                    <div class="filter-options">
                        <label>
                            <input type="radio" name="category" value="all" ${filters.category === 'all' ? 'checked' : ''} 
                                   onchange="applyFilter('category', this.value)">
                            All Categories
                        </label>
                        ${categories.map(cat => `
                            <label>
                                <input type="radio" name="category" value="${cat}" ${filters.category === cat ? 'checked' : ''}
                                       onchange="applyFilter('category', this.value)">
                                ${cat}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="filter-group">
                    <label>Price Range</label>
                    <div class="price-range">
                        <span>$${filters.priceRange[0]}</span>
                        <span>$${filters.priceRange[1]}</span>
                    </div>
                    <input type="range" min="0" max="500" step="10" 
                           value="${filters.priceRange[1]}"
                           onchange="applyPriceRange(this.value)">
                </div>
                
                <div class="filter-group">
                    <label>Minimum Rating</label>
                    <div class="filter-options">
                        ${[0, 1, 2, 3, 4].map(r => `
                            <label>
                                <input type="radio" name="rating" value="${r}" ${filters.rating === r ? 'checked' : ''}
                                       onchange="applyFilter('rating', ${r})">
                                ${r === 0 ? 'Any' : '★'.repeat(r) + ' & up'}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <button onclick="clearFilters()" style="width:100%; padding:0.6rem; background:#e74c3c; color:white; border:none; border-radius:5px;">
                    <i class="fas fa-undo"></i> Clear Filters
                </button>
            </aside>
            
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2>Products</h2>
                    <span style="color:#666;">${products.length} products found</span>
                </div>
                
                <div class="product-grid">
                    ${products.length > 0 ? products.map(product => `
                        <div class="product-card" onclick="navigate('/product/${product.id}')" style="cursor:pointer;">
                            ${product.onSale ? `<span class="badge sale">SALE</span>` : ''}
                            ${product.isNew ? `<span class="badge new">NEW</span>` : ''}
                            <div class="product-image">${product.image}</div>
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <div class="rating">
                                    ${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '★' : ''}
                                    (${product.reviews})
                                </div>
                                <div class="price">
                                    $${product.price.toFixed(2)}
                                    ${product.originalPrice ? `<span style="text-decoration:line-through; color:#999; font-size:0.9rem; margin-left:0.5rem;">$${product.originalPrice.toFixed(2)}</span>` : ''}
                                </div>
                                <button class="add-to-cart-btn" onclick="event.stopPropagation(); handleAddToCart(${product.id})">
                                    <i class="fas fa-cart-plus"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    `).join('') : `
                        <p style="grid-column:1/-1; text-align:center; padding:3rem; color:#999;">
                            <i class="fas fa-search" style="font-size:3rem; display:block; margin-bottom:1rem;"></i>
                            No products found matching your filters.
                        </p>
                    `}
                </div>
            </div>
        </div>
    `;
}

function renderProductDetail(store) {
    const container = document.getElementById('mainContent');
    const productId = store.state.currentProductId;
    const product = store.getProduct(productId);
    let quantity = 1;
    
    if (!product) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem;">
                <i class="fas fa-exclamation-circle" style="font-size:4rem; color:#e74c3c;"></i>
                <h2>Product Not Found</h2>
                <button onclick="navigate('/shop')" style="margin-top:1rem; padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
                    Back to Shop
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <button onclick="navigate('/shop')" style="margin-bottom:2rem; padding:0.5rem 1rem; background:none; border:1px solid #ddd; border-radius:5px; cursor:pointer;">
            <i class="fas fa-arrow-left"></i> Back to Shop
        </button>
        
        <div class="product-detail">
            <div class="product-detail-image">${product.image}</div>
            
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <div class="rating" style="font-size:1.2rem;">
                    ${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '★' : ''}
                    <span style="color:#666; font-size:1rem;">(${product.reviews} reviews)</span>
                </div>
                
                <div class="price">
                    $${product.price.toFixed(2)}
                    ${product.originalPrice ? `<span style="text-decoration:line-through; color:#999; font-size:1.2rem; margin-left:0.5rem;">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                
                <p class="description">${product.description}</p>
                
                <ul class="specs">
                    <li><strong>Brand:</strong> ${product.specifications.brand}</li>
                    <li><strong>Model:</strong> ${product.specifications.model}</li>
                    <li><strong>Warranty:</strong> ${product.specifications.warranty}</li>
                    <li><strong>In Stock:</strong> ${product.inStock ? '✅ Yes' : '❌ No'}</li>
                </ul>
                
                <div class="quantity-selector">
                    <button onclick="updateQuantity(-1)">−</button>
                    <span id="quantityDisplay">1</span>
                    <button onclick="updateQuantity(1)">+</button>
                </div>
                
                <button class="add-to-cart-btn" onclick="handleProductAddToCart(${product.id})" 
                        style="width:auto; padding:1rem 3rem; font-size:1.1rem;">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    
    window.updateQuantity = (delta) => {
        quantity = Math.max(1, quantity + delta);
        const display = document.getElementById('quantityDisplay');
        if (display) display.textContent = quantity;
    };
    
    window.handleProductAddToCart = (productId) => {
        if (store.addToCart(productId, quantity)) {
            showToast(`${quantity} × ${product.name} added to cart!`, 'success');
            renderHeader(store);
        }
    };
}

function renderCart(store) {
    const container = document.getElementById('mainContent');
    const cartItems = store.state.cart;
    const total = store.getCartTotal();
    const count = store.getCartCount();
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your Cart is Empty</h2>
                <p style="color:#666; margin:1rem 0;">Browse our products and add items you love!</p>
                <button class="cta-button" onclick="navigate('/shop')">
                    <i class="fas fa-shopping-bag"></i> Start Shopping
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h2 style="margin-bottom:2rem;"><i class="fas fa-shopping-cart"></i> Your Cart (${count} items)</h2>
        
        <div class="cart-container">
            ${cartItems.map(item => {
                const product = store.getProduct(item.productId);
                if (!product) return '';
                return `
                    <div class="cart-item">
                        <div class="cart-item-image">${product.image}</div>
                        <div class="cart-item-info">
                            <h4>${product.name}</h4>
                            <p style="color:#666; font-size:0.9rem;">${product.category}</p>
                            <div class="price">$${(product.price * item.quantity).toFixed(2)}</div>
                            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                                <button onclick="updateCartQty(${product.id}, ${item.quantity - 1})" style="padding:0.2rem 0.6rem; border:1px solid #ddd; background:white; border-radius:3px;">−</button>
                                <span style="padding:0.2rem 0.8rem;">${item.quantity}</span>
                                <button onclick="updateCartQty(${product.id}, ${item.quantity + 1})" style="padding:0.2rem 0.6rem; border:1px solid #ddd; background:white; border-radius:3px;">+</button>
                            </div>
                        </div>
                        <div class="cart-item-actions">
                            <button onclick="removeFromCart(${product.id})" title="Remove">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
            
            <div class="cart-summary">
                <div>
                    <button onclick="clearCart()" style="padding:0.6rem 1.5rem; background:#e74c3c; color:white; border:none; border-radius:5px;">
                        <i class="fas fa-trash"></i> Clear Cart
                    </button>
                </div>
                <div class="cart-totals">
                    <div style="font-size:1.2rem; margin-bottom:0.5rem;">
                        Subtotal: <span style="font-weight:bold;">$${total.toFixed(2)}</span>
                    </div>
                    <div style="color:#666; font-size:0.9rem; margin-bottom:1rem;">
                        Shipping calculated at checkout
                    </div>
                    <button class="checkout-btn" onclick="navigate('/checkout')">
                        <i class="fas fa-credit-card"></i> Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderCheckout(store) {
    const container = document.getElementById('mainContent');
    const cartItems = store.state.cart;
    const total = store.getCartTotal();
    const user = store.state.currentUser;
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem;">
                <i class="fas fa-exclamation-circle" style="font-size:4rem; color:#e74c3c;"></i>
                <h2>Cart is Empty</h2>
                <button onclick="navigate('/shop')" style="margin-top:1rem; padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
                    Go to Shop
                </button>
            </div>
        `;
        return;
    }
    
    if (!user) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem; background:white; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                <i class="fas fa-user-lock" style="font-size:4rem; color:#e67e22;"></i>
                <h2>Please Login to Checkout</h2>
                <button onclick="showLoginModal()" style="padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
                    <i class="fas fa-sign-in-alt"></i> Login Now
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h2 style="margin-bottom:2rem;"><i class="fas fa-credit-card"></i> Checkout</h2>
        
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem;">
            <div>
                <div style="background:white; padding:2rem; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Shipping Information</h3>
                    <form id="checkoutForm" class="checkout-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="fullName" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" id="phone" placeholder="(555) 123-4567" required>
                        </div>
                        <div class="form-group">
                            <label>Shipping Address</label>
                            <textarea id="address" rows="3" placeholder="Street, City, State, ZIP" required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>City</label>
                                <input type="text" id="city" required>
                            </div>
                            <div class="form-group">
                                <label>ZIP Code</label>
                                <input type="text" id="zip" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Payment Method</label>
                            <select id="paymentMethod">
                                <option value="credit">Credit Card</option>
                                <option value="paypal">PayPal</option>
                                <option value="bank">Bank Transfer</option>
                            </select>
                        </div>
                        <button type="submit" style="width:100%; padding:1rem; background:#27ae60; color:white; border:none; border-radius:5px; font-size:1.1rem; font-weight:bold;">
                            <i class="fas fa-check"></i> Place Order
                        </button>
                    </form>
                </div>
            </div>
            
            <div>
                <div style="background:white; padding:2rem; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1); position:sticky; top:100px;">
                    <h3>Order Summary</h3>
                    <div style="margin:1rem 0;">
                        ${cartItems.map(item => {
                            const product = store.getProduct(item.productId);
                            return `
                                <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid #f0f0f0;">
                                    <span>${product.name} × ${item.quantity}</span>
                                    <span>$${(product.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div style="border-top:2px solid #ddd; padding-top:1rem;">
                        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1.2rem;">
                            <span>Total</span>
                            <span style="color:#3498db;">$${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('checkoutForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const orderData = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zip: document.getElementById('zip').value,
            paymentMethod: document.getElementById('paymentMethod').value
        };
        
        if (!orderData.address || !orderData.city || !orderData.zip) {
            showToast('Please fill in all shipping details.', 'error');
            return;
        }
        
        store.createOrder(orderData);
        showToast('🎉 Order placed successfully!', 'success');
        navigate('/orders');
    });
}

function renderOrders(store) {
    const container = document.getElementById('mainContent');
    const orders = store.state.orders;
    const user = store.state.currentUser;
    
    if (!user) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem;">
                <i class="fas fa-user-lock" style="font-size:4rem; color:#e67e22;"></i>
                <h2>Please Login to View Orders</h2>
                <button onclick="showLoginModal()" style="margin-top:1rem; padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
                    Login
                </button>
            </div>
        `;
        return;
    }
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem;">
                <i class="fas fa-box-open" style="font-size:4rem; color:#95a5a6;"></i>
                <h2>No Orders Yet</h2>
                <p style="color:#666; margin:1rem 0;">Start shopping and place your first order!</p>
                <button onclick="navigate('/shop')" style="padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
                    <i class="fas fa-shopping-bag"></i> Start Shopping
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h2 style="margin-bottom:2rem;"><i class="fas fa-box"></i> My Orders</h2>
        
        ${orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <strong>Order #${order.id}</strong>
                        <span style="color:#666; margin-left:1rem;">${new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
                </div>
                
                <div class="order-items">
                    ${order.items.map(item => {
                        const product = store.getProduct(item.productId);
                        return `
                            <div class="order-item">
                                <span>${product ? product.name : 'Product'}</span>
                                <span>${item.quantity} × $${(product ? product.price : 0).toFixed(2)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="order-total">
                    Total: $${order.total.toFixed(2)}
                </div>
                
                <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid #f0f0f0; font-size:0.9rem; color:#666;">
                    <i class="fas fa-truck"></i> Shipping to: ${order.address}, ${order.city}, ${order.zip}
                </div>
            </div>
        `).join('')}
    `;
}

function renderAdmin(store) {
    const container = document.getElementById('mainContent');
    const user = store.state.currentUser;
    
    if (!user || !user.isAdmin) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem; background:white; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                <i class="fas fa-shield-alt" style="font-size:4rem; color:#e74c3c;"></i>
                <h2>Access Denied</h2>
                <p style="color:#666; margin:1rem 0;">You need admin privileges to access this page.</p>
                <button onclick="navigate('/')" style="padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
                    Go Home
                </button>
            </div>
        `;
        return;
    }
    
    const products = store.state.products;
    const orders = store.state.orders;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    container.innerHTML = `
        <h2 style="margin-bottom:2rem;"><i class="fas fa-crown"></i> Admin Dashboard</h2>
        
        <div class="admin-stats">
            <div class="stat-card">
                <div class="number">${products.length}</div>
                <div class="label">Total Products</div>
            </div>
            <div class="stat-card">
                <div class="number">${orders.length}</div>
                <div class="label">Total Orders</div>
            </div>
            <div class="stat-card">
                <div class="number">$${totalRevenue.toFixed(0)}</div>
                <div class="label">Revenue</div>
            </div>
            <div class="stat-card">
                <div class="number">${store.state.cart.length}</div>
                <div class="label">Active Carts</div>
            </div>
        </div>
        
        <div class="admin-actions">
            <button onclick="showAddProductModal()"><i class="fas fa-plus"></i> Add Product</button>
            <button onclick="exportData()"><i class="fas fa-download"></i> Export Data</button>
            <button onclick="importData()"><i class="fas fa-upload"></i> Import Data</button>
            <button class="danger" onclick="resetStore()"><i class="fas fa-trash"></i> Reset Store</button>
        </div>
        
        <h3 style="margin:2rem 0 1rem;">Product Management</h3>
        <div style="background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            <table style="width:100%; border-collapse:collapse;">
                <thead style="background:#f8f9fa;">
                    <tr>
                        <th style="padding:0.8rem; text-align:left;">ID</th>
                        <th style="padding:0.8rem; text-align:left;">Product</th>
                        <th style="padding:0.8rem; text-align:left;">Category</th>
                        <th style="padding:0.8rem; text-align:left;">Price</th>
                        <th style="padding:0.8rem; text-align:left;">Stock</th>
                        <th style="padding:0.8rem; text-align:left;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.slice(0, 10).map(product => `
                        <tr style="border-top:1px solid #eee;">
                            <td style="padding:0.8rem;">#${product.id}</td>
                            <td style="padding:0.8rem;">${product.name}</td>
                            <td style="padding:0.8rem;">${product.category}</td>
                            <td style="padding:0.8rem;">$${product.price.toFixed(2)}</td>
                            <td style="padding:0.8rem;">${product.inStock ? '✅ In Stock' : '❌ Out'}</td>
                            <td style="padding:0.8rem;">
                                <button onclick="deleteProduct(${product.id})" style="background:#e74c3c; color:white; border:none; padding:0.2rem 0.6rem; border-radius:3px;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============================================
//  HELPER FUNCTIONS
// ============================================

function getCategoryIcon(category) {
    const icons = {
        'Electronics': 'laptop',
        'Clothing': 'tshirt',
        'Books': 'book',
        'Home & Garden': 'home',
        'Sports': 'running',
        'Toys': 'gamepad'
    };
    return icons[category] || 'box';
}

function showLoginModal() {
    const container = document.getElementById('modalContainer');
    
    container.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
            <div class="modal-content">
                <h2><i class="fas fa-user-circle"></i> Login</h2>
                <p style="color:#666; margin-bottom:1.5rem;">Demo: Use any email/password. Use "admin@shop.com" for admin access.</p>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" placeholder="••••••••" required>
                    </div>
                    <button type="submit" style="width:100%; padding:0.8rem; background:#3498db; color:white; border:none; border-radius:5px; font-weight:bold;">
                        Login
                    </button>
                </form>
                <button onclick="closeModal()" style="margin-top:1rem; background:none; border:none; color:#999; cursor:pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (store.login(email, password)) {
            closeModal();
            showToast('Login successful! Welcome back!', 'success');
            renderHeader(store);
            navigate(store.state.currentPage);
        } else {
            showToast('Login failed. Please try again.', 'error');
        }
    });
}

// ============================================
//  GLOBAL FUNCTIONS
// ============================================

let store, router;

function navigate(path) {
    if (!router) return;
    router.navigate(path);
}

function handleAddToCart(productId) {
    if (store.addToCart(productId)) {
        showToast('Product added to cart!', 'success');
        renderHeader(store);
    }
}

function handleLogout() {
    store.logout();
    renderHeader(store);
    navigate('/');
    showToast('Logged out successfully.', 'info');
}

function updateCartQty(productId, newQty) {
    store.updateCartQuantity(productId, newQty);
    renderCart(store);
    renderHeader(store);
}

function removeFromCart(productId) {
    store.removeFromCart(productId);
    renderCart(store);
    renderHeader(store);
    showToast('Item removed from cart.', 'info');
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        store.clearCart();
        renderCart(store);
        renderHeader(store);
        showToast('Cart cleared.', 'info');
    }
}

function applyFilter(key, value) {
    store.state.filters[key] = value;
    store.saveToStorage();
    renderShop(store);
}

function applyPriceRange(value) {
    store.state.filters.priceRange[1] = parseInt(value);
    store.saveToStorage();
    renderShop(store);
}

function clearFilters() {
    store.state.filters = {
        category: 'all',
        priceRange: [0, 500],
        rating: 0,
        search: store.state.filters.search || ''
    };
    store.saveToStorage();
    renderShop(store);
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) searchInput.value = '';
}

// Admin functions
function showAddProductModal() {
    const container = document.getElementById('modalContainer');
    
    container.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
            <div class="modal-content">
                <h2>Add New Product</h2>
                <form id="addProductForm">
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" id="prodName" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="prodCategory">
                            ${store.state.categories.map(cat => `
                                <option value="${cat}">${cat}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Price</label>
                        <input type="number" id="prodPrice" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="prodDesc" rows="3"></textarea>
                    </div>
                    <button type="submit" style="width:100%; padding:0.8rem; background:#27ae60; color:white; border:none; border-radius:5px;">
                        Add Product
                    </button>
                </form>
                <button onclick="closeModal()" style="margin-top:1rem; background:none; border:none; color:#999; cursor:pointer;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('prodName').value;
        const category = document.getElementById('prodCategory').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        const description = document.getElementById('prodDesc').value;
        
        if (!name || !price) {
            showToast('Name and price are required.', 'error');
            return;
        }
        
        const newProduct = {
            id: store.state.products.length + 1,
            name,
            category,
            price,
            description: description || 'New product added.',
            rating: 4.0,
            reviews: 0,
            inStock: true,
            isNew: true,
            onSale: false,
            image: '📦',
            specifications: {
                brand: 'Generic',
                model: 'Model 1',
                warranty: '1 year'
            }
        };
        
        store.state.products.push(newProduct);
        store.saveToStorage();
        closeModal();
        showToast('Product added successfully!', 'success');
        renderAdmin(store);
    });
}

function deleteProduct(productId) {
    if (confirm('Delete this product?')) {
        store.state.products = store.state.products.filter(p => p.id !== productId);
        store.saveToStorage();
        renderAdmin(store);
        showToast('Product deleted.', 'info');
    }
}

function exportData() {
    const data = JSON.stringify(store.state, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopverse_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                Object.assign(store.state, data);
                store.saveToStorage();
                renderAdmin(store);
                showToast('Data imported successfully!', 'success');
            } catch (err) {
                showToast('Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetStore() {
    if (confirm('⚠️ This will delete all data. Are you sure?')) {
        localStorage.removeItem('shopverse_state');
        location.reload();
    }
}

// ============================================
//  ROUTER CLASS
// ============================================

class Router {
    constructor(storeInstance) {
        this.store = storeInstance;
        this.currentPage = 'home';
        
        // Handle back/forward buttons
        window.addEventListener('popstate', () => {
            const path = window.location.pathname;
            this.navigate(path);
        });
    }

    navigate(path) {
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
        
        this.currentPage = page;
        this.store.state.currentPage = page;
        this.store.saveToStorage();
        this.renderPage(page, params);
        
        // Update URL without reloading
        const url = this.getUrl(page);
        if (window.location.pathname !== url) {
            window.history.pushState({ page }, '', url);
        }
    }

    getUrl(page) {
        switch(page) {
            case 'home': return '/';
            case 'shop': {
                const category = this.store.state.filters.category;
                return category && category !== 'all' ? `/shop?category=${category}` : '/shop';
            }
            case 'product': return `/product/${this.store.state.currentProductId || 1}`;
            case 'cart': return '/cart';
            case 'checkout': return '/checkout';
            case 'orders': return '/orders';
            case 'admin': return '/admin';
            default: return '/';
        }
    }

    renderPage(page) {
        switch(page) {
            case 'home': renderHome(this.store); break;
            case 'shop': renderShop(this.store); break;
            case 'product': renderProductDetail(this.store); break;
            case 'cart': renderCart(this.store); break;
            case 'checkout': renderCheckout(this.store); break;
            case 'orders': renderOrders(this.store); break;
            case 'admin': renderAdmin(this.store); break;
            default: 
                document.getElementById('mainContent').innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }
}

// ============================================
//  INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Create store instance
    store = new Store();
    
    // Create router
    router = new Router(store);
    
    // Make global
    window.store = store;
    window.router = router;
    window.navigate = navigate;
    window.showLoginModal = showLoginModal;
    window.closeModal = closeModal;
    window.handleAddToCart = handleAddToCart;
    window.handleLogout = handleLogout;
    window.applyFilter = applyFilter;
    window.applyPriceRange = applyPriceRange;
    window.clearFilters = clearFilters;
    window.showAddProductModal = showAddProductModal;
    window.deleteProduct = deleteProduct;
    window.exportData = exportData;
    window.importData = importData;
    window.resetStore = resetStore;
    window.updateCartQty = updateCartQty;
    window.removeFromCart = removeFromCart;
    window.clearCart = clearCart;
    
    // Render header and footer
    renderHeader(store);
    renderFooter(store);
    
    // Initial navigation
    const initialPath = window.location.pathname;
    router.navigate(initialPath);
    
    console.log('🛍️ ShopVerse Loaded!');
    console.log('Available commands:');
    console.log('  store.state - View current state');
    console.log('  navigate("/shop") - Go to shop');
    console.log('  store.addToCart(id) - Add product to cart');
});