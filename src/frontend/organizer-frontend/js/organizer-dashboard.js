// === AUTHENTICATION CHECK ===
function checkOrganizerAccess() {
    const userData = localStorage.getItem('userData');
    
    if (!userData) {
        // Not logged in, redirect to login
        alert('❌ Please login first');
        window.location.href = 'organizer-login.html';
        return false;
    }
    
    try {
        const user = JSON.parse(userData);
        
        if (user.role !== 'organizer') {
            // Not an organizer, redirect away
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

// Populate organizer name in welcome message
document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const welcomeSpan = document.querySelector('.subbar-left span');
            if (welcomeSpan) {
                welcomeSpan.textContent = `Welcome back, ${user.username} 👋`;
            }
        } catch (e) {
            console.error('Error loading organizer name:', e);
        }
    }
});

// Render events as cards
function renderEvents(eventArray) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    eventsList.innerHTML = eventArray.length === 0 
        ? "<p>No events found.</p>" 
        : eventArray.map(event => {
            const statusClass = `status-${event.status || 'draft'}`;
            const statusDisplay = (event.status || 'draft').charAt(0).toUpperCase() + (event.status || 'draft').slice(1);
            return `
            <div class="eventCard">
                <div class="event-info">
                    <div class="event-header">
                        <h3>${event.title}</h3>
                        <span class="event-status ${statusClass}">${statusDisplay}</span>
                    </div>
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
        }).join('');
}

// Store all events for filtering
let allEvents = [];

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
        .then(data => {
            // Filter events to show:
            // 1. Events created by the current organizer
            // 2. Events created by other organizers in the same organization (if organization_id is available)
            const events = Array.isArray(data) ? data : [];
            allEvents = events.filter(event => {
                // Show if organizer created it
                if (event.organizer_id === currentOrganzerId) {
                    return true;
                }
                // Show if same organization (when organization_id is available in events)
                if (event.organization_id && userData) {
                    try {
                        const user = JSON.parse(userData);
                        if (user.organization_id === event.organization_id) {
                            return true;
                        }
                    } catch (e) {
                        console.error('Error checking organization:', e);
                    }
                }
                return false;
            });
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

// Edit event - opens modal dialog
function editEvent(id) {
    API.getEvent(id)
        .then(event => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Edit Event</h2>
                    <form id="editForm">
                        <label for="editTitle">Event Title</label>
                        <input type="text" id="editTitle" value="${event.title}" required />

                        <label for="editStartDate">Start Date & Time</label>
                        <input type="datetime-local" id="editStartDate" value="${new Date(event.start_date).toISOString().slice(0, 16)}" required />

                        <label for="editEndDate">End Date & Time</label>
                        <input type="datetime-local" id="editEndDate" value="${new Date(event.end_date).toISOString().slice(0, 16)}" required />

                        <label for="editCategory">Category</label>
                        <select id="editCategory" required>
                            <option value="">Select category</option>
                            <option value="Workshop" ${event.category === 'Workshop' ? 'selected' : ''}>Workshop</option>
                            <option value="Lecture" ${event.category === 'Lecture' ? 'selected' : ''}>Lecture</option>
                            <option value="Social" ${event.category === 'Social' ? 'selected' : ''}>Social</option>
                            <option value="Competition" ${event.category === 'Competition' ? 'selected' : ''}>Competition</option>
                            <option value="Conference" ${event.category === 'Conference' ? 'selected' : ''}>Conference</option>
                        </select>

                        <label for="editLocation">Location</label>
                        <input type="text" id="editLocation" value="${event.location || ''}" />

                        <label for="editCapacity">Capacity</label>
                        <input type="number" id="editCapacity" value="${event.capacity || ''}" min="1" />

                        <label for="editPrice">Price</label>
                        <input type="number" id="editPrice" value="${event.price || 0}" min="0" step="0.01" />

                        <label for="editDescription">Description</label>
                        <textarea id="editDescription" rows="4">${event.description || ''}</textarea>

                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button type="submit" class="btn-primary" style="flex: 1;">Save Changes</button>
                            <button type="button" class="btn-close" style="flex: 1; background-color: #ccc; color: #222;">Cancel</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle form submission
            modal.querySelector('#editForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const updatedEvent = {
                    title: document.getElementById('editTitle').value,
                    start_date: new Date(document.getElementById('editStartDate').value).toISOString(),
                    end_date: new Date(document.getElementById('editEndDate').value).toISOString(),
                    category: document.getElementById('editCategory').value,
                    location: document.getElementById('editLocation').value,
                    capacity: parseInt(document.getElementById('editCapacity').value) || null,
                    price: parseFloat(document.getElementById('editPrice').value) || 0,
                    description: document.getElementById('editDescription').value
                };

                API.updateEvent(id, updatedEvent)
                    .then(() => {
                        alert('✅ Event updated successfully!');
                        modal.remove();
                        loadEvents(); // Refresh the events list
                    })
                    .catch(err => {
                        console.error('Update failed:', err);
                        alert('❌ Failed to update event: ' + (err.message || 'Please try again'));
                    });
            });

            // Handle cancel button
            modal.querySelector('.btn-close').addEventListener('click', () => modal.remove());
        })
        .catch(err => alert('Failed to load event details'));
}


// Search and filter function
function filterEvents() {
    const searchInput = document.getElementById('search');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const searchVal = searchInput?.value.toLowerCase() || "";
    const categoryVal = filterCategory?.value || "";
    const statusVal = filterStatus?.value || "";
    
    const filtered = allEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchVal);
        const matchesCategory = !categoryVal || event.category === categoryVal;
        const matchesStatus = !statusVal || (event.status || 'draft') === statusVal;
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderEvents(filtered);
}

// Check if organizer's email domain matches their organization's domain
async function checkOrgApprovalStatus(user) {
    try {
        // Get all organization members
        const membersResponse = await fetch('http://127.0.0.1:5000/organization_members', {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!membersResponse.ok) {
            console.error('Failed to fetch organization members');
            return;
        }
        
        const members = await membersResponse.json();
        const userOrgMember = members.find(m => m.user_id === user.id);
        
        if (!userOrgMember) {
            console.error('User not found in organization members');
            return;
        }
        
        // Get the organization details
        const orgResponse = await fetch(`http://127.0.0.1:5000/organizations/${userOrgMember.organization_id}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!orgResponse.ok) {
            console.error('Failed to fetch organization');
            return;
        }
        
        const org = await orgResponse.json();
        
        // Check if organization is NOT approved
        if (org.status && org.status !== 'approved') {
            showApprovalDialog(org);
        }
    } catch (err) {
        console.error('Error checking organization approval status:', err);
    }
}

