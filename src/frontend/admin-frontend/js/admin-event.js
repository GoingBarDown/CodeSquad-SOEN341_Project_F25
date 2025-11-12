// --- 0. Global Data Store and Configuration ---
let allEvents = [];


// --- 1. Event Fetching (API Integration Point - GET) ---
async function fetchAllEvents() {
    try {
        allEvents = await ADMIN_API.getEvents();
        populateFilterOptions();
        applyFilters();
    } catch (error) {
        console.error("Could not fetch events:", error);
        const container = document.getElementById('event-list-container');
        if (container) {
            container.innerHTML = `<div style="padding: 15px; color: red;">Error loading events: ${error.message}</div>`;
        }
    }
}

// --- 1b. Populate Dynamic Filter Options ---
function populateFilterOptions() {
    // Get unique locations
    const locations = [...new Set(allEvents
        .map(e => e.location)
        .filter(Boolean)
        .filter(loc => loc.trim() !== '')
    )].sort();
    
    const locationSelect = document.getElementById('filter-location');
    if (locationSelect) {
        // Clear existing options except the placeholder
        locationSelect.innerHTML = '<option value="">Location</option>';
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });
        console.log('Populated locations:', locations);
    }

    // Get unique categories
    const categories = [...new Set(allEvents
        .map(e => e.category)
        .filter(Boolean)
        .filter(cat => cat.trim() !== '')
    )].sort();
    
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        console.log('Populated categories:', categories);
    }

    // Get unique organizer IDs and fetch their names
    const organizers = [...new Set(allEvents
        .map(e => e.organizer_id)
        .filter(Boolean)
    )].sort((a, b) => a - b);
    
    const organizerSelect = document.getElementById('filter-organizer');
    if (organizerSelect) {
        organizerSelect.innerHTML = '<option value="">Organizer</option>';
        organizers.forEach(organizerId => {
            // Fetch organizer name
            ADMIN_API.getUserById(organizerId).then(user => {
                const option = document.createElement('option');
                option.value = organizerId;
                option.textContent = user.username || `Organizer ${organizerId}`;
                organizerSelect.appendChild(option);
            }).catch(err => {
                console.log('Could not fetch organizer name for ID:', organizerId, err);
                // Fallback to ID
                const option = document.createElement('option');
                option.value = organizerId;
                option.textContent = `Organizer ${organizerId}`;
                organizerSelect.appendChild(option);
            });
        });
        console.log('Populated organizers:', organizers);
    }
}


