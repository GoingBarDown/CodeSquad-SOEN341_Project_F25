// --- 1. Function to handle tab clicks ---
function switchTab(event) {
    // 1. Get all navigation tabs
    const tabs = document.querySelectorAll('.nav-tab');
    
    // 2. Remove the 'active' class from all tabs
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // 3. Add the 'active' class to the tab that was clicked (event.currentTarget)
    event.currentTarget.classList.add('active');

    // 4. Determine which tab was clicked by getting its text content
    const tabName = event.currentTarget.textContent.trim().toUpperCase();

    // 5. Update the content view based on the clicked tab (Content switching logic goes here)
    const contentView = document.querySelector('.content-view');
    
    // Simple placeholder to show the tab switched successfully
    contentView.innerHTML = `
        <div style="padding: 20px;">
            <h2>${tabName} Dashboard View</h2>
            <p>Content for the **${tabName}** administration area will be loaded here.</p>
        </div>
    `;

    // In a real application, you would call a function here to fetch and display 
    // the specific HTML/data for Events, Users, or Organizers.
}


// --- 2. Event Listener Setup (Runs when the page finishes loading) ---
document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with the class 'nav-tab'
    const navTabs = document.querySelectorAll('.nav-tab');

    // Loop through each tab and attach the click function
    navTabs.forEach(tab => {
        tab.addEventListener('click', switchTab);
    });
    
    // Optional: Log a message to the console to confirm the script is running
    console.log("Admin Dashboard Script Loaded.");
});

// --- 3. Filtering Logic for Events Tab ---

// This function will be called whenever a filter or search field changes
function applyFilters() {
    // Get the values from the search and filter dropdowns
    const searchTerm = document.getElementById('main-search').value.toLowerCase();
    const year = document.getElementById('filter-year').value;
    const semester = document.getElementById('filter-semester').value;
    const association = document.getElementById('filter-association').value;

    // Get the currently active status filter (Active, Pending, or Past)
    const activeStatusButton = document.querySelector('.status-filter.active-status');
    const status = activeStatusButton ? activeStatusButton.dataset.status : 'all';

    // Log the current filter values (replace with actual filtering code later)
    console.log("--- Current Filters ---");
    console.log(`Search: ${searchTerm}`);
    console.log(`Year: ${year}`);
    console.log(`Semester: ${semester}`);
    console.log(`Association: ${association}`);
    console.log(`Status: ${status}`);
    console.log("-----------------------");

    // In a production app, you would now use these variables to filter
    // the list of events in the #event-list-container.
}

// --- 4. Function to handle Status button clicks (Active/Pending/Past) ---
function handleStatusClick(event) {
    // Remove the 'active-status' class from all buttons
    const statusButtons = document.querySelectorAll('.status-filter');
    statusButtons.forEach(button => {
        button.classList.remove('active-status');
    });

    // Add the 'active-status' class to the clicked button
    event.currentTarget.classList.add('active-status');
    
    // Apply the filters to update the event list
    applyFilters();
}


// --- 5. Attach Event Listeners to New Filters ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (Your existing code for tab switching is here) ...

    // Attach listeners to search and dropdowns
    document.getElementById('main-search').addEventListener('input', applyFilters);
    document.getElementById('filter-year').addEventListener('change', applyFilters);
    document.getElementById('filter-semester').addEventListener('change', applyFilters);
    document.getElementById('filter-association').addEventListener('change', applyFilters);

    // Attach listeners to the status buttons
    const statusButtons = document.querySelectorAll('.status-filter');
    statusButtons.forEach(button => {
        button.addEventListener('click', handleStatusClick);
    });
    
    // Initial call to set the console log and ensure everything is applied
    applyFilters();
});

// --- 6. Hamburger Menu Toggle Logic ---

function toggleMenu() {
    const userMenu = document.getElementById('user-menu');
    // Toggle the 'visible' class to show or hide the menu
    userMenu.classList.toggle('visible'); 
}

// Add event listener inside the main DOMContentLoaded block
document.addEventListener('DOMContentLoaded', () => {
    // ... (Existing code for tab switching and filtering) ...

    // Attach listener to the hamburger icon
    const hamburgerIcon = document.getElementById('hamburger-icon');
    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', toggleMenu);
    }

    // Optional: Close the menu when clicking anywhere else on the page
    document.addEventListener('click', (event) => {
        const menuContainer = document.querySelector('.menu-container');
        const userMenu = document.getElementById('user-menu');

        // Check if the click occurred outside the menu container
        if (userMenu.classList.contains('visible') && !menuContainer.contains(event.target)) {
            userMenu.classList.remove('visible');
        }
    });
    
    // ... (Closing curly brace for DOMContentLoaded) ...
});
