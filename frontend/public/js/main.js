import { api } from './utils/api.js';

document.addEventListener("DOMContentLoaded", function () {
    const username = document.getElementById("username");
    const logoutButton = document.getElementById('logout-button');
  
    // --- Function to check if the user is logged in and fetch user data ---
    async function checkLoginStatus() {
        try {
            const response = await api.get('/api/user'); // Use the Axios instance

            if (response.status === 200) {
                const data = response.data; // Axios automatically parses JSON
                username.textContent = data.username;
                logoutButton.style.display = 'block';
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            // No need to redirect here, the interceptor handles it
        }
    }

    // --- Handle logout button click ---
    logoutButton.addEventListener('click', async () => {
        try {
            const response = await api.get('/auth/logout'); // Use the Axios instance

            if (response.status === 200) {
                window.location.href = '/auth/login';
            } else {
                console.error('Logout failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    });

    // Check login status when the page loads
    checkLoginStatus();
});