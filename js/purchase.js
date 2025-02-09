import { getProductById, validateVoucher, deleteVoucher, getUserVouchers, deleteProduct } from './api.js';
import { showToast } from './utils.js';

let currentProduct = null;
let appliedVoucher = null;

document.addEventListener('DOMContentLoaded', async function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        currentProduct = await getProductById(productId);
        if (!currentProduct) {
            throw new Error('Product not found');
        }
        displayProduct(currentProduct);
        await loadUserVouchers(user.username);
        setupDiscountCode();
        setupPurchaseForm();
        setupBackButton();
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Failed to load product details. Please try again.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});

function displayProduct(product) {
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productImage').src = product.images[0];
}

async function loadUserVouchers(username) {
    try {
        const vouchers = await getUserVouchers(username);
        const discountSelect = document.getElementById('discountCode');
        
        if (vouchers.length === 0) {
            discountSelect.innerHTML = '<option value="">No vouchers available</option>';
            return;
        }

        discountSelect.innerHTML = '<option value="">Select a voucher</option>' +
            vouchers.map(voucher => `
                <option value="${voucher._id}">
                    ${voucher.discount}% OFF (Code: ${voucher.code})
                </option>
            `).join('');
    } catch (error) {
        console.error('Error loading vouchers:', error);
        showToast('Failed to load your vouchers', 'error');
    }
}

function setupDiscountCode() {
    const applyButton = document.getElementById('applyDiscount');
    const discountSelect = document.getElementById('discountCode');
    const discountMessage = document.getElementById('discountMessage');

    applyButton.addEventListener('click', async () => {
        const voucherId = discountSelect.value;
        
        if (!voucherId) {
            appliedVoucher = null;
            document.getElementById('discountInfo').style.display = 'none';
            discountMessage.className = 'form-text text-muted';
            discountMessage.textContent = 'No voucher selected';
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const vouchers = await getUserVouchers(user.username);
            const selectedVoucher = vouchers.find(v => v._id === voucherId);
            
            if (selectedVoucher) {
                appliedVoucher = selectedVoucher;
                const discountedPrice = calculateDiscountedPrice(currentProduct.price, selectedVoucher.discount);
                
                document.getElementById('discountInfo').style.display = 'block';
                document.getElementById('discountedPrice').textContent = `$${discountedPrice.toFixed(2)}`;
                
                discountMessage.className = 'form-text text-success';
                discountMessage.textContent = `${selectedVoucher.discount}% discount applied successfully!`;
                
                showToast(`Voucher applied: ${selectedVoucher.discount}% off!`, 'success');
            } else {
                discountMessage.className = 'form-text text-danger';
                discountMessage.textContent = 'Invalid or expired voucher';
                showToast('Invalid voucher', 'error');
            }
        } catch (error) {
            console.error('Error validating voucher:', error);
            showToast('Failed to validate voucher', 'error');
        }
    });

    discountSelect.addEventListener('change', () => {
        if (!discountSelect.value) {
            appliedVoucher = null;
            document.getElementById('discountInfo').style.display = 'none';
            discountMessage.textContent = 'Select a voucher to apply';
            discountMessage.className = 'form-text text-muted';
        }
    });
}

function calculateDiscountedPrice(originalPrice, discountPercentage) {
    return originalPrice * (1 - discountPercentage / 100);
}

function setupPurchaseForm() {
    const form = document.getElementById('purchaseForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Calculate final price
            const finalPrice = appliedVoucher 
                ? calculateDiscountedPrice(currentProduct.price, appliedVoucher.discount)
                : currentProduct.price;

            // Delete the voucher if one was used
            if (appliedVoucher) {
                try {
                    await deleteVoucher(appliedVoucher._id);
                    showToast('Voucher used successfully!', 'success');
                } catch (error) {
                    console.error('Error deleting voucher:', error);
                    showToast('Error processing voucher', 'error');
                    return;
                }
            }

            // Delete the product from the database
            try {
                await deleteProduct(currentProduct._id);
            } catch (error) {
                console.error('Error deleting product:', error);
                showToast('Error completing purchase', 'error');
                return;
            }

            // Show success message
            document.getElementById('successPrice').textContent = `$${finalPrice.toFixed(2)}`;
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();

            // Clear form
            form.reset();
            
            // Disable the purchase button to prevent double submission
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
        } catch (error) {
            console.error('Error processing purchase:', error);
            showToast('Failed to complete purchase', 'error');
        }
    });
}

function setupBackButton() {
    document.getElementById('backButton').addEventListener('click', () => {
        window.history.back();
    });
}