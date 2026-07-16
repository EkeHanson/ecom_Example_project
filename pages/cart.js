// ============================================
//  CART PAGE
// ============================================

export function renderCart(store, container) {
    const cartItems = store.state.cart;
    const total = store.getCartTotal();
    const count = store.getCartCount();
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your Cart is Empty</h2>
                <p style="color:#666; margin:1rem 0;">Browse our products and add items you love!</p>
                <button class="cta-button" onclick="window.router.navigate('/shop')">
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
                    <button class="checkout-btn" onclick="window.router.navigate('/checkout')">
                        <i class="fas fa-credit-card"></i> Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Make functions global
    window.updateCartQty = (productId, newQty) => {
        store.updateCartQuantity(productId, newQty);
        renderCart(store, container);
        // Update header
        const headerContainer = document.getElementById('mainHeader');
        import('../components/header.js').then(module => {
            module.renderHeader(store, headerContainer);
        });
    };
    
    window.removeFromCart = (productId) => {
        store.removeFromCart(productId);
        renderCart(store, container);
        const headerContainer = document.getElementById('mainHeader');
        import('../components/header.js').then(module => {
            module.renderHeader(store, headerContainer);
        });
        showToast('Item removed from cart.', 'info');
    };
    
    window.clearCart = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            store.clearCart();
            renderCart(store, container);
            const headerContainer = document.getElementById('mainHeader');
            import('../components/header.js').then(module => {
                module.renderHeader(store, headerContainer);
            });
            showToast('Cart cleared.', 'info');
        }
    };
}