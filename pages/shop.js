// ============================================
//  SHOP PAGE (Product Listing with Filters)
// ============================================

export function renderShop(store, container) {
    const state = store.state;
    const products = store.getFilteredProducts();
    const categories = state.categories;
    const filters = state.filters;
    
    container.innerHTML = `
        <div class="shop-layout">
            <!-- Sidebar Filters -->
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
            
            <!-- Product Grid -->
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2>Products</h2>
                    <span style="color:#666;">${products.length} products found</span>
                </div>
                
                <div class="product-grid">
                    ${products.length > 0 ? products.map(product => `
                        <div class="product-card" onclick="window.router.navigate('/product/${product.id}')" style="cursor:pointer;">
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
                                <button class="add-to-cart-btn" onclick="event.stopPropagation(); handleShopAddToCart(${product.id})">
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
    
    // Make filter functions global
    window.applyFilter = (key, value) => {
        store.state.filters[key] = value;
        store.saveToStorage();
        renderShop(store, container);
    };
    
    window.applyPriceRange = (value) => {
        store.state.filters.priceRange[1] = parseInt(value);
        store.saveToStorage();
        renderShop(store, container);
    };
    
    window.clearFilters = () => {
        store.state.filters = {
            category: 'all',
            priceRange: [0, 500],
            rating: 0,
            search: store.state.filters.search || ''
        };
        store.saveToStorage();
        renderShop(store, container);
        // Update search bar
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.value = '';
    };
    
    window.handleShopAddToCart = (productId) => {
        if (store.addToCart(productId)) {
            showToast('Product added to cart!', 'success');
            const headerContainer = document.getElementById('mainHeader');
            import('../components/header.js').then(module => {
                module.renderHeader(store, headerContainer);
            });
        }
    };
}