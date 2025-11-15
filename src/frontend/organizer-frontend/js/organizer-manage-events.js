/* global API */

// === AUTHENTICATION CHECK ===
function checkOrganizerAccess() {
    const userData = localStorage.getItem('userData');

    if (!userData) {
        alert('❌ Please login first');
        window.location.href = 'organizer-login.html';
        return false;
    }

    try {
        const user = JSON.parse(userData);

        if (user.role !== 'organizer') {
            alert('❌ You do not have permission to access this page. Only organizers can access this area.');
            window.location.href = '../student-frontend/index.html';
            return false;
        }

        return true;
    } catch (e) {
        console.error('Error checking organizer access:', e);
        localStorage.clear();
        window.location.href = 'organizer-login.html';
        return false;
    }
}

// Check access before loading page
if (!checkOrganizerAccess()) {
    throw new Error('Access denied');
}

// Handle login/logout button in old header menu
document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.querySelector('a[href="organizer-login.html"]');
    const userData = localStorage.getItem('userData');

    if (loginLink) {
        if (userData) {
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('userData');
                localStorage.removeItem('authToken');
                window.location.href = 'organizer-login.html';
            };
        } else {
            loginLink.textContent = 'Login';
            loginLink.href = 'organizer-login.html';
        }
    }
});


// ✅ NEW MENU TOGGLE + LOGOUT (correct version)
document.addEventListener('DOMContentLoaded', () => {
    const dot = document.getElementById('dot');
    const menu = document.getElementById('menu');
    const logoutBtn = document.getElementById('logout-btn-organizer');

    // Toggle dropdown menu
    if (dot && menu) {
        dot.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
    }

    // Logout inside the new dropdown
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            localStorage.removeItem('role');
            localStorage.removeItem('loggedInUser');

            // Redirect to homepage
            window.location.href = '../student-frontend/index.html';
        });
    }
});


// ===== EVENTS LOADING, FILTERING, EDITING, DELETING ===== //

let events = [];

// Render events list
function renderEvents(eventArray) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;

    eventsList.innerHTML =
        eventArray.length === 0
            ? "<p>No events found.</p>"
            : eventArray
                  .map((event) => {
                      const status = event.status || 'draft';
                      const statusDisplay =
                          status.charAt(0).toUpperCase() + status.slice(1);
                      const statusClass = `status-${status.toLowerCase()}`;

                      return `
                <div class="eventCard">
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <span class="event-status ${statusClass}">${statusDisplay}</span>
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
            `;
                  })
                  .join('');
}

// Load events from backend
function loadEvents() {
    const userData = localStorage.getItem('userData');
    let currentOrganzerId = null;

    if (userData) {
        try {
            const user = JSON.parse(userData);
            currentOrganzerId = user.id;
        } catch (e) {
            console.error('Error getting organizer ID:', e);
        }
    }

    API.getEvents()
        .then((data) => {
            const allEvents = Array.isArray(data) ? data : [];
            events = allEvents.filter((event) => {
                if (event.organizer_id === currentOrganzerId) return true;

                if (event.organization_id && userData) {
                    try {
                        const user = JSON.parse(userData);
                        if (user.organization_id === event.organization_id)
                            return true;
                    } catch (e) {
                        console.error('Error checking organization:', e);
                    }
                }
                return false;
            });

            renderEvents(events);
        })
        .catch((err) => {
            console.error('Failed to fetch events:', err);
            renderEvents([]);
        });
}

// Search + filter
const searchInput = document.getElementById('search');
const filterCategory = document.getElementById('filterCategory');
if (searchInput) searchInput.addEventListener('input', filterEvents);
if (filterCategory) filterCategory.addEventListener('change', filterEvents);

function filterEvents() {
    const searchVal = searchInput?.value.toLowerCase() || '';
    const categoryVal = filterCategory?.value || '';

    const filtered = events.filter((event) => {
        const matchesSearch = event.title
            .toLowerCase()
            .includes(searchVal);
        const matchesCategory =
            !categoryVal || event.category === categoryVal;
        return matchesSearch && matchesCategory;
    });

    renderEvents(filtered);
}

