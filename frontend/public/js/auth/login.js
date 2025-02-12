import { api } from '../utils/api.js'; // Import the Axios instance

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await api.post('/auth/login', { username, password }); // Use api.post

            if (response.status === 200) {
                // Redirect to the homepage on success
                window.location.href = '/';
            } /* else {
                // Handle errors (the interceptor will handle 401s for token refresh)
                errorMessage.textContent = response.data.message;
                //errorMessage.classList.remove("d-none");
                console.log("Login failed (unexpected status):", response.status); // DEBUG
            } */
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
          //console.error('Error during login:', error);
        }
    });
});