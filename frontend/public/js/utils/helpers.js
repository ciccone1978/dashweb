import { api } from '../utils/api.js';

//Basic email validation
function isValidEmailBasic(email) {
    if (!email) {
        return false;
    }
    // Basic regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

//Slicer helper
function loadSlicer(slicer, elementId) {
    api.get(`/api/reports/sales/slicers/${slicer}`)
        .then(response => {
            let select = document.getElementById(elementId);
            select.innerHTML = '<option value="">All</option>';  // Default option

            response.data.forEach(item => {
                let option = document.createElement("option");
                option.value = item.key;
                option.textContent = item.value;
                select.appendChild(option);
            });
        })
        .catch(error => console.error(`Error loading ${slicer} slicer:`, error));
}


export { isValidEmailBasic, loadSlicer }