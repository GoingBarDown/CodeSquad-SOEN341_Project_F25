// Sample event data (replace with backend fetch later)
let events = [
    { id: 1, title: "Robotics Workshop", date: "2025-11-15", category: "Workshop", location: "Lab 101" },
    { id: 2, title: "Guest Lecture: AI", date: "2025-11-20", category: "Lecture", location: "Auditorium" },
    { id: 3, title: "Campus Social Night", date: "2025-12-01", category: "Social", location: "Student Lounge" }
];

// DOM references
const eventsList = document.getElementById('eventsList');
const filterDate = document.getElementById('filterDate');
const filterCategory = document.getElementById('filterCategory');

// Function to render events
function renderEvents(eventArray) {
    eventsList.innerHTML = "";

    if (eventArray.length === 0) {
        eventsList.innerHTML = "<p>No events found.</p>";
        return;
    }

    eventArray.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.classList.add('eventCard');
        eventCard.innerHTML = `
            <h3>${event.title}</h3>
            <p>Date: ${event.date}</p>
            <p>Category: ${event.category}</p>
            <p>Location: ${event.location}</p>
            <button onclick="editEvent(${event.id})">Edit</button>
            <button onclick="deleteEvent(${event.id})">Delete</button>
        `;
        eventsList.appendChild(eventCard);
    });
}

// Filter events
function filterEvents() {
    const dateVal = filterDate.value;
    const categoryVal = filterCategory.value;

    const filtered = events.filter(event => {
        return (!dateVal || event.date === dateVal) &&
               (!categoryVal || event.category === categoryVal);
    });

    renderEvents(filtered);
}

// Event handlers
filterDate.addEventListener('change', filterEvents);
filterCategory.addEventListener('change', filterEvents);

function editEvent(id) {
    alert(`Edit event with ID: ${id}`);
}

function deleteEvent(id) {
    events = events.filter(event => event.id !== id);
    renderEvents(events);
}

// Initial render
renderEvents(events);

// "Create Event" button
document.getElementById('createEventBtn').addEventListener('click', () => {
    alert("Redirect to event creation form");
});