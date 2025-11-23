// NOTE: menu toggle is handled globally in index.js to avoid duplicate listeners

// Handle payment verification
const form = document.getElementById("paymentForm");
const status = document.getElementById("paymentStatus");

// Helpers
const getUserId = () => {
  return localStorage.getItem('userId') || (function(){
    const m = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
  })();
};

const setStatus = (msg, color) => {
  if (!status) return;
  status.textContent = msg;
  status.style.color = color || 'black';
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// On page load, attempt to prefill and lock the studentId input from the logged-in user's profile
document.addEventListener('DOMContentLoaded', async () => {
  // --- Event rendering ---
  // If the previous page stored a selectedEvent, render it on the payment page
  try {
    const selectedEventRaw = localStorage.getItem('selectedEvent');
    if (selectedEventRaw) {
      const event = JSON.parse(selectedEventRaw);
      const title = document.createElement('h3');
      title.textContent = event.title || 'Event';
      title.style.fontFamily = "Arial, sans-serif";
      title.style.textAlign = "center";
      const amount = document.getElementById('amount');
      // show price even if 0
      if (amount && event.price !== undefined) amount.value = `$${Number(event.price).toFixed(2)}`;
      // Insert a short event summary above the form
      const card = document.querySelector('.auth-card');
      if (card && !document.getElementById('paymentEventSummary')) {
        const summary = document.createElement('div');
        summary.id = 'paymentEventSummary';
        summary.style.marginBottom = '12px';
        summary.appendChild(title);
        card.insertBefore(summary, card.firstChild);
      }
    }
  } catch (e) {
    console.warn('Could not render selectedEvent on payment page', e);
  }

  // Menu toggle (guarded) — ensure payment page has working sidebar even if index.js isn't loaded
  try {
    const dot = document.getElementById('dot');
    const menu = document.getElementById('menu');
    if (dot && menu) {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('open');
        dot.innerHTML = isOpen ? '\u2212' : '☰';
      });

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== dot) {
          menu.classList.remove('open');
          dot.innerHTML = '☰';
        }
      });
    }
  } catch (e) {
    // ignore menu wiring errors
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentId = (document.getElementById("studentId")?.value || '').trim();
  // Normalize and validate the entered ID. Accept formats like "S1234567" or just digits.
  let numericStudentId = null;
  if (/^[Ss]\d+$/.test(studentId)) {
    numericStudentId = studentId.slice(1);
  } else if (/^\d+$/.test(studentId)) {
    numericStudentId = studentId;
  } else {
    status.textContent = "❌ Invalid Student ID format. Use S1234567 or 1234567.";
    status.style.color = "red";
    return;
  }

  // Determine user id and fetch user once
  const userId = getUserId();
  if (!userId) {
    setStatus("❌ You must be logged in to complete payment. Redirecting to login...", 'red');
    setTimeout(() => window.location.href = 'login.html', 1200);
    return;
  }

  let userData = null;
  try {
    const userResp = await fetch(`http://127.0.0.1:5000/users/${encodeURIComponent(userId)}`);
    if (!userResp.ok) throw new Error('Failed to verify user');
    userData = await userResp.json();
  } catch (err) {
    console.warn('Student ID verification failed:', err);
    setStatus("❌ Could not verify Student ID. Try again later.", 'red');
    return;
  }

  const serverStudentId = userData && (userData.student_id ?? userData.studentId ?? null);
  if (!serverStudentId) {
    setStatus("❌ Your account does not have a student ID registered. Please update your profile.", 'red');
    return;
  }

  if (String(serverStudentId) !== String(numericStudentId)) {
    setStatus("❌ The Student ID you entered does not match your account. Ticket creation blocked.", 'red');
    return;
  }

  // Passed verification — proceed with payment simulation
  status.textContent = "Processing payment...";
  status.style.color = "#912338";

  // Simulate payment delay then attempt to create a ticket on the backend
  await sleep(1500);
  setStatus("✅ Payment Approved! Creating your ticket...", 'green');

    // Find the selected event saved earlier by event-details.js
    const selectedEventRaw = localStorage.getItem('selectedEvent');
    let event = null;
    try { event = selectedEventRaw ? JSON.parse(selectedEventRaw) : null; } catch (e) { event = null; }

    // If event has an id, refresh authoritative copy from server (optional)
    if (event && (event.id !== undefined && event.id !== null)) {
      try {
        const er = await fetch(`http://127.0.0.1:5000/events/${encodeURIComponent(event.id)}`);
        if (er.ok) event = await er.json();
      } catch (e) {
        // ignore network errors and continue with local event
      }
    }

    // Build payload for backend
    const BACKEND_BASE = 'http://127.0.0.1:5000';
    const url = `${BACKEND_BASE}/tickets`;

    // Use the already-fetched userData to determine attendee id
    const attendeeIdForPayload = userData.id;
    if (attendeeIdForPayload === undefined || attendeeIdForPayload === null) {
      console.warn('Account record missing id');
      setStatus('❌ Could not confirm your account with the server. Please log in again.', 'red');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }

    // Try to derive numeric IDs for event id if possible
    const payload = {
      attendee_id: attendeeIdForPayload,
      event_id: event && isFinite(Number(event.id)) ? Number(event.id) : (event ? event.id : null)
    };

    // If no event is available, fall back to redirecting home
    if (!payload.event_id) {
      status.textContent = "✅ Payment Approved! Ticket confirmed (local). Redirecting...";
      setTimeout(() => window.location.href = 'index.html', 2000);
      return;
    }

    // Attempt to call backend to create ticket
    try {
      setStatus('Creating ticket with server...', '#333');
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || `Server returned ${resp.status}`);
      }

      const respPayload = await resp.json();
      const maybeTicket = respPayload.ticket ?? respPayload.id ?? respPayload;

      // extract ticket id robustly
      let ticketId = null;
      if (typeof maybeTicket === 'object' && maybeTicket !== null) {
        ticketId = maybeTicket.id ?? maybeTicket.ticketId ?? maybeTicket.ticket_id ?? null;
      } else {
        ticketId = maybeTicket;
      }

      if (!ticketId) throw new Error('Server did not return a ticket id');

      // Verify created ticket belongs to the attendee id
      const ticketResp = await fetch(`${BACKEND_BASE}/tickets/${encodeURIComponent(ticketId)}`);
      if (!ticketResp.ok) throw new Error('Failed to fetch created ticket for verification');
      const createdTicket = await ticketResp.json();
      const attendeeIdOnTicket = createdTicket.attendee_id ?? createdTicket.attendeeId ?? createdTicket.attendee;
      if (String(attendeeIdOnTicket) !== String(attendeeIdForPayload)) {
        setStatus("\u274c Ticket created but does not belong to your account. Please contact support.", 'red');
        return;
      }

      // Redirect to home with a small popup: store a short notification in sessionStorage
      try {
        sessionStorage.setItem('ticketCreated', JSON.stringify({ id: ticketId, message: '✅ Your ticket was created!' }));
      } catch (e) { /* ignore */ }
      await sleep(500);
      window.location.href = 'index.html';

    } catch (err) {
      // Backend failed — fall back to local simulation and redirect (only in dev)
      console.warn('Backend ticket creation failed:', err);
      const dev = new URLSearchParams(window.location.search).get('dev') === 'true';
      if (dev) {
        setStatus('Payment approved but server ticket creation failed; opening local ticket view.', 'orange');
        await sleep(700);
        const simId = `sim-ticket-${Math.floor(Math.random()*100000)}`;
        window.location.href = `my_tickets.html?highlightTicket=${encodeURIComponent(simId)}`;
        return;
      }

      setStatus('❌ Could not create ticket. Please try again later.', 'red');
    }
});
