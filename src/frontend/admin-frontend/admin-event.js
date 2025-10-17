// ==========================================================
// admin_events.js
// Merged version — Original structure + new event.js features.
// Ready for backend integration with mock data for front-end testing.
// ==========================================================


// --- 0. Global Data Store and Mock Data ---
let allEvents = [];

// --- Mock Data (Temporary until API integration) ---
const mockEvents = [
    {
        id: 1,
        title: "Annual Tech Fair 2025",
        date: "2025-03-15",
        semester: "spring",
        year: "2025",
        association: "SA - Tech Club",
        status: "Active",
        attendees: 550,
        ticketPrice: 15.00,
        organizer: "Innovate Solutions",
        location: "Main Auditorium",
        details: "A day dedicated to new technologies and student innovations.",
        imageURL: "https://via.placeholder.com/600x300?text=Tech+Fair+Image"
    },
    {
        id: 2,
        title: "Winter Hackathon",
        date: "2024-12-05",
        semester: "fall",
        year: "2024",
        association: "SA - Business Guild",
        status: "Pending",
        attendees: 120,
        ticketPrice: 0.00,
        organizer: "Business Minds Co.",
        location: "Innovation Lab",
        details: "A 48-hour coding challenge focused on sustainable business models.",
        imageURL: "https://via.placeholder.com/600x300?text=Hackathon+Image"
    },
    {
        id: 3,
        title: "Spring Gala",
        date: "2023-05-20",
        semester: "summer",
        year: "2023",
        association: "SA - Arts Society",
        status: "Past",
        attendees: 300,
        ticketPrice: 35.00,
        organizer: "Creative Collective",
        location: "Grand Ballroom",
        details: "Annual celebratory event with music and art showcases.",
        imageURL: "https://via.placeholder.com/600x300?text=Gala+Event+Image"
    }
];


// --- 1. Function to handle tab clicks ---
function switchTab(event) {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const tabName = event.currentTarget.textContent.trim().toUpperCase();
    const contentView = document.querySelector('.content-view');
    const sidePanel = document.querySelector('.side-panel');

    // Only show event panel when "EVENTS" tab is active
    if (tabName === 'EVENTS') {
        sidePanel.style.display = 'block';
        renderEventList(allEvents);
    } else {
        sidePanel.style.display = 'none';
        contentView.innerHTML = `
            <div style="padding: 20px;">
                <h2>${tabName} Dashboard View</h2>
                <p>Content for the **${tabName}** administration area will be loaded here.</p>
            </div>
        `;
    }
}


// --- 2. Event Fetching (API Integration Point) ---
async function fetchAllEvents() {
    try {
        // Replace this with API call later
        // const response = await fetch('/api/admin/events');
        // allEvents = await response.json();

        await new Promise(resolve => setTimeout(resolve, 50));
        allEvents = mockEvents;

        renderEventList(allEvents);
    } catch (error) {
        console.error("Could not fetch events:", error);
        const container = document.getElementById('event-list-container');
        if (container) {
            container.innerHTML = '<div style="padding: 15px; color: red;">Error loading events.</div>';
        }
    }
}


// --- 3. Rendering Events and Details ---
function renderEventList(eventsToDisplay) {
    const container = document.getElementById('event-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (eventsToDisplay.length === 0) {
        container.innerHTML = '<div style="padding: 15px; color: #666;">No events match the current filter.</div>';
        document.querySelector('.content-view').innerHTML = '';
        return;
    }

    eventsToDisplay.forEach((event, index) => {
        const item = document.createElement('div');
        item.classList.add('event-list-item');
        item.setAttribute('data-event-id', event.id);
        item.innerHTML = `<strong>${event.title}</strong><br><small>Status: ${event.status} | ${event.date}</small>`;

        item.addEventListener('click', loadEventDetails);
        container.appendChild(item);

        if (index === 0) {
            item.classList.add('active');
            loadEventDetails({ currentTarget: item });
        }
    });
}


