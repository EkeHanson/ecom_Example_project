// ============================================
//  HEADER COMPONENT
// ============================================

export function renderHeader(store, container) {
    const state = store.state;
    const cartCount = store.getCartCount();
    const user = state.currentUser;
    
    container.innerHTML = `
        <div class="header-container">
            <div class="logo" onclick="window.router.navigate('/')">
                <i class="fas fa-store"></i>
                Shop<span>Verse</span>
            </div>
            
            <div class="search-bar">
                <input type="text" id="globalSearch" placeholder="Search products..." 
                       value="${state.filters.search || ''}">
                <button id="globalSearchBtn"><i class="fas fa-search"></i></button>
            </div>
            
            <nav class="nav-links">
                <a href="#" onclick="window.router.navigate('/')">Home</a>
                <a href="#" onclick="window.router.navigate('/shop')">Shop</a>
                
                ${user ? `<a href="#" onclick="window.router.navigate('/orders')">Orders</a>` : ''}
                
                ${user && user.isAdmin ? `<a href="#" onclick="window.router.navigate('/admin')">Admin</a>` : ''}
                
                <a href="#" onclick="window.router.navigate('/cart')" class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">${cartCount}</span>
                </a>
                
                <div class="user-menu">
                    ${user ? `
                        <div class="user-avatar" title="${user.name}">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <button class="auth-btn" onclick="window.store.logout(); window.router.navigate('/')">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    ` : `
                        <button class="auth-btn" id="loginBtn">
                            <i class="fas fa-user"></i> Login
                        </button>
                    `}
                </div>
            </nav>
        </div>
    `;
    
    // Event Listeners
    const searchInput = document.getElementById('globalSearch');
    const searchBtn = document.getElementById('globalSearchBtn');
    
    const performSearch = () => {
        const term = searchInput.value.trim();
        store.state.filters.search = term;
        store.saveToStorage();
        
        // If on shop page, re-render it
        if (store.state.currentPage === 'shop') {
            const container = document.getElementById('mainContent');
            import('../pages/shop.js').then(module => {
                module.renderShop(store, container);
            });
        } else {
            // Navigate to shop with search
            window.router.navigate('/shop');
        }
    };
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            showLoginModal(store);
        });
    }
}

// ============================================
//  LOGIN MODAL
// ============================================

function showLoginModal(store) {
    const modalContainer = document.getElementById('modalContainer');
    
    modalContainer.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
            <div class="modal-content">
                <h2><i class="fas fa-user-circle"></i> Login</h2>
                <p style="color: #666; margin-bottom: 1.5rem;">Demo: Use any email/password. Use "admin@shop.com" for admin access.</p>
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
            // Update header
            const headerContainer = document.getElementById('mainHeader');
            renderHeader(store, headerContainer);
            // Re-render current page
            const currentPage = store.state.currentPage;
            const container = document.getElementById('mainContent');
            import(`../pages/${currentPage}.js`).then(module => {
                const renderFn = module[`render${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}`];
                if (renderFn) renderFn(store, container);
            });
        } else {
            showToast('Login failed. Please try again.', 'error');
        }
    });
}

// ============================================
//  UTILITY FUNCTIONS
// ============================================

function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
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

// Expose to window
window.closeModal = closeModal;
window.showToast = showToast;