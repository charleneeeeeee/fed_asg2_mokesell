import { loginUser } from './api.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        document.getElementById('loadingAnimation').style.display = 'block';
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const user = await loginUser(email, password);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                showToast('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showToast('Invalid email or password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Login failed. Please try again.', 'error');
        } finally {
            document.getElementById('loadingAnimation').style.display = 'none';
        }
    });
});