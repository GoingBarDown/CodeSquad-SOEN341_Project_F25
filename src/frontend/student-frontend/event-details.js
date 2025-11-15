// event-details.js is now a small launcher. It should set `localStorage.selectedEvent`
// (as a JSON string) and redirect the user to `payment.html` where the actual
// rendering and payment/claim logic live.

// For the working launcher behavior we only store a SAMPLE_EVENT and redirect
// the user to `payment.html`. The payment page is responsible for rendering
// event details and handling ticket creation.

// Render the real event details. Strategy:
// 1) If the URL contains ?id=<n>, fetch /events/<n>
// 2) Else if localStorage.selectedEvent exists, use that
// 3) Else fetch /events and use the first event returned (fallback)
// Claim button stores the selected event (as JSON) and redirects to payment.html

async function fetchEventById(id) {
  try {
    const resp = await fetch(`http://127.0.0.1:5000/events/${encodeURIComponent(id)}`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    console.warn('Failed to fetch event by id', e);
    return null;
  }
}

async function fetchFirstEvent() {
  try {
    const resp = await fetch('http://127.0.0.1:5000/events');
    if (!resp.ok) return null;
    const list = await resp.json();
    return Array.isArray(list) && list.length ? list[0] : null;
  } catch (e) {
    console.warn('Failed to fetch events list', e);
    return null;
  }
}


function renderEventInto(container, event) {
  if (!container || !event) return;

  // Price formatting: treat 0 or 0.0 as FREE
  const priceNum = Number(event.price ?? event.cost ?? 0);
  const priceText = Number.isFinite(priceNum) && priceNum > 0 ? `$${priceNum.toFixed(2)}` : 'FREE';

  // Date formatting (backend provides RFC-style strings; Date can parse them)
  const start = event.start_date ? new Date(event.start_date) : null;
  const end = event.end_date ? new Date(event.end_date) : null;
  const startText = start ? start.toLocaleString() : 'TBA';
  const endText = end ? end.toLocaleString() : 'TBA';

  const capacity = event.capacity ?? event.max_capacity ?? 'N/A';
  const category = event.category || 'N/A';
  const seating = event.seating || 'N/A';
  const rating = (event.rating !== undefined && event.rating !== null) ? String(event.rating) : 'N/A';

  const linkHtml = event.link ? `<a href="${event.link}" target="_blank" rel="noopener noreferrer">${event.link}</a>` : '';

  container.innerHTML = `
    <h1 style="font-family: 'Poller One', sans-serif;">${event.title || 'Event'}</h1>
    <p style="font-size: 1.1rem; font-weight: bold;">Price: ${priceText}</p>
    <p><strong>Category:</strong> ${category}</p>
    <p><strong>Capacity:</strong> ${capacity}</p>
    <p><strong>Seating:</strong> ${seating}</p>
    <p><strong>Rating:</strong> ${rating}</p>
    <p style="margin-top:8px;"><strong>Description:</strong><br>${event.description || ''}</p>
    <p style="margin-top:8px;"><strong>Start:</strong> ${startText}</p>
    <p><strong>End:</strong> ${endText}</p>
    <p><strong>Location:</strong> ${event.location || 'TBA'}</p>
    ${linkHtml ? `<p><strong>Link:</strong> ${linkHtml}</p>` : ''}
    <p style="margin-top:12px; font-size:0.9rem; color:#666;"><strong>Status:</strong> ${event.status || 'N/A'} &nbsp; <strong>Organizer:</strong> ${event.organizer_id ?? 'N/A'} &nbsp; <strong>Event ID:</strong> ${event.id}</p>
  `;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('event-details-container');

  // 1) Try query param id
  const idParam = getQueryParam('id');
  let event = null;
  if (idParam) {
    event = await fetchEventById(idParam);
  }

  // 2) Try localStorage.selectedEvent
  if (!event) {
    try {
      const sel = localStorage.getItem('selectedEvent');
      if (sel) event = JSON.parse(sel);
    } catch (e) {
      console.warn('Could not parse selectedEvent from localStorage', e);
    }
  }

  // If we have a stored event with an id, prefer to refresh it from the server
  // (this replaces stale mock/sample objects stored earlier)
  if (event && (event.id !== undefined && event.id !== null)) {
    const fetched = await fetchEventById(event.id);
    if (fetched) {
      event = fetched;
    }
  }

  // 3) Fallback to first event from backend
  if (!event) {
    event = await fetchFirstEvent();
  }

  // Render what we have (or a friendly message)
  if (event) {
    renderEventInto(container, event);
  } else if (container) {
    container.innerHTML = '<p>Could not load event details. Please try again later.</p>';
  }

  // Claim button: save the selected event (the authoritative object we fetched) and go to payment
  const claimButton = document.getElementById('claim-ticket-btn');
  if (claimButton) {
    claimButton.addEventListener('click', () => {
      try {
        if (event) {
          localStorage.setItem('selectedEvent', JSON.stringify(event));
        }
      } catch (e) {
        console.warn('Failed to save selectedEvent', e);
      }
      window.location.href = 'payment.html';
    });
  }

  // preserve menu toggle UX
  const dot = document.getElementById('dot');
  const menu = document.getElementById('menu');
  if (dot && menu) dot.onclick = () => menu.classList.toggle('open');
});
