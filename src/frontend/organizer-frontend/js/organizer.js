// =============================
// Organizer Frontend JS
// Combines menu toggle, auth forms, and events dashboard
// =============================

// ===== MENU TOGGLE =====
const dot = document.getElementById('dot');
const menu = document.getElementById('menu');

if (dot && menu) {
  dot.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

// ===== LOGIN FORM =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    alert(`Logging in as: ${email}`);
  });
}

// ===== SIGNUP FORM =====
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const password = document.getElementById('signupPassword')?.value.trim();

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    alert(`Signing up as: ${name} (${email})`);
  });
}

// ===== FORGOT PASSWORD FORM =====
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('forgotEmail')?.value.trim();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    alert(`Password reset link sent to: ${email}`);
  });
}

// =============================
// EVENTS DASHBOARD
// =============================

// Sample event data (placeholder)
let events = [
  { id: 1, title: "Robotics Workshop", date: "2025-11-15", category: "Workshop", location: "Lab 101" },
  { id: 2, title: "Guest Lecture: AI", date: "2025-11-20", category: "Lecture", location: "Auditorium" },
  { id: 3, title: "Campus Social Night", date: "2025-12-01", category: "Social", location: "Student Lounge" }
];

// DOM references
const eventsList = document.getElementById('eventsList');
const searchInput = document.getElementById('search');
const filterCategory = document.getElementById('filterCategory');
const filterDate = document.getElementById('filterDate');
const createEventBtn = document.getElementById('createEventBtn');

// ===== Render Events =====
function renderEvents(eventArray) {
  if (!eventsList) return;
  eventsList.innerHTML = "";

  if (eventArray.length === 0) {
    eventsList.innerHTML = "<p>No events found.</p>";
    return;
  }

  eventArray.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.classList.add('eventCard');
    eventCard.innerHTML = `
      <div class="event-info">
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Category:</strong> ${event.category}</p>
        <p><strong>Location:</strong> ${event.location}</p>
      </div>
      <div class="event-actions">
        <button class="btn-view" onclick="viewDetails(${event.id})">View Details</button>
        <button class="btn-edit" onclick="editEvent(${event.id})">Edit</button>
        <button class="btn-delete" onclick="deleteEvent(${event.id})">Delete</button>
      </div>
    `;
    eventsList.appendChild(eventCard);
  });
}

// ===== View Details (Modal Dialog) =====
function viewDetails(id) {
  const event = events.find(e => e.id === id);
  if (!event) return;

  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${event.title}</h2>
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Category:</strong> ${event.category}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Description:</strong> ${
        event.description || "No description available."
      }</p>
      <button class="btn-close">Close</button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.btn-close').addEventListener('click', () => modal.remove());
}

// ===== Filter + Search =====
function filterEvents() {
  const searchVal = searchInput?.value.toLowerCase() || "";
  const categoryVal = filterCategory?.value || "";
  const dateVal = filterDate?.value || "";

  const filtered = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchVal);
    const matchesCategory = !categoryVal || event.category === categoryVal;
    const matchesDate = !dateVal || 
      (dateVal === "Upcoming" ? new Date(event.date) >= new Date() : new Date(event.date) < new Date());

    return matchesSearch && matchesCategory && matchesDate;
  });

  renderEvents(filtered);
}

// ===== Event Handlers =====
if (searchInput) searchInput.addEventListener('input', filterEvents);
if (filterCategory) filterCategory.addEventListener('change', filterEvents);
if (filterDate) filterDate.addEventListener('change', filterEvents);

// ===== Edit / Delete =====
function editEvent(id) {
  const event = events.find(e => e.id === id);
  if (event) alert(`Edit event: ${event.title}`);
}

function deleteEvent(id) {
  if (confirm("Are you sure you want to delete this event?")) {
    events = events.filter(e => e.id !== id);
    renderEvents(events);
  }
}

// ===== Create Event Button =====
if (createEventBtn) {
  createEventBtn.addEventListener('click', () => {
    alert("Redirect to event creation form");
  });
}

// ===== Initial Render =====
renderEvents(events);
