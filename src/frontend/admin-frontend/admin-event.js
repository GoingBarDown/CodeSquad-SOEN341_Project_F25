
// --- 0. Global Data Store and Mock Data ---
let allEvents = [];

// --- Mock Data (Temporary until API integration) ---
const mockEvents = [
    { id: 1, title: "Annual Tech Fair 2025", date: "2025-03-15", semester: "winter", year: "2025", association: "SA - Tech Club", status: "Active", attendees: 550, ticketPrice: 15.00, organizer: "Innovate Solutions", location: "Main Auditorium", details: "A day dedicated to new technologies and student innovations." },
    { id: 2, title: "Winter Hackathon", date: "2024-12-05", semester: "fall", year: "2024", association: "SA - Business Guild", status: "Pending", attendees: 120, ticketPrice: 0.00, organizer: "Business Minds Co.", location: "Innovation Lab", details: "A 48-hour coding challenge focused on sustainable business models." },
    { id: 3, title: "Spring Gala", date: "2023-05-20", semester: "summer", year: "2023", association: "SA - Arts Society", status: "Past", attendees: 300, ticketPrice: 35.00, organizer: "Creative Collective", location: "Grand Ballroom", details: "Annual celebratory event with music and art showcases." }
];


// --- 1. Event Fetching (API Integration Point) ---
async function fetchAllEvents() {
    try {
        // !!!!!!! FUTURE BACKEND INTEGRATION POINT: Replace with the actual API call
        // const response = await fetch('/api/admin/events');
        // allEvents = await response.json();

        await new Promise(resolve => setTimeout(resolve, 50));
        allEvents = mockEvents;

        // Display the list and details
        applyFilters();
    } catch (error) {
        console.error("Could not fetch events:", error);
        const container = document.getElementById('event-list-container');
        if (container) {
            container.innerHTML = '<div style="padding: 15px; color: red;">Error loading events.</div>';
        }
    }
}

// --- 2. Rendering Events and Details ---
function renderEventList(eventsToDisplay) {
    const container = document.getElementById('event-list-container');
    const contentView = document.querySelector('.content-view');
    if (!container || !contentView) return;

    container.innerHTML = '';
    contentView.innerHTML = '<p class="placeholder-text">Select an event to view details.</p>';

    if (eventsToDisplay.length === 0) {
        container.innerHTML = '<div class="no-results">No events match the current filter.</div>';
        return;
    }

    eventsToDisplay.forEach((event, index) => {
        const item = document.createElement('div');
        item.classList.add('event-list-item');
        item.setAttribute('data-event-id', event.id);
        item.innerHTML = `<strong>${event.title}</strong><br><small>Status: ${event.status} | ${event.date}</small>`;

        item.addEventListener('click', loadEventDetails);
        container.appendChild(item);

        // Automatically load details for the first event
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
            <div class="event-info-card">
                <div class="info-header">
                    <h2>${eventData.title}</h2>
                    <span class="status-tag status-${eventData.status.toLowerCase()}">${eventData.status.toUpperCase()}</span>
                </div>
                <hr>
                <div class="info-details">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${eventData.date}</div>
                    <div class="info-label">Location:</div>
                    <div class="info-value">${eventData.location}</div>
                    <div class="info-label">Organizer:</div>
                    <div class="info-value">${eventData.organizer}</div>
                    <div class="info-label">Attendees:</div>
                    <div class="info-value">${eventData.attendees}</div>
                    <div class="info-label">Ticket Price:</div>
                    <div class="info-value">$${eventData.ticketPrice.toFixed(2)}</div>
                    <div class="info-label">Association:</div>
                    <div class="info-value">${eventData.association}</div>
                </div>
                
                <h4>Description:</h4>
                <p>${eventData.details}</p>

                <div class="admin-actions">
                    ${moderationButtons}
                    <button class="event-action-button btn-edit">Edit Details</button>
                    <button class="event-action-button btn-delete">Delete Event</button>
                </div>
            </div>
        `;
    }
}


// --- 3. Event Status Update (Approve / Deny) ---
async function changeEventStatus(eventId, newStatus) {
    // 💡 FUTURE BACKEND INTEGRATION POINT: API call to update status
    
    const eventIndex = allEvents.findIndex(e => e.id === eventId);
    if (eventIndex > -1) {
        allEvents[eventIndex].status = newStatus;
        console.log(`Event ID ${eventId} updated to: ${newStatus}`);
        alert(`Event "${allEvents[eventIndex].title}" has been ${newStatus.toLowerCase()}.`);

        applyFilters(); 
        const updatedItem = document.querySelector(`[data-event-id="${eventId}"]`);
        if (updatedItem) loadEventDetails({ currentTarget: updatedItem });
    }
}


// --- 4. Filtering Logic ---
function applyFilters() {
    // ... (Your filtering logic is correct and remains here) ...
    const searchTerm = document.getElementById('main-search')?.value.toLowerCase() || '';
    const year = document.getElementById('filter-year')?.value || '';
    const semester = document.getElementById('filter-semester')?.value || '';
    const association = document.getElementById('filter-association')?.value || '';
    const status = document.getElementById('filter-buttons')?.value.toLowerCase() || '';

    if (allEvents.length === 0) {
      renderEventList([]);
      return;
    }

    const filtered = allEvents.filter(event => {
        const matchSearch = event.title.toLowerCase().includes(searchTerm) || event.organizer.toLowerCase().includes(searchTerm) || event.details.toLowerCase().includes(searchTerm);
        const matchYear = !year || event.year === year;
        const matchSemester = !semester || event.semester === semester;
        const matchAssoc = !association || event.association === association;
        const matchStatus = !status || event.status.toLowerCase() === status;

        return matchSearch && matchYear && matchSemester && matchAssoc && matchStatus;
    });

    renderEventList(filtered);
    console.log(`Filters applied: showing ${filtered.length} events.`);
}


// --- 5. Event Listener Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the event data
    fetchAllEvents();

    // Filters event listeners
    document.getElementById('main-search')?.addEventListener('input', applyFilters);
    document.getElementById('filter-year')?.addEventListener('change', applyFilters);
    document.getElementById('filter-semester')?.addEventListener('change', applyFilters);
    document.getElementById('filter-association')?.addEventListener('change', applyFilters);
    document.getElementById('filter-buttons')?.addEventListener('change', applyFilters);

    console.log("Admin Event Script Loaded.");
});
