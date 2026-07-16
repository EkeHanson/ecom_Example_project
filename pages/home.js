// ============================================
//  HOME PAGE
// ============================================

export function renderHome(store, container) {
    const products = store.state.products.slice(0, 8);
    const categories = store.state.categories;
    
    container.innerHTML = `
        <!-- Hero Section -->
        <section class="hero">
            <h1>Welcome to ShopVerse</h1>
            <p>Discover premium products at unbeatable prices. Quality guaranteed.</p>
            <button class="cta-button" onclick="window.router.navigate('/shop')">
                <i class="fas fa-shopping-bag"></i> Start Shopping
            </button>
        </section>
        
        <!-- Categories -->
        <h2 style="margin-bottom:1.5rem;">Shop by Category</h2>
        <div class="category-grid">
            ${categories.slice(0, 6).map(cat => `
                <div class="category-card" onclick="window.router.navigate('/shop?category=${cat}')">
                    <i class="fas fa-${getCategoryIcon(cat)}"></i>
                    <h3>${cat}</h3>
                </div>
            `).join('')}
        </div>
        
        <!-- Featured Products -->
        <h2 style="margin:2rem 0 1.5rem;">Featured Products</h2>
        <div class="featured-products">
            ${products.map(product => `
                <div class="product-card">
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
                        <button class="add-to-cart-btn" onclick="handleAddToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align:center; margin-top:2rem;">
            <button class="cta-button" onclick="window.router.navigate('/shop')" style="background:#2c3e50;">
                View All Products <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Make add to cart function global for onclick
    window.handleAddToCart = (productId) => {
        if (store.addToCart(productId)) {
            showToast('Product added to cart!', 'success');
            // Update header cart count
            const headerContainer = document.getElementById('mainHeader');
            import('../components/header.js').then(module => {
                module.renderHeader(store, headerContainer);
            });
        } else {
            showToast('Failed to add product.', 'error');
        }
    };
}

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