// Navigation utility
export function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginRegisterDropdown = document.getElementById('loginRegisterDropdown');
    const userProfileButton = document.getElementById('userProfileButton');
    const sellButton = document.getElementById('sellButton');
    
    if (user) {
        if (loginRegisterDropdown) loginRegisterDropdown.style.display = 'none';
        if (userProfileButton) {
            userProfileButton.style.display = 'block';
            userProfileButton.querySelector('.username').textContent = user.username;
        }
        if (sellButton) sellButton.style.display = 'block';
    } else {
        if (loginRegisterDropdown) loginRegisterDropdown.style.display = 'block';
        if (userProfileButton) userProfileButton.style.display = 'none';
        if (sellButton) sellButton.style.display = 'none';
    }
}

// Toast notification utility
export function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} p-3`;
    toast.innerHTML = message;
    toastContainer.appendChild(toast);

    // Trigger reflow to enable animation
    toast.offsetHeight;
    toast.classList.add('show');

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}