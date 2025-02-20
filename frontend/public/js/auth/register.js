// frontend/public/js/register.js
import { api } from '../utils/api.js';
import { isValidEmailBasic } from '../utils/helpers.js'


document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;

        // --- Client-side validation ---
        if (!isValidEmailBasic(email)) {
            errorMessage.textContent = 'Invalid email address';
            return; // Stop form submission
        }

        try {
            const response = await api.post('/auth/register', { firstName, lastName, username, email });
            console.log(response.message);

            if (response.status === 201) { // 201 Created
                successMessage.textContent = response.data.message;
                errorMessage.textContent = '';
                registrationForm.reset();
            }
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage.textContent = error.response.data.message;
                errorMessage.classList.remove("d-none");
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage.textContent = 'No response received from the server.';
                errorMessage.classList.remove("d-none");
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage.textContent = 'An unexpected error occurred.';
                errorMessage.classList.remove("d-none");
            }
        }
    });
});