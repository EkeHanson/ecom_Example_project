// ============================================
//  ORDERS PAGE
// ============================================

export function renderOrders(store, container) {
    const orders = store.state.orders;
    const user = store.state.currentUser;
    
    if (!user) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem;">
                <i class="fas fa-user-lock" style="font-size:4rem; color:#e67e22;"></i>
                <h2>Please Login to View Orders</h2>
                <button onclick="document.getElementById('loginBtn').click()" style="margin-top:1rem; padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
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
                <button onclick="window.router.navigate('/shop')" style="padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
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