// View details
function viewDetails(id) {
    API.getEvent(id)
        .then((event) => {
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
                    <p><strong>Description:</strong> ${
                        event.description || 'No description available.'
                    }</p>
                    <button class="btn-close">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
            modal
                .querySelector('.btn-close')
                .addEventListener('click', () => modal.remove());
        })
        .catch(() => alert('Failed to load event details'));
}

// Delete
function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        API.deleteEvent(id)
            .then(() => {
                alert('Event deleted successfully');
                loadEvents();
            })
            .catch(() => alert('Failed to delete event'));
    }
}

// Edit event
function editEvent(id) {
    API.getEvent(id)
        .then((event) => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');

            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Edit Event</h2>
                    <form id="editForm">
                        <label for="editTitle">Event Title</label>
                        <input type="text" id="editTitle" value="${event.title}" required />

                        <label for="editStartDate">Start Date & Time</label>
                        <input type="datetime-local" id="editStartDate"
                            value="${new Date(event.start_date).toISOString().slice(0, 16)}" required />

                        <label for="editEndDate">End Date & Time</label>
                        <input type="datetime-local" id="editEndDate"
                            value="${new Date(event.end_date).toISOString().slice(0, 16)}" required />

                        <label for="editCategory">Category</label>
                        <select id="editCategory" required>
                            <option value="">Select category</option>
                            <option value="Workshop" ${
                                event.category === 'Workshop' ? 'selected' : ''
                            }>Workshop</option>
                            <option value="Lecture" ${
                                event.category === 'Lecture' ? 'selected' : ''
                            }>Lecture</option>
                            <option value="Social" ${
                                event.category === 'Social' ? 'selected' : ''
                            }>Social</option>
                            <option value="Competition" ${
                                event.category === 'Competition'
                                    ? 'selected'
                                    : ''
                            }>Competition</option>
                            <option value="Conference" ${
                                event.category === 'Conference' ? 'selected' : ''
                            }>Conference</option>
                        </select>

                        <label for="editLocation">Location</label>
                        <input type="text" id="editLocation"
                            value="${event.location || ''}" />

                        <label for="editCapacity">Capacity</label>
                        <input type="number" id="editCapacity"
                            value="${event.capacity || ''}" min="1" />

                        <label for="editPrice">Price</label>
                        <input type="number" id="editPrice"
                            value="${event.price || 0}" min="0" step="0.01" />

                        <label for="editDescription">Description</label>
                        <textarea id="editDescription" rows="4">${
                            event.description || ''
                        }</textarea>

                        <div style="display:flex; gap:10px; margin-top:20px;">
                            <button type="submit" class="btn-primary" style="flex:1;">Save Changes</button>
                            <button type="button" class="btn-close" style="flex:1;background:#ccc;color:#222;">Cancel</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Save edits
            modal.querySelector('#editForm').addEventListener('submit', (e) => {
                e.preventDefault();

                const updatedEvent = {
                    title: document.getElementById('editTitle').value,
                    start_date: new Date(
                        document.getElementById('editStartDate').value
                    ).toISOString(),
                    end_date: new Date(
                        document.getElementById('editEndDate').value
                    ).toISOString(),
                    category: document.getElementById('editCategory').value,
                    location:
                        document.getElementById('editLocation').value || null,
                    capacity:
                        parseInt(
                            document.getElementById('editCapacity').value
                        ) || null,
                    price:
                        parseFloat(
                            document.getElementById('editPrice').value
                        ) || 0,
                    description:
                        document.getElementById('editDescription').value,
                };

                API.updateEvent(id, updatedEvent)
                    .then(() => {
                        alert('✅ Event updated successfully!');
                        modal.remove();
                        loadEvents();
                    })
                    .catch((err) => {
                        console.error('Update failed:', err);
                        alert(
                            '❌ Failed to update event: ' +
                                (err.message || 'Please try again')
                        );
                    });
            });

            // Close modal
            modal
                .querySelector('.btn-close')
                .addEventListener('click', () => modal.remove());
        })
        .catch(() => alert('Failed to load event details'));
}

// Initial load
document.addEventListener('DOMContentLoaded', loadEvents);
