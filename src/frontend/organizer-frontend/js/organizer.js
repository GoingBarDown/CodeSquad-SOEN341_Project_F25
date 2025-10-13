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
const filterStartDate = document.getElementById('filterStartDate');
const filterEndDate = document.getElementById('filterEndDate');
const filterCategory = document.getElementById('filterCategory');
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
    eventCard.dataset.date = event.date;
    eventCard.dataset.category = event.category;

    eventCard.innerHTML = `
      <h3>${event.title}</h3>
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Category:</strong> ${event.category}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <button onclick="editEvent(${event.id})">Edit</button>
      <button onclick="deleteEvent(${event.id})">Delete</button>
    `;
    eventsList.appendChild(eventCard);
  });
}

// ===== Filter Events =====
function filterEvents() {
  const startVal = filterStartDate?.value;
  const endVal = filterEndDate?.value;
  const categoryVal = filterCategory?.value;

  const filtered = events.filter(event => {
    const eventDate = new Date(event.date);
    const startDate = startVal ? new Date(startVal) : null;
    const endDate = endVal ? new Date(endVal) : null;

    const inDateRange =
      (!startDate || eventDate >= startDate) &&
      (!endDate || eventDate <= endDate);

    const inCategory =
      !categoryVal || event.category === categoryVal;

    return inDateRange && inCategory;
  });

  renderEvents(filtered);
}

// ===== Event Handlers =====
if (filterStartDate) filterStartDate.addEventListener('change', filterEvents);
if (filterEndDate) filterEndDate.addEventListener('change', filterEvents);
if (filterCategory) filterCategory.addEventListener('change', filterEvents);

// ===== Edit / Delete =====
function editEvent(id) {
  const event = events.find(e => e.id === id);
  if (event) {
    alert(`Edit event: ${event.title}`);
  }
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