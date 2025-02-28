// navbar.js
import { api } from './utils/api.js';

document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.querySelector("#navbar-container");
    if (navbarContainer) {
        api.get('/views/partials/navbar.html')
            .then(response => {
                navbarContainer.innerHTML = response.data
                attachLogoutEvent();
                loadUserData();
            })
            .catch(error => {
                console.error('Error loading navbar:', error);
            });
    }
   
    // --- Handle logout button click ---
    function attachLogoutEvent() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    const response = await api.get('/auth/logout');
        
                    if (response.status === 200) {
                        window.location.href = '/auth/login';
                    } else {
                        console.error('Logout failed:', response.data.message);
                    }
                } catch (error) {
                    console.error('Error during logout:', error);
                }
            });   
        }
    }

    //
    // --- Fetch Username ---
    async function loadUserData() {
        try {
            const username = document.getElementById("username");
            const logoutButton = document.getElementById('logout-button');
            // Fetch user data
            const userResponse = await api.get('/api/user');

            if (userResponse.status === 200) {
                const userData = userResponse.data;
                username.textContent = userData.username;
                logoutButton.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
             if (error.response && error.response.status === 401) {
                 window.location.href = '/auth/login'; //redirect if error 401
            }
        }
    }


  });