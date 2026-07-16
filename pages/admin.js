// ============================================
//  ADMIN DASHBOARD
// ============================================

export function renderAdmin(store, container) {
    const user = store.state.currentUser;
    
    if (!user || !user.isAdmin) {
        container.innerHTML = `
            <div style="text-align:center; padding:4rem; background:white; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                <i class="fas fa-shield-alt" style="font-size:4rem; color:#e74c3c;"></i>
                <h2>Access Denied</h2>
                <p style="color:#666; margin:1rem 0;">You need admin privileges to access this page.</p>
                <button onclick="window.router.navigate('/')" style="padding:0.8rem 2rem; background:#3498db; color:white; border:none; border-radius:5px;">
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
            ${products.length > 10 ? `<div style="padding:1rem; text-align:center; color:#666;">Showing 10 of ${products.length} products</div>` : ''}
        </div>
    `;
    
    // Make admin functions global
    window.showAddProductModal = () => {
        import('../components/modal.js').then(module => {
            module.showModal('Add New Product', `
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
                </form>
            `, () => {
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
                showToast('Product added successfully!', 'success');
                renderAdmin(store, container);
            });
        });
    };
    
    window.deleteProduct = (productId) => {
        if (confirm('Delete this product?')) {
            store.state.products = store.state.products.filter(p => p.id !== productId);
            store.saveToStorage();
            renderAdmin(store, container);
            showToast('Product deleted.', 'info');
        }
    };
    
    window.exportData = () => {
        const data = JSON.stringify(store.state, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopverse_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported successfully!', 'success');
    };
    
    window.importData = () => {
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
                    renderAdmin(store, container);
                    showToast('Data imported successfully!', 'success');
                } catch (err) {
                    showToast('Invalid file format.', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    
    window.resetStore = () => {
        if (confirm('⚠️ This will delete all data. Are you sure?')) {
            localStorage.removeItem('shopverse_state');
            location.reload();
        }
    };
}