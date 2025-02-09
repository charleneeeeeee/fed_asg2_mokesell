import { submitFeedback } from './api.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');

    feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const feedbackData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        try {
            await submitFeedback(feedbackData);
            
            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();

            // Clear form
            feedbackForm.reset();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            showToast('Failed to submit feedback. Please try again.', 'error');
        }
    });
});