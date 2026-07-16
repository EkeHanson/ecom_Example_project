// ============================================
//  CHECKOUT PAGE
// ============================================

export function renderCheckout(store, container) {
    const cartItems = store.state.cart;
    const total = store.getCartTotal();
    const user = store.state.currentUser;
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem;">
                <i class="fas fa-exclamation-circle" style="font-size:4rem; color:#e74c3c;"></i>
                <h2>Cart is Empty</h2>
                <p style="color:#666;">Add items to your cart before checking out.</p>
                <button onclick="window.router.navigate('/shop')" style="margin-top:1rem; padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
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
                <p style="color:#666; margin:1rem 0;">You need to be logged in to complete your purchase.</p>
                <button onclick="document.getElementById('loginBtn').click()" style="padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
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
        
        // Validate
        if (!orderData.address || !orderData.city || !orderData.zip) {
            showToast('Please fill in all shipping details.', 'error');
            return;
        }
        
        const order = store.createOrder(orderData);
        showToast('🎉 Order placed successfully!', 'success');
        window.router.navigate('/orders');
    });
}