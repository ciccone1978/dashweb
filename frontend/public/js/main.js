import { fetchWithAuth } from './utils/api.js';

document.addEventListener("DOMContentLoaded", function () {
  const userInfo = document.getElementById("user-info");
  const usernameSpan = document.getElementById("username");
  const logoutButton = document.getElementById('logout-button');
  
  // Function to check if the user is logged in
  async function checkLoginStatus() {
    try {
        const response = await fetchWithAuth('/api/user', {
            method: 'GET', // Use GET to fetch user info
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            usernameSpan.textContent = `Welcome, ${data.username}!`;
            logoutButton.style.display = 'block'; // Show logout button
        } else {
             // If unauthorized (401), redirect to login
            if (response.status === 401) {
              window.location.href = '/auth/login';
            } 
            /*else {
              console.error('Error fetching user data:', response.status);
              //window.location.href = '/auth/login';
            }*/
         }
    } catch (error) {
        console.error('Error checking login status:', error);
        window.location.href = '/auth/login';
    }
} 

// Handle logout button click
logoutButton.addEventListener('click', async () => {
  try {
      const response = await fetchWithAuth('/auth/logout', {
          method: 'GET', // Use get method
      });

      if (response.ok) {
          // Redirect to the login page after successful logout
          window.location.href = '/auth/login';
      } else {
          const data = await response.json();
          console.error('Logout failed:', data.message);
      }
  } catch (error) {
      console.error('Error during logout:', error);
  }
});

// Check login status when the page loads
checkLoginStatus();
});