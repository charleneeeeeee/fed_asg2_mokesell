import { registerUser, checkEmailExists, checkUsernameExists } from './api.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading animation
        document.getElementById('loadingAnimation').style.display = 'block';
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            // Basic validation
            if (!username || !email || !password || !confirmPassword) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters long', 'error');
                return;
            }

            // Check if username exists
            const usernameExists = await checkUsernameExists(username);
            if (usernameExists) {
                showToast('Username already taken', 'error');
                return;
            }

            // Check if email exists
            const emailExists = await checkEmailExists(email);
            if (emailExists) {
                showToast('Email already registered', 'error');
                return;
            }

            // Register user
            const userData = {
                username,
                email,
                password
            };

            const newUser = await registerUser(userData);
            
            if (newUser) {
                showToast('Registration successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Registration failed. Please try again.', 'error');
        } finally {
            // Hide loading animation
            document.getElementById('loadingAnimation').style.display = 'none';
        }
    });
});