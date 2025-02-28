// navbar.js
import { api } from './utils/api.js';

document.addEventListener("DOMContentLoaded", function () {
    const mainSidebarContainer = document.querySelector("#main-sidebar-container");
    if (mainSidebarContainer) {
        api.get('/views/partials/sidebar.html')
            .then(response => {
                mainSidebarContainer.innerHTML = response.data
                //loadUserMenu
            })
            .catch(error => {
                console.error('Error loading sidebar:', error);
            });
    }

});