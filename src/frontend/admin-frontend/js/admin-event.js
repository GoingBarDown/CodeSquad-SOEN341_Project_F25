// --- 0. Global Data Store and Configuration ---
let allEvents = [];


// --- 1. Event Fetching (API Integration Point - GET) ---
async function fetchAllEvents() {
    try {
        allEvents = await ADMIN_API.getEvents();
        applyFilters();
    } catch (error) {
        console.error("Could not fetch events:", error);
        const container = document.getElementById('event-list-container');
        if (container) {
            container.innerHTML = `<div style="padding: 15px; color: red;">Error loading events: ${error.message}</div>`;
        }
    }
}


// --- 2. Rendering Events and Details (No changes needed) ---
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
                <button onclick="changeEventStatus(${eventData.id}, 'Active')" class="event-action-button btn-approve">Approve</button>
                <button onclick="changeEventStatus(${eventData.id}, 'Denied')" class="event-action-button btn-deny">Deny</button>
            `;
        }

        contentView.innerHTML = `
            <div class="info-card">
                <div class="info-header">
                    <h2>${eventData.title}</h2>
                    <button class="edit-btn" onclick="openEditEventModal(${eventData.id})">EDIT</button>
                </div>

                <div class="info-details">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${eventData.date || '—'}</div>

                    <div class="info-label">Location:</div>
                    <div class="info-value">${eventData.location || '—'}</div>

                    <div class="info-label">Organizer:</div>
                    <div class="info-value">${eventData.organizer || '—'}</div>

                    <div class="info-label">Attendees:</div>
                    <div class="info-value">${eventData.attendees || '—'}</div>

                    <div class="info-label">Ticket Price:</div>
                    <div class="info-value">$${eventData.ticketPrice ? eventData.ticketPrice.toFixed(2) : '0.00'}</div>

                    <div class="info-label">Association:</div>
                    <div class="info-value">${eventData.association || '—'}</div>

                    <div class="info-label">Status:</div>
                    <div class="info-value">${eventData.status || '—'}</div>

                    <div class="info-label">Description:</div>
                    <div class="info-value">${eventData.details || '—'}</div>
                </div>

                <div class="info-actions">
                    ${moderationButtons}
                    <button onclick="deleteEvent(${eventData.id})" class="event-action-button btn-delete">Delete Event</button>
                </div>
            </div>
        `;
    }
}


// --- 3. Event Status Update (Handler) ---
async function changeEventStatus(eventId, newStatus) {
    try {
        await ADMIN_API.updateEventStatus(eventId, newStatus);
        
        // Update frontend state
        const eventIndex = allEvents.findIndex(e => e.id === eventId);
        if (eventIndex > -1) {
            allEvents[eventIndex].status = newStatus;
            applyFilters(); 
            const updatedItem = document.querySelector(`[data-event-id="${eventId}"]`);
            if (updatedItem) loadEventDetails({ currentTarget: updatedItem });
        }
        alert(`Event status successfully updated to: ${newStatus}.`);
    } catch (error) {
        console.error("Error updating event status:", error);
        alert(`Failed to save status change. Error: ${error.message}`);
    }
}

// --- 4. Event Deletion (Handler) ---
async function deleteEvent(eventId) {
    console.log('deleteEvent called with eventId:', eventId);
    
    if (!confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) {
        return;
    }
    
    try {
        console.log('Attempting to delete event with ID:', eventId);
        await ADMIN_API.deleteEvent(eventId);
        allEvents = allEvents.filter(event => event.id !== eventId);
        applyFilters(); 
        alert("Event successfully deleted.");
    } catch (error) {
        console.error("Error deleting event:", error);
        alert(`Failed to delete event. Error: ${error.message}`);
    }
}

// --- 4b. Edit Event (Handler - opens modal dialog) ---
function openEditEventModal(eventId) {
    const eventData = allEvents.find(e => e.id === eventId);
    if (!eventData) return;

    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Event: ${eventData.title}</h2>
            <form id="editEventForm">
                <label for="editTitle">Title:</label>
                <input type="text" id="editTitle" value="${eventData.title || ''}" required />

                <label for="editDate">Date:</label>
                <input type="text" id="editDate" value="${eventData.date || ''}" />

                <label for="editLocation">Location:</label>
                <input type="text" id="editLocation" value="${eventData.location || ''}" />

                <label for="editOrganizer">Organizer:</label>
                <input type="text" id="editOrganizer" value="${eventData.organizer || ''}" />

                <label for="editDescription">Description:</label>
                <textarea id="editDescription" rows="4">${eventData.details || ''}</textarea>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" class="btn-primary">Save Changes</button>
                    <button type="button" class="btn-cancel">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    modal.querySelector('#editEventForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            title: document.getElementById('editTitle').value,
            date: document.getElementById('editDate').value,
            location: document.getElementById('editLocation').value,
            organizer: document.getElementById('editOrganizer').value,
            details: document.getElementById('editDescription').value
        };

        try {
            await ADMIN_API.updateEvent(eventId, updatedData);
            alert('✅ Event updated successfully!');
            
            // Update local data
            const eventIndex = allEvents.findIndex(e => e.id === eventId);
            if (eventIndex > -1) {
                allEvents[eventIndex] = { ...allEvents[eventIndex], ...updatedData };
                applyFilters();
                const updatedItem = document.querySelector(`[data-event-id="${eventId}"]`);
                if (updatedItem) loadEventDetails({ currentTarget: updatedItem });
            }
            
            modal.remove();
        } catch (error) {
            console.error('Error updating event:', error);
            alert(`❌ Failed to update event: ${error.message}`);
        }
    });

    // Handle cancel button
    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}


// --- 5. Filtering Logic (No changes needed) ---
function applyFilters() {
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


// --- 6. Event Listener Setup (No changes needed) ---
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