function loadEventDetails(event) {
    document.querySelectorAll('.event-list-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const eventId = parseInt(event.currentTarget.getAttribute('data-event-id'));
    const eventData = allEvents.find(e => e.id === eventId);
    const contentView = document.querySelector('.content-view');

    if (eventData && contentView) {
        let moderationButtons = '';
        if (eventData.status.toLowerCase() === 'pending') {
            moderationButtons = `
                <button onclick="changeEventStatus(${eventData.id}, 'Active')" class="event-action-button btn-approve">✅ Approve</button>
                <button onclick="changeEventStatus(${eventData.id}, 'Denied')" class="event-action-button btn-deny">❌ Deny</button>
            `;
        }

        contentView.innerHTML = `
            <h2>${eventData.title}</h2>
            <p><strong>Organizer:</strong> ${eventData.organizer}</p>
            <p><strong>Status:</strong> ${eventData.status}</p>
            <p><strong>Date:</strong> ${eventData.date}</p>
            <p><strong>Location:</strong> ${eventData.location}</p>
            <p><strong>Attendees:</strong> ${eventData.attendees}</p>
            <p><strong>Ticket Price:</strong> $${eventData.ticketPrice.toFixed(2)}</p>
            <hr>
            <h4>Description:</h4>
            <p>${eventData.details}</p>
            <div class="admin-actions">
                ${moderationButtons}
                <button class="event-action-button btn-edit">Edit Event</button>
                <button class="event-action-button btn-delete">Delete Event</button>
            </div>
        `;
    }
}


// --- 4. Event Status Update (Approve / Deny) ---
async function changeEventStatus(eventId, newStatus) {
    const eventIndex = allEvents.findIndex(e => e.id === eventId);
    if (eventIndex > -1) {
        allEvents[eventIndex].status = newStatus;
        console.log(`Event ID ${eventId} updated to: ${newStatus}`);
        alert(`Event "${allEvents[eventIndex].title}" has been ${newStatus.toLowerCase()}.`);

        renderEventList(allEvents);
        const updatedItem = document.querySelector(`[data-event-id="${eventId}"]`);
        if (updatedItem) loadEventDetails({ currentTarget: updatedItem });
    }
}


// --- 5. Filtering Logic ---
function applyFilters() {
    const searchTerm = document.getElementById('main-search')?.value.toLowerCase() || '';
    const year = document.getElementById('filter-year')?.value || '';
    const semester = document.getElementById('filter-semester')?.value || '';
    const association = document.getElementById('filter-association')?.value || '';
    const status = document.getElementById('filter-buttons')?.value.toLowerCase() || '';

    if (allEvents.length === 0) return;

    const filtered = allEvents.filter(event => {
        const matchSearch = event.title.toLowerCase().includes(searchTerm)
            || event.organizer.toLowerCase().includes(searchTerm)
            || event.details.toLowerCase().includes(searchTerm);
        const matchYear = !year || event.year === year;
        const matchSemester = !semester || event.semester === semester;
        const matchAssoc = !association || event.association === association;
        const matchStatus = !status || event.status.toLowerCase() === status;

        return matchSearch && matchYear && matchSemester && matchAssoc && matchStatus;
    });

    renderEventList(filtered);
    console.log(`Filters applied: showing ${filtered.length} events.`);
}


// --- 6. Hamburger Menu Toggle Logic ---
function toggleMenu() {
    const userMenu = document.getElementById('menu');
    userMenu.classList.toggle('open');
}


// --- 7. Event Listener Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Load mock events
    fetchAllEvents();

    // Navigation tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', switchTab);
    });

    // Filters
    document.getElementById('main-search')?.addEventListener('input', applyFilters);
    document.getElementById('filter-year')?.addEventListener('change', applyFilters);
    document.getElementById('filter-semester')?.addEventListener('change', applyFilters);
    document.getElementById('filter-association')?.addEventListener('change', applyFilters);
    document.getElementById('filter-buttons')?.addEventListener('change', applyFilters);

    // Hamburger menu
    const hamburger = document.getElementById('dot');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    document.addEventListener('click', (event) => {
        const menu = document.getElementById('menu');
        if (menu && menu.classList.contains('open') && !menu.contains(event.target) && event.target.id !== 'dot') {
            menu.classList.remove('open');
        }
    });

    console.log("Admin Dashboard Script Loaded (Merged Version).");
});
