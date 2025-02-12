// frontend/public/js/forgot-password.js
import { api } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');

  forgotPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;

    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.status === 200) {
        successMessage.textContent = response.data.message;
        errorMessage.textContent = ''; // Clear any previous errors
        forgotPasswordForm.reset();
      } else {
        errorMessage.textContent = response.data.message;
        successMessage.textContent = '';
      }

    } catch (error) {
      console.error('Error requesting password reset:', error);
      errorMessage.textContent = 'An unexpected error occurred.';
      successMessage.textContent = '';
    }
  });
});