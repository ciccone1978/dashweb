// navbar.js
import { api } from './utils/api.js';

document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.querySelector("#header-container");
    if (headerContainer) {
        api.get('/views/partials/header.html')
            .then(response => {
                headerContainer.innerHTML = response.data
            })
            .catch(error => {
                console.error('Error loading header:', error);
            });
    }

});