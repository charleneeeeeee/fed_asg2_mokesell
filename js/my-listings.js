import { getUserProducts, updateProduct, deleteProduct } from './api.js';
import { showToast, updateNavigation } from './utils.js';

let currentProducts = [];
let productToDelete = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Update navigation
    updateNavigation();

    try {
        // Load user's products
        currentProducts = await getUserProducts(user.username);
        displayProducts(currentProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load your listings. Please try again.', 'error');
    }

    // Set up event listeners for edit and delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.edit-product')) {
            const productId = e.target.dataset.id;
            const product = currentProducts.find(p => p._id === productId);
            if (product) {
                setupEditModal(product);
            }
        } else if (e.target.matches('.delete-product')) {
            productToDelete = e.target.dataset.id;
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
            deleteModal.show();
        }
    });

    // Handle save changes in edit modal
    document.getElementById('saveChanges').addEventListener('click', handleSaveChanges);
    
    // Handle delete confirmation
    document.getElementById('confirmDelete').addEventListener('click', handleDeleteConfirm);
});

function displayProducts(products) {
    const container = document.getElementById('myListings');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted mb-4">You haven't listed any products yet.</p>
                <a href="sell.html" class="btn btn-primary">
                    <i class="bi bi-plus-lg me-2"></i>List Your First Product
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${product.images[0]}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text text-truncate">${product.description}</p>
                    <p class="card-text"><strong class="text-primary">$${product.price.toFixed(2)}</strong></p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-outline-primary edit-product" data-id="${product._id}">
                            <i class="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button class="btn btn-outline-danger delete-product" data-id="${product._id}">
                            <i class="bi bi-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function setupEditModal(product) {
    document.getElementById('editProductId').value = product._id;
    document.getElementById('editTitle').value = product.title;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editCategory').value = product.category;

    // Display current images
    const imagePreview = document.getElementById('editImagePreview');
    imagePreview.innerHTML = product.images.map(image => `
        <img src="${image}" alt="Product image" style="width: 100px; height: 100px; object-fit: cover;" class="rounded">
    `).join('');

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

async function handleSaveChanges() {
    const productId = document.getElementById('editProductId').value;
    const product = currentProducts.find(p => p._id === productId);
    
    if (!product) return;

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
        const updatedProduct = await updateProduct(productId, updatedData);
        if (updatedProduct) {
            const index = currentProducts.findIndex(p => p._id === productId);
            if (index !== -1) {
                currentProducts[index] = updatedProduct;
                displayProducts(currentProducts);
            }

            const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();

            showToast('Product updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showToast('Failed to update product. Please try again.', 'error');
    }
}

async function handleDeleteConfirm() {
    if (!productToDelete) return;

    try {
        await deleteProduct(productToDelete);
        
        currentProducts = currentProducts.filter(p => p._id !== productToDelete);
        displayProducts(currentProducts);

        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        deleteModal.hide();

        showToast('Product deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product. Please try again.', 'error');
    } finally {
        productToDelete = null;
    }
}