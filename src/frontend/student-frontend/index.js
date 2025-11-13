
// ===== MENU TOGGLE =====
document.addEventListener("DOMContentLoaded", () => {
  // hide login/signup if user is already logged in
  try {
    const user = localStorage.getItem('loggedInUser') || (function(){
      // fallback to cookie named userId set by login flow
      const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    })();

    if (user) {
      const menu = document.getElementById('menu');
      if (menu) {
        // Remove any links that point to login or signup
        Array.from(menu.querySelectorAll('a')).forEach(a => {
          const href = (a.getAttribute('href') || '').toLowerCase();
          if (href.includes('login.html') || href.includes('signup.html')) {
            a.remove();
          }
        });

        // Add a logout link if not already present
        if (!menu.querySelector('#logoutLink')) {
          const logoutA = document.createElement('a');
          logoutA.href = '#';
          logoutA.id = 'logoutLink';
          logoutA.textContent = 'LOGOUT';
          logoutA.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            // Remove userId cookie (expires now)
            document.cookie = 'userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            localStorage.setItem('logoutMessage', '✅ Successfully logged out!');
            window.location.href = 'index.html';
          });
          // append at end
          menu.querySelector('nav')?.appendChild(logoutA);
        }
      }
    }
  } catch (err) {
    console.warn('Menu login toggle failed', err);
  }
  const dot = document.getElementById("dot");
  const menu = document.getElementById("menu");

  if (dot && menu) {
    dot.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent immediate close
      const isOpen = menu.classList.toggle("open");
      dot.innerHTML = isOpen ? "&#8211;" : "&#8801;"; // minus vs menu symbol
    });

    // Close the menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== dot) {
        menu.classList.remove("open");
        dot.innerHTML = "&#8801;"; // reset icon
      }
    });
  }
});



const images = [
  "views/image.png", //ew
  "views/hackathon.png", //good
  "views/hockey.png", //good
  "views/jobfair.png", //switch
  "views/october.png", //nicee
  "views/openhouse.png" //nice
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
  info.textContent = captions[index];   //change text

  index = (index + 1) % images.length;
}

// My god, please somebody fix this in the future.
// This is the worst error handling I've written in a long time
try {
  changeBackground();
  
  // change every 10 seconds
  setInterval(() => {
    try {
      changeBackground();
    } catch (e) {

    }
  }, 10000);

} catch (e) {

}

let allEvents = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/events');
    allEvents = await response.json();

    renderEvents(allEvents);

    // Add event listener for sorting
    document.getElementById('sortBy').addEventListener('change', function() {
      let eventsToRender = [...allEvents];
      if (this.value === 'date') {
        eventsToRender.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      } else if (this.value === 'category') {
        eventsToRender.sort((a, b) => {
          const catA = (a.category || '').toLowerCase();
          const catB = (b.category || '').toLowerCase();
          return catA.localeCompare(catB);
        });
      }
      renderEvents(eventsToRender);
    });
  } catch (err) {
    console.error('Failed to load events:', err);
  }
});

function renderEvents(events) {
  const cardContainer = document.querySelector('.card-container');
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

    // Show modal with event details when "View Details" is clicked
    card.querySelector('.details-btn').addEventListener('click', () => {
      document.getElementById('modal-details').innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Category:</strong> ${event.category || ''}</p>
        <p><strong>Description:</strong> ${event.description || ''}</p>
        <p><strong>Date:</strong> ${event.start_date ? new Date(event.start_date).toLocaleString() : ''}</p>
        ${event.link ? `<p><a href="${event.link}" target="_blank" rel="noopener noreferrer">${event.link}</a></p>` : ''}
      `;
      document.getElementById('event-modal').style.display = 'flex';
    });

    cardContainer.appendChild(card);
  });

  // Close modal logic (ensure only set once)
  document.getElementById('close-modal').onclick = () => {
    document.getElementById('event-modal').style.display = 'none';
  };
  window.onclick = (e) => {
    if (e.target.id === 'event-modal') {
      document.getElementById('event-modal').style.display = 'none';
    }
  };
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

