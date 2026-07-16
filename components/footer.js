// ============================================
//  FOOTER COMPONENT
// ============================================

export function renderFooter(store, container) {
    container.innerHTML = `
        <footer style="
            background: #2c3e50;
            color: white;
            padding: 2rem;
            margin-top: 3rem;
        ">
            <div style="max-width:1400px; margin:0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:2rem;">
                <div>
                    <h3 style="color:#3498db;">ShopVerse</h3>
                    <p style="color:#bdc3c7; margin-top:0.5rem;">Your premium e-commerce destination for quality products.</p>
                </div>
                <div>
                    <h4>Quick Links</h4>
                    <ul style="list-style:none; margin-top:0.5rem;">
                        <li><a href="#" onclick="window.router.navigate('/')" style="color:#bdc3c7;">Home</a></li>
                        <li><a href="#" onclick="window.router.navigate('/shop')" style="color:#bdc3c7;">Shop</a></li>
                        <li><a href="#" onclick="window.router.navigate('/cart')" style="color:#bdc3c7;">Cart</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Categories</h4>
                    <ul style="list-style:none; margin-top:0.5rem;">
                        ${store.state.categories.slice(0, 4).map(cat => `
                            <li><a href="#" onclick="window.router.navigate('/shop?category=${cat}')" style="color:#bdc3c7;">${cat}</a></li>
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