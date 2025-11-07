// Render events as cards
function renderEvents(eventArray) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    eventsList.innerHTML = eventArray.length === 0 
        ? "<p>No events found.</p>" 
        : eventArray.map(event => `
            <div class="eventCard">
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p><strong>Date:</strong> ${new Date(event.start_date).toLocaleDateString()}</p>
                    <p><strong>Category:</strong> ${event.category || 'N/A'}</p>
                    <p><strong>Capacity:</strong> ${event.capacity || 'Unlimited'}</p>
                </div>
                <div class="event-actions">
                    <button class="btn-view" onclick="viewDetails(${event.id})">View Details</button>
                    <button class="btn-edit" onclick="editEvent(${event.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteEvent(${event.id})">Delete</button>
                </div>
            </div>
        `).join('');
}

// Store all events for filtering
let allEvents = [];

// Load events from backend
function loadEvents() {
    API.getEvents()
        .then(data => {
            allEvents = Array.isArray(data) ? data : [];
            renderEvents(allEvents);
        })
        .catch(err => {
            console.error('Failed to fetch events:', err);
            allEvents = [];
            renderEvents([]);
        });
}

// View event details
function viewDetails(id) {
    API.getEvent(id)
        .then(event => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>${event.title}</h2>
                    <p><strong>Start:</strong> ${new Date(event.start_date).toLocaleString()}</p>
                    <p><strong>End:</strong> ${new Date(event.end_date).toLocaleString()}</p>
                    <p><strong>Category:</strong> ${event.category || 'N/A'}</p>
                    <p><strong>Capacity:</strong> ${event.capacity || 'Unlimited'}</p>
                    <p><strong>Price:</strong> $${event.price || '0'}</p>
                    <p><strong>Description:</strong> ${event.description || 'No description available.'}</p>
                    <button class="btn-close">Close</button>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.btn-close').addEventListener('click', () => modal.remove());
        })
        .catch(err => alert('Failed to load event details'));
}

// Delete event
function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        API.deleteEvent(id)
            .then(() => {
                loadEvents(); // Refresh the list
                alert('Event deleted successfully');
            })
            .catch(err => alert('Failed to delete event'));
    }
}

// Edit event
function editEvent(id) {
    window.location.href = `manage-events.html?id=${id}`;
}

// Search and filter function
function filterEvents() {
    const searchInput = document.getElementById('search');
    const filterCategory = document.getElementById('filterCategory');
    
    const searchVal = searchInput?.value.toLowerCase() || "";
    const categoryVal = filterCategory?.value || "";
    
    const filtered = allEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchVal);
        const matchesCategory = !categoryVal || event.category === categoryVal;
        return matchesSearch && matchesCategory;
    });
    
    renderEvents(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle
    const dot = document.getElementById('dot');
    if (dot) {
        dot.addEventListener('click', () => {
            const menu = document.getElementById('menu');
            if (menu) menu.classList.toggle('open');
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = 'organizer-login.html';
        });
    }

    // Setup search and filter listeners
    const searchInput = document.getElementById('search');
    const filterCategory = document.getElementById('filterCategory');
    
    if (searchInput) searchInput.addEventListener('input', filterEvents);
    if (filterCategory) filterCategory.addEventListener('change', filterEvents);

    // Load initial events
    loadEvents();
});