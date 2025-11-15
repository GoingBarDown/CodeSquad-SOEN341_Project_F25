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

// Initial load
document.addEventListener('DOMContentLoaded', loadEvents);
