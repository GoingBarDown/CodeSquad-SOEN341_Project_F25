const dot=document.getElementById('dot');
const menu=document.getElementById('menu');
dot.onclick=()=>{
  const isOpen=menu.classList.toggle('open');
  dot.innerHTML=isOpen?'&#8211;':'&#8801;';}
  //minus and menu symbols


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
//initial image
//changeBackground();

//change every 30 seconds (5000 ms)
setInterval(changeBackground, 10000);


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

