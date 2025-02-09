import { getProductsByCategory } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Update navigation based on user login status
    updateNavigation();

    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (!category) {
        window.location.href = 'index.html';
        return;
    }

    // Update page title
    const categoryTitle = document.getElementById('categoryTitle');
    categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);

    try {
        // Load products
        const products = await getProductsByCategory(category);
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Failed to load products. Please try again.');
    }
});

function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    
    if (products.length === 0) {
        productGrid.innerHTML = '<div class="col-12 text-center"><p>No products found in this category.</p></div>';
        return;
    }

    productGrid.innerHTML = products.map(product => `
        <div class="col-md-4 col-lg-3">
            <div class="card h-100">
                <a href="product.html?id=${product._id}" class="text-decoration-none">
                    <img src="${product.images[0]}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title text-dark">${product.title}</h5>
                        <p class="card-text text-truncate text-secondary">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fs-5 fw-bold text-dark">$${product.price.toFixed(2)}</span>
                            <small class="text-muted">${product.username}</small>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `).join('');
}

function updateNavigation() {
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