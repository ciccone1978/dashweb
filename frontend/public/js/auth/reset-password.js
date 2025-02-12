// frontend/public/js/reset-password.js
import { api } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // --- Get the token from the URL query parameters ---
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        errorMessage.textContent = 'Invalid reset link.  Please request a new link.';
        resetPasswordForm.style.display = 'none'; // Hide the form
        return; // Stop execution
    }

    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            return;
        }
        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword,
            });

            if (response.status === 200) {
                successMessage.textContent = response.data.message;
                errorMessage.textContent = '';
                resetPasswordForm.reset();

            } else {
                errorMessage.textContent = response.data.message;
                successMessage.textContent = ''
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            errorMessage.textContent = 'An unexpected error occurred.';
            successMessage.textContent = ''
        }
    });
});