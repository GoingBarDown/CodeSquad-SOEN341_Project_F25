
// ===== MENU TOGGLE + ROLE-BASED DISPLAY =====
document.addEventListener("DOMContentLoaded", () => {
  // Accept role from localStorage or fallback to presence of userId cookie / loggedInUser
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  const role = localStorage.getItem("role"); // "student", "organizer", "admin"
  const loggedInUser = localStorage.getItem("loggedInUser");
  const cookieUserId = getCookie('userId');
  const lsUserId = localStorage.getItem('userId');
  const isLoggedIn = Boolean(loggedInUser || cookieUserId || lsUserId);

  const guestMenu     = document.getElementById("guest-menu");
  const studentMenu   = document.getElementById("student-menu");
  const organizerMenu = document.getElementById("organizer-menu");
  const adminMenu     = document.getElementById("admin-menu");

  // Hide all menus initially
  guestMenu && (guestMenu.style.display = "none");
  studentMenu && (studentMenu.style.display = "none");
  organizerMenu && (organizerMenu.style.display = "none");
  adminMenu && (adminMenu.style.display = "none");

  // Show menu based on role or login state
  if (!isLoggedIn && !role) {
    guestMenu && (guestMenu.style.display = "block");
  } else if (role === "student" || isLoggedIn) {
    // default to student menu when logged in without role
    studentMenu && (studentMenu.style.display = "block");
  } else if (role === "organizer") {
    organizerMenu && (organizerMenu.style.display = "block");
  } else if (role === "admin") {
    adminMenu && (adminMenu.style.display = "block");
  } else {
    guestMenu && (guestMenu.style.display = "block");
  }

  // Logout buttons
  const logoutButtons = [
    document.getElementById("logout-btn-student"),
    document.getElementById("logout-btn-organizer"),
    document.getElementById("logout-btn-admin")
  ];

  logoutButtons.forEach(btn => {
    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      // remove client-side stored login info
      try { localStorage.removeItem("role"); } catch(e){
        // comment
      }
      try { localStorage.removeItem("loggedInUser"); } catch(e){
        // comment
      }
      try { localStorage.removeItem("userId"); } catch(e){
        // comment
      }
      // expire cookie
      document.cookie = 'userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      // optionally set a logout message then redirect to index
      try { localStorage.setItem("logoutMessage", "\u2705 Successfully logged out!"); } catch(e){
        // comment
      }
      window.location.href = "index.html";
    });
  });

  // MENU TOGGLE (hamburger)
  const dot = document.getElementById("dot");
  const menu = document.getElementById("menu");

  if (dot && menu) {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== dot) {
        menu.classList.remove("open");
      }
    });
  }
});


// ===== SLIDESHOW =====
const images = [
  "views/image.png",
  "views/hackathon.png",
  "views/hockey.png",
  "views/jobfair.png",
  "views/october.png",
  "views/openhouse.png"
];

const captions = [
  "Welcome to Concordia University!",
  "ConUHacks, Concordia's Annual 24-hour Hack-A-Thon, by HackConcordia",
  "Concordia's Official Hockey Team, The Stingers at a game",
  "The 2025 Comp-Sci career fair is ere to helpyou land your next internship",
  "Fall is here! Welecome the season at Concordia's annual OctoberFest",
  "Considering Concordia University? Come meet us at Open House to learn more."
];

let index = 0;
function changeBackground() {
  const slideshow = document.getElementById("slideshow");
  const info = document.getElementById("info");
  slideshow.style.backgroundImage = `url('${images[index]}')`;
  info.textContent = captions[index];
  index = (index + 1) % images.length;
}

try {
  changeBackground();
  setInterval(() => {
    try { changeBackground(); } catch(e) {
      // comment
    }
  }, 10000);
} catch(e) {
  // comment
}

