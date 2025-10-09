const dot = document.getElementById('dot');
const menu = document.getElementById('menu');
const eventListElement = document.getElementById('event-list');
const eventCountElement = document.getElementById('event-count');
const detailsPanel = document.getElementById('event-details-panel');
const defaultMessage = document.getElementById('default-message');
const detailsContent = document.getElementById('event-details-content');
const notificationArea = document.getElementById('notification-area');

// Admin Approval Buttons
const acceptBtn = document.getElementById('accept-event-btn');
const denyBtn = document.getElementById('deny-event-btn');

let currentEvents = [];
let selectedEventId = null;
const API_BASE = '/api/v1'; // Standard practice for REST APIs

// --- 1. Mobile Menu Toggle ---
dot.onclick = () => {
    const isOpen = menu.classList.toggle('open');
    dot.innerHTML = isOpen ? '—' : '✕';
};

// --- 2. Mock Data (Simulating Python/SQLite API Response) ---
// Note: This data structure supports all admin/student statuses and details.
const mockEvents = [
    { id: 'e1', title: 'Cybersecurity Workshop', date: 'Oct 25, 2025', time: '4:00 PM', location: 'Tech Lab 101', price: 'Free', status: 'current', organizer: 'ACM Student Chapter', registered: 45, checkIns: 40, capacity: 60, revenue: 0 },
    { id: 'e2', title: 'Freshman Meet & Greet', date: 'Sep 10, 2025', time: '1:00 PM', location: 'Campus Quad', price: 'Free', status: 'pending', organizer: 'Student Council', registered: 120, checkIns: 0, capacity: 200, revenue: 0 },
    { id: 'e3', title: 'Python Code Challenge', date: 'Nov 03, 2025', time: '10:00 AM', location: 'Online', price: 'Paid ($15)', status: 'current', organizer: 'CodeSquad Devs', registered: 150, checkIns: 0, capacity: 500, revenue: 2250 },
    { id: 'e4', title: 'Spring Semester Fair', date: 'Jan 15, 2026', time: '9:00 AM', location: 'Main Auditorium', price: 'Free', status: 'pending', organizer: 'Administration', registered: 0, checkIns: 0, capacity: 1000, revenue: 0 },
    { id: 'e5', title: 'Data Visualization Seminar', date: 'May 01, 2025', time: '1:00 PM', location: 'Business 212', price: 'Free', status: 'past', organizer: 'Statistics Club', registered: 80, checkIns: 68, capacity: 100, revenue: 0 },
];

// --- 3. Notification Utility ---
const displayNotification = (message, type = 'success') => {
    notificationArea.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    notificationArea.style.display = 'block';
    setTimeout(() => {
        notificationArea.style.display = 'none';
        notificationArea.innerHTML = '';
    }, 5000);
};

// --- 4. Data Fetching (Simulating REST API Call & Polling) ---
const fetchEvents = async () => {
   
    // For now, return mock data and update the list
    currentEvents = mockEvents;
    renderEventList(currentEvents);
};

// Use polling to simulate real-time updates for demonstration
setInterval(fetchEvents, 15000); // Poll every 15 seconds

// --- 5. Rendering the Event List ---
const renderEventList = (events) => {
    eventListElement.innerHTML = '';
    eventCountElement.textContent = events.length;

    events.forEach(event => {
        const listItem = document.createElement('li');
        listItem.className = 'event-list-item';
        listItem.setAttribute('data-event-id', event.id);
        
        // Determine status style
        let statusClass = '';
        let attendeeText = '';

        if (event.status === 'pending') {
            statusClass = 'status-pending';
            attendeeText = `Awaiting Approval`;
        } else if (event.status === 'current') {
            statusClass = 'status-current';
            attendeeText = `${event.registered}/${event.capacity} Registered`;
        } else if (event.status === 'past') {
            statusClass = 'status-past';
            attendeeText = `${event.checkIns} Attendees`;
        } else { // denied/cancelled
            statusClass = 'status-denied';
            attendeeText = 'DENIED/CANCELLED';
        }

        listItem.innerHTML = `
            <div class="list-item-content">
                <h3 class="item-title">${event.title}</h3>
                <p class="item-meta">${event.organizer} | ${event.date}</p>
            </div>
            <div class="item-status-block">
                <span class="item-status-badge ${statusClass}">${event.status.toUpperCase()}</span>
                <span class="item-attendees">${attendeeText}</span>
            </div>
        `;
        
        listItem.addEventListener('click', () => showEventDetails(event.id));
        eventListElement.appendChild(listItem);
    });

    // Re-select the currently selected item if it exists
    if (selectedEventId) {
        document.querySelector(`.event-list-item[data-event-id="${selectedEventId}"]`)?.classList.add('active-selected');
    }
};

// --- 6. Showing Event Details ---
const showEventDetails = (eventId) => {
    const event = currentEvents.find(e => e.id === eventId);
    if (!event) return;

    // Highlight the selected item in the list
    document.querySelectorAll('.event-list-item').forEach(el => el.classList.remove('active-selected'));
    document.querySelector(`.event-list-item[data-event-id="${eventId}"]`).classList.add('active-selected');
    selectedEventId = eventId;

    // Hide default message, show content
    defaultMessage.style.display = 'none';
    detailsContent.style.display = 'block';

    // Populate static details
    document.getElementById('detail-title').textContent = event.title;
    document.getElementById('detail-time-location').innerHTML = `${event.time} | ${event.location}`;
    document.getElementById('detail-registered-confirmed').textContent = event.registered;
    document.getElementById('detail-check-ins').textContent = event.checkIns;
    document.getElementById('detail-capacity').textContent = event.capacity;
    document.getElementById('detail-price').textContent = event.price;
    document.getElementById('detail-revenue').textContent = `$${event.revenue.toLocaleString()}`;

    // Update Status Display
    const statusDisplay = document.getElementById('detail-status');
    statusDisplay.textContent = event.status.toUpperCase();
    statusDisplay.className = `event-status-display status-${event.status}`;

    // Conditional Actions (The key admin feature)
    const standardActions = document.getElementById('standard-detail-actions');
    const adminActions = document.getElementById('admin-approval-actions');
    
    if (event.status === 'pending') {
        standardActions.style.display = 'none';
        adminActions.style.display = 'flex'; // Show Accept/Deny
    } else {
        standardActions.style.display = 'flex'; // Show Edit/Report
        adminActions.style.display = 'none';
    }
};

// --- 7. Status Update Logic (Simulating REST API PUT Request) ---
const updateEventStatus = async (eventId, newStatus) => {
    const event = currentEvents.find(e => e.id === eventId);
    if (!event) return;

    try {
        event.status = newStatus;
        
        // Re-render the list and details to reflect the change
        renderEventList(currentEvents);
        showEventDetails(eventId);

        displayNotification(`Event "${event.title}" successfully marked as ${newStatus.toUpperCase()}.`, 'success');

    } catch (error) {
        displayNotification(`Error updating status: ${error.message}`, 'error');
        console.error('API Update Error:', error);
    }
};

// --- 8. Attach Event Listeners for Approval Buttons ---
window.addEventListener('load', () => {
    // Initial fetch of events
    fetchEvents();

    acceptBtn.addEventListener('click', () => {
        if (selectedEventId) updateEventStatus(selectedEventId, 'current');
    });

    denyBtn.addEventListener('click', () => {
        if (selectedEventId) updateEventStatus(selectedEventId, 'denied');
    });
});
