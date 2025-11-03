const dot = document.getElementById('dot');
const menu = document.getElementById('menu');
dot.onclick = () => {
  const isOpen = menu.classList.toggle('open');
  dot.innerHTML = isOpen ? '&#8211;' : '&#8801;';
};
// minus and menu symbols

const images = [
  "views/image.png",
  "views/hackathon.png",
  "views/hockey.png",
  "views/jobfair.png",
  "views/october.png",
  "views/openhouse.png"
];

let index = 0;
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

    card.querySelector('.details-btn').addEventListener('click', () => {
      // Fill modal with event details
      document.getElementById('modal-details').innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Category:</strong> ${event.category || ''}</p>
        <p><strong>Description:</strong> ${event.description || ''}</p>
        <p><strong>Date:</strong> ${event.start_date ? new Date(event.start_date).toLocaleString() : ''}</p>
        ${event.link ? `<p><a href="${event.link}" target="_blank" rel="noopener noreferrer">${event.link}</a></p>` : ''}
      `;
      document.getElementById('event-modal').style.display = 'flex';

      // Show full JSON on Get Ticket
      document.getElementById('get-ticket-btn').onclick = () => {
        alert(JSON.stringify(event, null, 2));
      };
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

function changeBackground() {
  document.getElementById("slideshow").style.backgroundImage = `url('${images[index]}')`;
  index = (index + 1) % images.length;
}

// initial image
changeBackground();

// change every 10 seconds
setInterval(changeBackground, 10000);