// ===== EVENTS FETCH + RENDER =====
let allEvents = [];
document.addEventListener('DOMContentLoaded', async () => {
  // Show logout toast if user was redirected here after logout
  try {
    const lm = localStorage.getItem('logoutMessage');
    if (lm) {
      const toast = document.createElement('div');
      toast.id = 'logout-toast';
      toast.textContent = lm;
      toast.style.position = 'fixed';
      toast.style.right = '16px';
      toast.style.top = '16px';
      toast.style.padding = '10px 14px';
      toast.style.background = '#2b7a0b';
      toast.style.color = 'white';
      toast.style.borderRadius = '6px';
      toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      toast.style.zIndex = 9999;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.transition = 'opacity 300ms';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 3000);
      localStorage.removeItem('logoutMessage');
    }
  } catch (e) { /* ignore */ }
  // Show ticket-created toast if navigated from payment
  try {
    const t = sessionStorage.getItem('ticketCreated');
    if (t) {
      const obj = JSON.parse(t);
      const toast = document.createElement('div');
      toast.id = 'ticket-toast';
      toast.textContent = obj.message || 'Your ticket was created!';
      toast.style.position = 'fixed';
      toast.style.right = '16px';
      toast.style.top = '16px';
      toast.style.padding = '10px 14px';
      toast.style.background = '#2b7a0b';
      toast.style.color = 'white';
      toast.style.borderRadius = '6px';
      toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      toast.style.zIndex = 9999;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.transition = 'opacity 300ms';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 3000);
      sessionStorage.removeItem('ticketCreated');
    }
  } catch (e) { /* ignore */ }
  try {
    const response = await fetch('http://127.0.0.1:5000/events');
    const allEventsData = await response.json();
    // Filter to only show published events (exclude draft and cancelled)
    allEvents = allEventsData.filter(event => event.status === 'published');
    renderEvents(allEvents);

    document.getElementById('sortBy')?.addEventListener('change', function() {
      let eventsToRender = [...allEvents];
      if (this.value === 'date') {
        eventsToRender.sort((a,b) => new Date(a.start_date) - new Date(b.start_date));
      } else if (this.value === 'category') {
        eventsToRender.sort((a,b) => (a.category||'').toLowerCase().localeCompare((b.category||'').toLowerCase()));
      }
      renderEvents(eventsToRender);
    });

  } catch (err) { console.error('Failed to load events:', err); }
});

function renderEvents(events) {
  const cardContainer = document.querySelector('.card-container');
  if (!cardContainer) return;
  cardContainer.innerHTML = '';

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <p><strong>${event.title}</strong></p>
      <p>Category: ${event.category || ''}</p>
      <p>${event.description || ''}</p>
      <p>${event.start_date ? new Date(event.start_date).toLocaleString() : ''}</p>
      ${event.link ? `<a href="${event.link}" target="_blank" rel="noopener noreferrer">${event.link}</a>` : ''}
      <button class="details-btn" data-id="${event.id}">View Details</button>
    `;

    card.querySelector('.details-btn').addEventListener('click', () => {
      // Populate modal details
      document.getElementById('modal-details').innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Category:</strong> ${event.category || ''}</p>
        <p><strong>Description:</strong> ${event.description || ''}</p>
        <p><strong>Date:</strong> ${event.start_date ? new Date(event.start_date).toLocaleString() : ''}</p>
        ${event.link ? `<p><a href="${event.link}" target="_blank" rel="noopener noreferrer">${event.link}</a></p>` : ''}
      `;

      // Ensure the modal's Get Ticket button will open the correct event-details URL
      const getTicketAnchor = document.getElementById('get-ticket-btn');
      if (getTicketAnchor) {
        // Set href to include the event id as a query param so event-details can fetch it
        getTicketAnchor.href = `event-details.html?id=${encodeURIComponent(event.id)}`;

        // Also set up a click handler on the anchor to persist the selectedEvent into localStorage
        // This ensures event-details has an authoritative selectedEvent even when opened via href
        getTicketAnchor.onclick = (e) => {
          try {
            localStorage.setItem('selectedEvent', JSON.stringify(event));
          } catch (err) {
            console.warn('Failed to store selectedEvent for modal', err);
          }
          // allow normal navigation to proceed
        };
      }

      document.getElementById('event-modal').style.display = 'flex';
    });

    cardContainer.appendChild(card);
  });

  // Modal close
  document.getElementById('close-modal').onclick = () => { document.getElementById('event-modal').style.display = 'none'; };
  window.onclick = (e) => { if (e.target.id === 'event-modal') document.getElementById('event-modal').style.display = 'none'; };
}

// ===== LOGIN FORM =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    if (!email || !password) { alert("Please fill in all fields."); return; }
    alert(`Logging in as: ${email}`);
  });
}

// ===== SIGNUP FORM =====
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('first_name')?.value.trim() || document.getElementById('name')?.value.trim();
    const lastName = document.getElementById('last_name')?.value.trim() || '';
    const usernameInput = (document.getElementById('username')?.value || document.getElementById('signupUsername')?.value || '').trim();
    const email = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPassword')?.value.trim();
  if (!firstName || !lastName || !email || !password || !usernameInput) { alert("Please fill in all fields."); return; }
  if (password.length < 8) { alert("Password must be at least 8 characters long."); return; }
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(usernameInput)) { alert('Username invalid. Use 3-30 letters, numbers, . _ or -'); return; }
    alert(`Signing up as: ${firstName} ${lastName} (${email}) — username: ${usernameInput}`);
  });
}

// ===== FORGOT PASSWORD FORM =====
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail')?.value.trim();
    if (!email) { alert("Please enter your email."); return; }
    alert(`Password reset link sent to: ${email}`);
  });
}

