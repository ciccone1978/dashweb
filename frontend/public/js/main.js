import { api } from './utils/api.js';

document.addEventListener("DOMContentLoaded", function () {
    //const username = document.getElementById("username");
    //const logoutButton = document.getElementById('logout-button');
    const sidebarContainer = document.getElementById("sidebar-container");

    function generateSidebarMenu(menuData) {
      
        // Create the navigation element
        const nav = document.createElement("nav");
        nav.className = "mt-2";
      
        // Create the main unordered list for the menu
        const ul = document.createElement("ul");
        ul.className = "nav nav-pills nav-sidebar flex-column nav-compact";
        ul.setAttribute("data-widget", "treeview");
        ul.setAttribute("role", "menu");
        ul.setAttribute("data-accordion", "false");
        ul.setAttribute("id", "nav_menu");
      
        // Iterate through the menu items in the JSON data
        menuData.menu.forEach((item) => {
          // Create the parent list item (e.g., "Reports" or "Admin")
          const li = document.createElement("li");
          li.className = "nav-item has-treeview";
      
          // Create the anchor tag for the parent menu item
          const a = document.createElement("a");
          a.className = "nav-link";
          a.href = "#"; // Set href to '#' for toggle behavior
      
          // Add the icon and text for the parent menu item
          const icon = document.createElement("i");
          icon.className = `nav-icon ${item.icon}`;
          a.appendChild(icon);
      
          const p = document.createElement("p");
          p.textContent = item.text;
      
          // Add the angle-left icon for expand/collapse functionality
          const angleIcon = document.createElement("i");
          angleIcon.className = "right fas fa-angle-left";
          p.appendChild(angleIcon);
      
          a.appendChild(p);
          li.appendChild(a);
      
          // If the item has children, create the submenu
          if (item.children && item.children.length > 0) {
            const subUl = document.createElement("ul");
            subUl.className = "nav nav-treeview";
      
            item.children.forEach((child) => {
              const subLi = document.createElement("li");
              subLi.className = "nav-item";
      
              const subA = document.createElement("a");
              subA.className = "nav-link";
              subA.href = child.url;
      
              // Add the child icon and text
              const subIcon = document.createElement("i");
              subIcon.className = `nav-icon ${child.icon}`;
              subA.appendChild(subIcon);
      
              const subP = document.createElement("p");
              subP.textContent = child.text;
              subA.appendChild(subP);
      
              subLi.appendChild(subA);
              subUl.appendChild(subLi);
            });
      
            li.appendChild(subUl);
          }
      
          ul.appendChild(li);
        });
      
        // Append the unordered list to the navigation element
        nav.appendChild(ul);

        return nav.outerHTML;
    }
    

    /* // --- Function to check login status and fetch user data & menu ---
    async function loadUserData() {
        try {
            // Fetch user data
            const userResponse = await api.get('/api/user');

            if (userResponse.status === 200) {
                const userData = userResponse.data;
                username.textContent = userData.username;
                logoutButton.style.display = 'block';

                // Fetch menu data
                const menuResponse = await api.get('/api/menu');
                const menuData = menuResponse.data;

                // Generate the sidebar menu
                const sidebarHTML = generateSidebarMenu(menuData);
                sidebarContainer.innerHTML = sidebarHTML;

            }
        } catch (error) {
            console.error('Error loading user data:', error);
             if (error.response && error.response.status === 401) {
                 window.location.href = '/auth/login'; //redirect if error 401
            }
        }
    } */

    // --- Handle logout button click ---
/*     logoutButton.addEventListener('click', async () => {
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
    }); */

    //loadUserData();
});
