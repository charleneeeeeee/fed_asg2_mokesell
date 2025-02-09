import { updateUser, checkEmailExists, checkUsernameExists } from './api.js';
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

    // Populate form with current user data
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;

    // Handle form submission
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        try {
            // Show loading animation
            document.getElementById('loadingAnimation').style.display = 'block';

            // Basic validation
            if (!username || !email) {
                showToast('Username and email are required', 'error');
                return;
            }

            // Validate username and email changes
            if (username !== user.username) {
                const usernameExists = await checkUsernameExists(username, user._id);
                if (usernameExists) {
                    showToast('Username already taken', 'error');
                    return;
                }
            }

            if (email !== user.email) {
                const emailExists = await checkEmailExists(email, user._id);
                if (emailExists) {
                    showToast('Email already registered', 'error');
                    return;
                }
            }

            // Validate password change
            if (newPassword || confirmNewPassword || currentPassword) {
                if (!currentPassword) {
                    showToast('Please enter your current password', 'error');
                    return;
                }
                if (currentPassword !== user.password) {
                    showToast('Current password is incorrect', 'error');
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    showToast('New passwords do not match', 'error');
                    return;
                }
                if (newPassword.length < 6) {
                    showToast('New password must be at least 6 characters', 'error');
                    return;
                }
            }

            // Prepare update data
            const updateData = {
                username,
                email,
                password: newPassword || user.password
            };

            // Update user
            const updatedUser = await updateUser(user._id, updateData);
            
            if (updatedUser) {
                // Update local storage
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';

                showToast('Profile updated successfully!', 'success');
                
                // Update navigation to show new username
                updateNavigation();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile. Please try again.', 'error');
        } finally {
            // Hide loading animation
            document.getElementById('loadingAnimation').style.display = 'none';
        }
    });
});