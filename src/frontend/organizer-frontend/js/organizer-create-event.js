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

// Handle login/logout button in menu
document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.querySelector('a[href="organizer-login.html"]');
    const userData = localStorage.getItem('userData');
    
    if (loginLink) {
        if (userData) {
            // User is logged in, change to LOGOUT
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('userData');
                localStorage.removeItem('authToken');
                window.location.href = 'organizer-login.html';
            };
        } else {
            // User is not logged in, show LOGIN
            loginLink.textContent = 'Login';
            loginLink.href = 'organizer-login.html';
        }
    }
});


const createEventForm = document.getElementById('createEventForm');
if (createEventForm) {
    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            // Collect all form data using field names expected by backend
            const startVal = document.getElementById('startDate').value;
            const endVal = document.getElementById('endDate').value;

            const eventData = {
                title: document.getElementById('title').value.trim(),
                description: document.getElementById('description').value.trim() || null,
                start_date: startVal ? new Date(startVal).toISOString() : null,
                end_date: endVal ? new Date(endVal).toISOString() : null,
                category: document.getElementById('category').value || null,
                location: document.getElementById('location').value.trim() || null,
                capacity: document.getElementById('capacity').value ? parseInt(document.getElementById('capacity').value, 10) : null,
                price: document.getElementById('price').value ? parseFloat(document.getElementById('price').value) : 0,
                link: document.getElementById('link').value.trim() || null,
                seating: document.getElementById('seating').value.trim() || null,
                status: document.getElementById('status').value || 'draft'
            };

            // Basic validations
            if (!eventData.title) throw new Error('Title is required');
            if (!eventData.start_date || !eventData.end_date) throw new Error('Start and end dates are required');
            if (new Date(eventData.start_date) >= new Date(eventData.end_date)) {
                throw new Error('End date must be after start date');
            }

            if (eventData.price < 0) throw new Error('Price cannot be negative');
            if (eventData.capacity !== null && eventData.capacity <= 0) throw new Error('Capacity must be a positive number');

            // Call API to create event. API.createEvent will throw if response not ok.
            const result = await API.createEvent(eventData);

            // Backend returns { message: 'Event created', event: { ... } }
            if (result && result.event) {
                alert('✅ Event created successfully!');
                window.location.href = 'organizer-events-list.html';
            } else {
                // Fallback if backend shape changes
                throw new Error(result.message || 'Failed to create event');
            }
        } catch (error) {
            console.error('Create event error:', error);
            // API.handleResponse throws Error with message; display that if available
            alert(`❌ Error: ${error.message || 'Failed to create event. Please try again.'}`);
        }
    });
}

// Menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const dot = document.getElementById('dot');
    if (dot) {
        dot.addEventListener('click', () => {
            const menu = document.getElementById('menu');
            if (menu) menu.classList.toggle('open');
        });
    }
});