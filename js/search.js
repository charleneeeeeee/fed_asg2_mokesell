import { searchProducts } from './api.js';
import { showToast, updateNavigation } from './utils.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Update navigation based on user login status
    updateNavigation();

    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (!query) {
        window.location.href = 'index.html';
        return;
    }

    // Update page title and search input
    document.title = `Search: ${query} - MokeSell`;
    document.getElementById('searchInput').value = query;
    document.getElementById('searchTitle').textContent = `Search Results for "${query}"`;

    try {
        // Load search results
        const products = await searchProducts(query);
        displaySearchResults(products);
    } catch (error) {
        console.error('Error loading search results:', error);
        showToast('Failed to load search results. Please try again.', 'error');
    }

    // Handle new search
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        const newQuery = searchInput.value.trim();
        
        if (newQuery) {
            window.location.href = `search.html?q=${encodeURIComponent(newQuery)}`;
        }
    });
});

function displaySearchResults(products) {
    const searchResults = document.getElementById('searchResults');
    
    if (!products || products.length === 0) {
        searchResults.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted mb-4">No products found matching your search.</p>
                <a href="index.html" class="btn btn-primary">
                    <i class="bi bi-house me-2"></i>Return to Home
                </a>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = products.map(product => `
        <div class="col-md-3 mb-4">
            <div class="card h-100">
                <a href="product.html?id=${product._id}" class="text-decoration-none">
                    <img src="${product.images[0]}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title text-dark">${product.title}</h5>
                        <p class="card-text text-truncate text-secondary">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fs-5 fw-bold text-primary">$${product.price.toFixed(2)}</span>
                            <small class="text-muted">${product.username}</small>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `).join('');
}