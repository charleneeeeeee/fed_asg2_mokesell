import { getProductById, updateProduct, deleteProduct } from './api.js';
import { showToast, updateNavigation } from './utils.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Update navigation based on user login status
    updateNavigation();

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Load product details
        const product = await getProductById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        displayProduct(product);
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Failed to load product details. Please try again.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});

function displayProduct(product) {
    // Update page title
    document.title = `${product.title} - MokeSell`;
    
    // Update breadcrumbs
    const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
    const productBreadcrumb = document.getElementById('productBreadcrumb');
    
    categoryBreadcrumb.innerHTML = `<a href="category.html?category=${product.category}" class="text-decoration-none">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</a>`;
    productBreadcrumb.textContent = product.title;

    // Update product details
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('sellerName').textContent = product.username;
    document.getElementById('listingDate').textContent = `Listed on ${new Date(product.created_on).toLocaleDateString()}`;

    // Update product image
    const productImage = document.getElementById('productImage');
    productImage.src = product.images[0];
    productImage.alt = product.title;

    // Check if current user is the product owner
    const user = JSON.parse(localStorage.getItem('user'));
    const buyNowBtn = document.getElementById('buyNowBtn');
    
    if (user && user.username === product.username) {
        // Replace buy button with edit/delete buttons for product owner
        buyNowBtn.parentElement.innerHTML = `
            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary flex-grow-1" onclick="setupEditModal()">
                    <i class="bi bi-pencil me-2"></i>Edit Product
                </button>
                <button class="btn btn-outline-danger flex-grow-1" onclick="showDeleteModal()">
                    <i class="bi bi-trash me-2"></i>Delete Product
                </button>
            </div>
        `;

        // Setup edit modal
        setupEditModal(product);

        // Setup delete modal
        setupDeleteModal(product);
    } else {
        // Setup buy now button for non-owners
        buyNowBtn.addEventListener('click', () => {
            if (!user) {
                showToast('Please login to purchase this item', 'info');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            }
            window.location.href = `purchase.html?id=${product._id}`;
        });
    }
}

function setupEditModal(product) {
    // Populate edit form with current product data
    document.getElementById('editTitle').value = product.title;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editCategory').value = product.category;

    // Display current images
    const imagePreview = document.getElementById('editImagePreview');
    imagePreview.innerHTML = product.images.map(image => `
        <img src="${image}" alt="Product image" style="width: 100px; height: 100px; object-fit: cover;" class="rounded">
    `).join('');

    // Handle save changes
    document.getElementById('saveChanges').addEventListener('click', async () => {
        const updatedData = {
            ...product,
            title: document.getElementById('editTitle').value.trim(),
            description: document.getElementById('editDescription').value.trim(),
            price: parseFloat(document.getElementById('editPrice').value),
            category: document.getElementById('editCategory').value
        };

        // Basic validation
        if (!updatedData.title || !updatedData.description || isNaN(updatedData.price) || updatedData.price <= 0) {
            showToast('Please fill in all fields correctly', 'error');
            return;
        }

        try {
            const updatedProduct = await updateProduct(product._id, updatedData);
            if (updatedProduct) {
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                editModal.hide();
                showToast('Product updated successfully!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showToast('Failed to update product. Please try again.', 'error');
        }
    });
}

function setupDeleteModal(product) {
    document.getElementById('confirmDelete').addEventListener('click', async () => {
        try {
            await deleteProduct(product._id);
            showToast('Product deleted successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'my-listings.html';
            }, 1500);
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Failed to delete product. Please try again.', 'error');
        }
    });
}

// Make functions available globally for onclick handlers
window.setupEditModal = () => {
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
};

window.showDeleteModal = () => {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
};