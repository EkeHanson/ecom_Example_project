// ============================================
//  MODAL COMPONENT (Reusable)
// ============================================

export function showModal(title, content, onConfirm = null) {
    const container = document.getElementById('modalContainer');
    
    container.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
            <div class="modal-content">
                <h2>${title}</h2>
                <div>${content}</div>
                <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:flex-end;">
                    <button onclick="closeModal()" style="padding:0.5rem 1.5rem; border:1px solid #ddd; border-radius:5px; background:white;">
                        Cancel
                    </button>
                    ${onConfirm ? `
                        <button id="confirmBtn" style="padding:0.5rem 1.5rem; background:#3498db; color:white; border:none; border-radius:5px;">
                            Confirm
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    if (onConfirm) {
        document.getElementById('confirmBtn').addEventListener('click', () => {
            onConfirm();
            closeModal();
        });
    }
}

export function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

export function showToast(message, type = 'info') {
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