// Show approval pending dialog
function showApprovalDialog(org) {
    const modal = document.createElement('div');
    modal.classList.add('approval-modal-overlay');
    modal.innerHTML = `
        <div class="approval-modal-content">
            <div class="approval-modal-icon">⏳</div>
            <h2>Account Pending Approval</h2>
            <p class="approval-message">
                Your account has been created, but your organization <strong>"${org.title}"</strong> is pending approval by an administrator.
            </p>
            <p class="approval-info">
                In the meantime, you can view events, but you won't be able to create or edit events until your organization is approved.
            </p>
            <button class="approval-btn-ok">OK</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.approval-btn-ok').addEventListener('click', () => {
        modal.remove();
    });
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
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            alert('✅ You have been logged out successfully.');
            window.location.href = 'organizer-login.html';
        });
    }

    // Check organization approval status and show dialog if needed
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            checkOrgApprovalStatus(user);
        } catch (e) {
            console.error('Error checking approval status:', e);
        }
    }

    // Setup search and filter listeners
    const searchInput = document.getElementById('search');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    
    if (searchInput) searchInput.addEventListener('input', filterEvents);
    if (filterCategory) filterCategory.addEventListener('change', filterEvents);
    if (filterStatus) filterStatus.addEventListener('change', filterEvents);


const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const searchField = document.getElementById('search');
            const categoryField = document.getElementById('filterCategory');
            const statusField = document.getElementById('filterStatus');

            if (searchField) searchField.value = "";
            if (categoryField) categoryField.value = "";
            if (statusField) statusField.value = "";

            // Re-render all events
            renderEvents(allEvents);
        });
    }

    // Load initial events
    loadEvents();
});
