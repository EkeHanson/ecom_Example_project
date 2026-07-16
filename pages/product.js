// ============================================
//  PRODUCT DETAIL PAGE
// ============================================

export function renderProductDetail(store, container, params) {
    const productId = params.id || store.state.currentProductId;
    const product = store.getProduct(productId);
    
    if (!product) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem;">
                <i class="fas fa-exclamation-circle" style="font-size:4rem; color:#e74c3c;"></i>
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist.</p>
                <button onclick="window.router.navigate('/shop')" style="margin-top:1rem; padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
                    Back to Shop
                </button>
            </div>
        `;
        return;
    }
    
    let quantity = 1;
    
    container.innerHTML = `
        <button onclick="window.router.navigate('/shop')" style="margin-bottom:2rem; padding:0.5rem 1rem; background:none; border:1px solid #ddd; border-radius:5px; cursor:pointer;">
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
        document.getElementById('quantityDisplay').textContent = quantity;
    };
    
    window.handleProductAddToCart = (productId) => {
        if (store.addToCart(productId, quantity)) {
            showToast(`${quantity} × ${product.name} added to cart!`, 'success');
            const headerContainer = document.getElementById('mainHeader');
            import('../components/header.js').then(module => {
                module.renderHeader(store, headerContainer);
            });
        }
    };
}