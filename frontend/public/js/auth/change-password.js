// frontend/public/js/change-password.js
import { api } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('change-password-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    changePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            errorMessage.textContent = 'New passwords do not match.';
            return;
        }

        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword,
            });

            if (response.status === 200) {
                successMessage.textContent = response.data.message;
                errorMessage.textContent = '';
                changePasswordForm.reset();
            } else {
                errorMessage.textContent = response.data.message;
                successMessage.textContent = '';
            }
        } catch (error) {
            console.error('Error changing password:', error);
            errorMessage.textContent = 'An unexpected error occurred.';
            successMessage.textContent = '';
        }
    });
});