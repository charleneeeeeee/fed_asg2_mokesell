import { createProduct } from './api.js';
import { showToast, updateNavigation } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Update navigation
    updateNavigation();

    // Handle image preview
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');

    imageInput.addEventListener('change', function() {
        imagePreview.innerHTML = '';
        const files = Array.from(this.files);
        
        if (files.length > 5) {
            showToast('Maximum 5 images allowed', 'error');
            this.value = '';
            return;
        }
        
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('Each image must be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.className = 'rounded';
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // Handle form submission
    const sellForm = document.getElementById('sellProductForm');
    sellForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show loading animation
        document.getElementById('loadingAnimation').style.display = 'block';

        try {
            const title = document.getElementById('productTitle').value.trim();
            const description = document.getElementById('productDescription').value.trim();
            const price = parseFloat(document.getElementById('productPrice').value);
            const category = document.getElementById('productCategory').value;
            const imageFiles = document.getElementById('productImage').files;

            // Validation
            if (!title || !description || !price || !category || imageFiles.length === 0) {
                showToast('Please fill in all fields and add at least one image', 'error');
                return;
            }

            if (price <= 0) {
                showToast('Price must be greater than 0', 'error');
                return;
            }

            // Convert images to base64
            const imagePromises = Array.from(imageFiles).map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
            });

            const images = await Promise.all(imagePromises);

            const productData = {
                title,
                description,
                price,
                category,
                images,
                username: user.username
            };

            const newProduct = await createProduct(productData);
            
            if (newProduct) {
                showToast('Product listed successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'my-listings.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showToast('Failed to list product. Please try again.', 'error');
        } finally {
            document.getElementById('loadingAnimation').style.display = 'none';
        }
    });
});