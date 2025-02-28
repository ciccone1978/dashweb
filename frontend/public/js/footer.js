// navbar.js
import { api } from './utils/api.js';

document.addEventListener("DOMContentLoaded", function () {
    const footerContainer = document.querySelector("#footer-container");
    if (footerContainer) {
        api.get('/views/partials/footer.html')
            .then(response => {
                footerContainer.innerHTML = response.data
            })
            .catch(error => {
                console.error('Error loading footer:', error);
            });
    }

});