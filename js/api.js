// RestDB Configuration
const RESTDB_URL = 'https://mokesell-d7a1.restdb.io';
const RESTDB_KEY = '67a8cc64020c06e7d5e6536d';
const USERS_COLLECTION = 'useraccount';
const PRODUCTS_COLLECTION = 'products';
const VOUCHERS_COLLECTION = 'vouchers';
const SPINS_COLLECTION = 'spins';
const FEEDBACK_COLLECTION = 'feedback';

// API Headers
const headers = {
    'Content-Type': 'application/json',
    'x-apikey': RESTDB_KEY,
    'cache-control': 'no-cache'
};

// Helper function to handle API responses
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'API request failed');
    }
    return response.json();
}

// User API Functions
export async function loginUser(email, password) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${USERS_COLLECTION}?q={"email":"${email}","password":"${password}"}`, {
            method: 'GET',
            headers: headers
        });
        const data = await handleResponse(response);
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export async function registerUser(userData) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${USERS_COLLECTION}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                password: userData.password
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

export async function updateUser(userId, userData) {
    try {
        // Get the current user to check if username is changing
        const currentUserResponse = await fetch(`${RESTDB_URL}/rest/${USERS_COLLECTION}/${userId}`, {
            method: 'GET',
            headers: headers
        });
        const currentUser = await handleResponse(currentUserResponse);
        const oldUsername = currentUser.username;

        // Update the user
        const response = await fetch(`${RESTDB_URL}/rest/${USERS_COLLECTION}/${userId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(userData)
        });
        const updatedUser = await handleResponse(response);

        // If username has changed, update all related collections
        if (oldUsername !== userData.username) {
            // Get all products by the old username
            const productsResponse = await fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}?q={"username":"${oldUsername}"}`, {
                method: 'GET',
                headers: headers
            });
            const products = await handleResponse(productsResponse);

            // Update each product with the new username
            await Promise.all(products.map(product => 
                fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}/${product._id}`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify({
                        ...product,
                        username: userData.username
                    })
                }).then(handleResponse)
            ));

            // Get all vouchers by the old username
            const vouchersResponse = await fetch(`${RESTDB_URL}/rest/${VOUCHERS_COLLECTION}?q={"username":"${oldUsername}"}`, {
                method: 'GET',
                headers: headers
            });
            const vouchers = await handleResponse(vouchersResponse);

            // Update each voucher with the new username
            await Promise.all(vouchers.map(voucher => 
                fetch(`${RESTDB_URL}/rest/${VOUCHERS_COLLECTION}/${voucher._id}`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify({
                        ...voucher,
                        username: userData.username
                    })
                }).then(handleResponse)
            ));

            // Get all spins by the old username
            const spinsResponse = await fetch(`${RESTDB_URL}/rest/${SPINS_COLLECTION}?q={"username":"${oldUsername}"}`, {
                method: 'GET',
                headers: headers
            });
            const spins = await handleResponse(spinsResponse);

            // Update each spin with the new username
            await Promise.all(spins.map(spin => 
                fetch(`${RESTDB_URL}/rest/${SPINS_COLLECTION}/${spin._id}`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify({
                        ...spin,
                        username: userData.username
                    })
                }).then(handleResponse)
            ));
        }

        return updatedUser;
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
}

export async function checkEmailExists(email, excludeUserId = null) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${USERS_COLLECTION}?q={"email":"${email}"}`, {
            method: 'GET',
            headers: headers
        });
        const data = await handleResponse(response);
        if (excludeUserId) {
            return data.some(user => user._id !== excludeUserId && user.email === email);
        }
        return data.length > 0;
    } catch (error) {
        console.error('Email check error:', error);
        throw error;
    }
}

export async function checkUsernameExists(username, excludeUserId = null) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${USERS_COLLECTION}?q={"username":"${username}"}`, {
            method: 'GET',
            headers: headers
        });
        const data = await handleResponse(response);
        if (excludeUserId) {
            return data.some(user => user._id !== excludeUserId && user.username === username);
        }
        return data.length > 0;
    } catch (error) {
        console.error('Username check error:', error);
        throw error;
    }
}

// Product API Functions
export async function createProduct(productData) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                title: productData.title,
                description: productData.description,
                price: productData.price,
                category: productData.category,
                images: productData.images,
                username: productData.username,
                created_on: new Date().toISOString()
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Product creation error:', error);
        throw error;
    }
}

export async function updateProduct(productId, productData) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}/${productId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(productData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Product update error:', error);
        throw error;
    }
}

export async function deleteProduct(productId) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}/${productId}`, {
            method: 'DELETE',
            headers: headers
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Product deletion error:', error);
        throw error;
    }
}

export async function getProductsByCategory(category) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}?q={"category":"${category}"}&sort=created_on`, {
            method: 'GET',
            headers: headers
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Get products error:', error);
        throw error;
    }
}

export async function getProductById(productId) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}/${productId}`, {
            method: 'GET',
            headers: headers
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Get product error:', error);
        throw error;
    }
}

export async function getUserProducts(username) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}?q={"username":"${username}"}`, {
            method: 'GET',
            headers: headers
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Get user products error:', error);
        throw error;
    }
}

export async function searchProducts(query) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${PRODUCTS_COLLECTION}`, {
            method: 'GET',
            headers: headers
        });
        const allProducts = await handleResponse(response);
        
        const searchTerm = query.toLowerCase();
        return allProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm)
        );
    } catch (error) {
        console.error('Search products error:', error);
        throw error;
    }
}

// Voucher API Functions
export async function createVoucher(voucherData) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${VOUCHERS_COLLECTION}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                code: voucherData.code,
                username: voucherData.username,
                discount: voucherData.discount,
                created_at: new Date().toISOString()
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Voucher creation error:', error);
        throw error;
    }
}

export async function getUserVouchers(username) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${VOUCHERS_COLLECTION}?q={"username":"${username}"}`, {
            method: 'GET',
            headers: headers
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Get vouchers error:', error);
        throw error;
    }
}

export async function validateVoucher(code, username) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${VOUCHERS_COLLECTION}?q={"code":"${code}","username":"${username}"}`, {
            method: 'GET',
            headers: headers
        });
        const vouchers = await handleResponse(response);
        return vouchers.length > 0 ? vouchers[0] : null;
    } catch (error) {
        console.error('Validate voucher error:', error);
        throw error;
    }
}

export async function deleteVoucher(voucherId) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${VOUCHERS_COLLECTION}/${voucherId}`, {
            method: 'DELETE',
            headers: headers
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Delete voucher error:', error);
        throw error;
    }
}

// Spin API Functions
export async function recordSpin(username) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${SPINS_COLLECTION}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                username: username,
                spun_at: new Date().toISOString()
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Record spin error:', error);
        throw error;
    }
}

export async function getLastSpin(username) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${SPINS_COLLECTION}?q={"username":"${username}"}&sort=-spun_at&max=1`, {
            method: 'GET',
            headers: headers
        });
        const spins = await handleResponse(response);
        return spins.length > 0 ? spins[0] : null;
    } catch (error) {
        console.error('Get last spin error:', error);
        throw error;
    }
}

// Feedback API Functions
export async function submitFeedback(feedbackData) {
    try {
        const response = await fetch(`${RESTDB_URL}/rest/${FEEDBACK_COLLECTION}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                name: feedbackData.name,
                email: feedbackData.email,
                message: feedbackData.message,
                submitted_at: new Date().toISOString()
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Submit feedback error:', error);
        throw error;
    }
}