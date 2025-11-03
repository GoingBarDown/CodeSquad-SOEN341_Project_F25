let events = [];

// Render events list
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

// Load events from backend
function loadEvents() {
    API.getEvents()
        .then(data => {
            events = Array.isArray(data) ? data : [];
            renderEvents(events);
        })
        .catch(err => {
            console.error('Failed to fetch events:', err);
            renderEvents([]);
        });
}

// Search and filter
const searchInput = document.getElementById('search');
const filterCategory = document.getElementById('filterCategory');
if (searchInput) searchInput.addEventListener('input', filterEvents);
if (filterCategory) filterCategory.addEventListener('change', filterEvents);

function filterEvents() {
    const searchVal = searchInput?.value.toLowerCase() || "";
    const categoryVal = filterCategory?.value || "";
    
    const filtered = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchVal);
        const matchesCategory = !categoryVal || event.category === categoryVal;
        return matchesSearch && matchesCategory;
    });
    
    renderEvents(filtered);
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

// Initial load
document.addEventListener('DOMContentLoaded', loadEvents);