// --- 2. Rendering Events and Details (No changes needed) ---
function renderEventList(eventsToDisplay) {
    const container = document.getElementById('event-list-container');
    const contentView = document.querySelector('.content-view');
    const searchTerm = document.getElementById('main-search')?.value || '';
    
    if (!container || !contentView) return;

    container.innerHTML = '';
    contentView.innerHTML = '<p class="placeholder-text">Select an event to view details.</p>';

    if (eventsToDisplay.length === 0) {
        if (searchTerm) {
            container.innerHTML = `
                <div class="no-results">
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">🔍 No events match "${searchTerm}"</div>
                    <div style="font-size: 0.9rem; color: #666; line-height: 1.6;">
                        Try:<br>
                        - Checking your spelling<br>
                        - Using different keywords<br>
                        - <a href="#" onclick="clearEventFilters(); return false;" style="color: rgb(151, 9, 21); font-weight: bold;">Clearing your search</a>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="no-results">
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">📅 No events yet</div>
                    <div style="font-size: 0.9rem; color: #666;">Get started by creating your first event!</div>
                </div>
            `;
        }
        return;
    }

    eventsToDisplay.forEach((event, index) => {
        const item = document.createElement('div');
        item.classList.add('event-list-item');
        item.setAttribute('data-event-id', event.id);
        item.innerHTML = `<strong>${event.title}</strong><br><small>Status: ${event.status} | ${event.start_date || 'No date'}</small>`;

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
        // Fetch organizer name if organizer_id exists
        let organizerDisplay = '—';
        if (eventData.organizer_id) {
            ADMIN_API.getUserById(eventData.organizer_id).then(user => {
                organizerDisplay = user.username || `Organizer ID: ${eventData.organizer_id}`;
                // Update the organizer field in the already-rendered card
                const organizerField = contentView.querySelector('[data-field="organizer"]');
                if (organizerField) {
                    organizerField.textContent = organizerDisplay;
                }
            }).catch(err => {
                console.log('Could not fetch organizer name:', err);
            });
        }

        // Fetch attendance data
        ADMIN_API.getEventAttendance(eventData.id).then(attendance => {
            const attendanceDisplay = `${attendance.checked_in} / ${attendance.registered}`;
            const attendeesField = contentView.querySelector('[data-field="attendees"]');
            if (attendeesField) {
                attendeesField.textContent = attendanceDisplay;
            }
        }).catch(err => {
            console.log('Could not fetch attendance data:', err);
            const attendeesField = contentView.querySelector('[data-field="attendees"]');
            if (attendeesField) {
                attendeesField.textContent = '—';
            }
        });

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
                </div>

                <div class="info-details">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${eventData.start_date ? new Date(eventData.start_date).toLocaleDateString() : '—'}</div>

                    <div class="info-label">Time:</div>
                    <div class="info-value">${eventData.start_date ? new Date(eventData.start_date).toLocaleTimeString() : '—'}</div>

                    <div class="info-label">Location:</div>
                    <div class="info-value">${eventData.location || '—'}</div>

                    <div class="info-label">Organizer:</div>
                    <div class="info-value" data-field="organizer">${organizerDisplay}</div>

                    <div class="info-label">Attendees:</div>
                    <div class="info-value" data-field="attendees">Loading...</div>

                    <div class="info-label">Ticket Price:</div>
                    <div class="info-value">$${eventData.price ? eventData.price.toFixed(2) : '0.00'}</div>

                    <div class="info-label">Association:</div>
                    <div class="info-value">${eventData.association || 'N/A'}</div>

                    <div class="info-label">Status:</div>
                    <div class="info-value">${eventData.status || '—'}</div>

                    <div class="info-label">Description:</div>
                    <div class="info-value">${eventData.description || '—'}</div>
                </div>

                <div class="info-actions">
                    ${moderationButtons}
                    <button onclick="openEditEventModal(${eventData.id})" class="event-action-button btn-edit">Edit Event</button>
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

                <label for="editLocation">Location:</label>
                <input type="text" id="editLocation" value="${eventData.location || ''}" />

                <label for="editCategory">Category:</label>
                <input type="text" id="editCategory" value="${eventData.category || ''}" />

                <label for="editPrice">Price ($):</label>
                <input type="number" id="editPrice" step="0.01" value="${eventData.price || '0'}" />

                <label for="editCapacity">Capacity:</label>
                <input type="number" id="editCapacity" value="${eventData.capacity || ''}" />

                <label for="editDescription">Description:</label>
                <textarea id="editDescription" rows="4">${eventData.description || ''}</textarea>

                <label for="editStatus">Status:</label>
                <select id="editStatus">
                    <option value="active" ${eventData.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="pending" ${eventData.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="past" ${eventData.status === 'past' ? 'selected' : ''}>Past</option>
                    <option value="cancelled" ${eventData.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>

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
        
        const title = document.getElementById('editTitle').value.trim();
        
        // Validation
        if (!title) {
            alert('❌ Event title cannot be empty');
            return;
        }
        
        const updatedData = {
            title,
            location: document.getElementById('editLocation').value.trim(),
            category: document.getElementById('editCategory').value.trim(),
            price: parseFloat(document.getElementById('editPrice').value) || 0,
            capacity: parseInt(document.getElementById('editCapacity').value) || null,
            description: document.getElementById('editDescription').value.trim(),
            status: document.getElementById('editStatus').value
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


// --- 5. Filtering Logic ---
function applyFilters() {
    const searchTerm = document.getElementById('main-search')?.value.toLowerCase() || '';
    const location = document.getElementById('filter-location')?.value || '';
    const category = document.getElementById('filter-category')?.value || '';
    const organizerId = document.getElementById('filter-organizer')?.value || '';
    const status = document.getElementById('filter-buttons')?.value.toLowerCase() || '';

    if (allEvents.length === 0) {
      renderEventList([]);
      return;
    }

    const filtered = allEvents.filter(event => {
        const matchSearch = !searchTerm || 
          event.title.toLowerCase().includes(searchTerm) || 
          event.organizer_id?.toString().includes(searchTerm) || 
          event.details?.toLowerCase().includes(searchTerm);
        const matchLocation = !location || event.location === location;
        const matchCategory = !category || event.category === category;
        const matchOrganizer = !organizerId || event.organizer_id?.toString() === organizerId;
        const matchStatus = !status || event.status.toLowerCase() === status;

        return matchSearch && matchLocation && matchCategory && matchOrganizer && matchStatus;
    });

    renderEventList(filtered);
    console.log(`Filters applied: showing ${filtered.length} events.`);
}


// --- 6. Event Listener Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the event data
    fetchAllEvents();

    // Filters event listeners
    document.getElementById('main-search')?.addEventListener('input', applyFilters);
    document.getElementById('filter-location')?.addEventListener('change', applyFilters);
    document.getElementById('filter-category')?.addEventListener('change', applyFilters);
    document.getElementById('filter-organizer')?.addEventListener('change', applyFilters);
    document.getElementById('filter-buttons')?.addEventListener('change', applyFilters);

    console.log("Admin Event Script Loaded.");
});

function clearEventFilters() {
  document.getElementById('main-search').value = '';
  document.getElementById('filter-location').value = '';
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-organizer').value = '';
  document.getElementById('filter-buttons').value = '';
  applyFilters();
}
