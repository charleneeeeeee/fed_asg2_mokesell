import { getProductsByCategory } from './api.js';
import { showToast, updateNavigation } from './utils.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Update navigation based on user login status
    updateNavigation();

    // Handle search form submission
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            const query = searchInput.value.trim();
            
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // Load category items on homepage
    await loadCategoryItems();
});

async function loadCategoryItems() {
    const categories = ['clothes', 'electronics', 'books', 'collectables', 'luxury'];
    
    for (const category of categories) {
        try {
            const products = await getProductsByCategory(category);
            const container = document.getElementById(`${category}Items`);
            
            if (container && products.length > 0) {
                // Display up to 4 items
                const displayProducts = products.slice(0, 4);
                container.innerHTML = displayProducts.map(product => `
                    <div class="col-md-3">
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
            } else if (container) {
                container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No items found in this category.</p></div>';
            }
        } catch (error) {
            console.error(`Error loading ${category} items:`, error);
            showToast(`Failed to load ${category} items. Please try again.`, 'error');
        }
    }
}