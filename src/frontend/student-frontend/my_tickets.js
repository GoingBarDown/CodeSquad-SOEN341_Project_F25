/**
 * my_tickets.js
 * * Manages the "My Tickets" page logic.
 * ARCHITECTURE DECISION:
 * separate this logic from index.js to keep the codebase modular. 
 * This script handles fetching specific ticket data, rendering the ticket grid, and managing the QR code modal interactions.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Get references to all the modal parts
  const gridContainer = document.getElementById("ticket-grid-container");
  const modalOverlay = document.getElementById("ticket-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  const modalEventTitle = document.getElementById("modal-event-title");
  const modalEventDate = document.getElementById("modal-event-date");
  const modalEventLocation = document.getElementById("modal-event-location");
  let modalQrImg = document.getElementById("modal-qr-img"); // Use let
  const modalTicketId = document.getElementById("modal-ticket-id");
  const modalTicketStatus = document.getElementById("modal-ticket-status");

  // ARCHITECTURE DECISION: 
  // We define the backend base URL explicitly here.
  // Why: In our local development environment, the frontend is served on Port 3002 
  // while the Flask backend runs on Port 5000. Relative paths (ex: '/api/...') would fail because the browser would look on Port 3002. 
  // This const bridges that gap.
  const BACKEND_BASE = 'http://127.0.0.1:5000';

  /**
   * Fetches ticket and event data from the backend and builds the grid.
   */
  async function loadTickets() {
    try {
      // Get student ID from localStorage or cookies
      // For Robustness, we check localStorage first, but fall back to parsing cookies 
      //in case the auth system changes how it stores the session ID.
      const studentId = localStorage.getItem('userId') || (function() {
        const m = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
        return m ? decodeURIComponent(m[2]) : null;
      })();

      if (!studentId) {
        gridContainer.innerHTML = '<p class="loading-message" style="color: red;">Not logged in. Redirecting to login...</p>';
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
      }

      //We use the absolute URL with the studentId to fetch the joined data
      // (Tickets + Events) in a single request, reducing network overhead.
      const response = await fetch(`${BACKEND_BASE}/api/student/${encodeURIComponent(studentId)}/tickets-with-details`);

      if (response.status === 401) {
        gridContainer.innerHTML = '<p class="loading-message" style="color: red;">Unauthorized. Please log in.</p>';
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.statusText}`);
      }

      const tickets = await response.json();

      if (!tickets || tickets.length === 0) {
        gridContainer.innerHTML = '<p class="loading-message">You have not claimed any tickets yet.</p>';
        return;
      }

      gridContainer.innerHTML = ''; // Clear "Loading..." message

      // Loop through each ticket and create a card
      tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        
        // Normalize date field and format it
        // For Data Normalization.
        // The backend might return keys in snake_case (Python standard) or camelCase.
        // We check multiple possibilities to prevent the UI from breaking if the API schema changes slightly.
        const rawEventDate = ticket.event_date || ticket.eventDate;
        const eventDate = rawEventDate ? new Date(rawEventDate).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Date TBD';

        // Normalize ticket ID field
        const ticketId = ticket.ticket_id || ticket.ticketId || ticket.id;

        // Use data-attributes to store all ticket info on the button
        // Render the card HTML
        card.innerHTML = `
          <div>
            <h3>${ticket.event_title || 'Event Title'}</h3>
            <p>${eventDate}</p>
            <div class="countdown-timer" id="countdown-${ticketId}">
              Loading countdown...
            </div>
          </div>
          <button class="view-ticket-btn" 
            data-title="${ticket.event_title || 'Event Title'}"
            data-date="${rawEventDate || ''}"
            data-location="${ticket.event_location || 'N/A'}"
            data-ticket-id="${ticketId}"
            data-status="${ticket.ticket_status || ticket.status || 'valid'}">
            View Ticket
          </button>
        `;
        gridContainer.appendChild(card);
        
        //Find the new element and start its timer
        // Why: Start the countdown immediately after appending to the DOM.
        // This provides real-time urgency feedback to the student.
        const countdownElement = document.getElementById(`countdown-${ticketId}`);
        if (countdownElement && rawEventDate) {
            startCountdown(countdownElement, rawEventDate);
        } else if (countdownElement) {
            countdownElement.innerHTML = "Event date not set.";
            countdownElement.classList.add("expired");
        }
      });

      // Add event listeners to all the new buttons
      document.querySelectorAll('.view-ticket-btn').forEach(button => {
        button.addEventListener('click', openTicketModal);
      });

      // Auto-open highlighted ticket if query param exists (Deep Linking feature)
      try {
        const params = new URLSearchParams(window.location.search);
        const highlight = params.get('highlightTicket');
        if (highlight) {
          const btn = Array.from(document.querySelectorAll('.view-ticket-btn'))
            .find(b => b.dataset.ticketId == String(highlight));
          if (btn) {
            setTimeout(() => btn.click(), 400);
          }
        }
      } catch (e) {
        console.warn('Failed to auto-open highlighted ticket', e);
      }

    } catch (error) {
      console.error("Error loading tickets:", error);
      gridContainer.innerHTML = '<p class="loading-message" style="color: red;">Could not load your tickets. Please try again later.</p>';
    }
  }

  /**
   * Opens the modal and populates it with data from the clicked button.
   */
  function openTicketModal(event) {
    const button = event.currentTarget;
    const data = button.dataset;

    // 1. Populate the modal with data
    modalEventTitle.textContent = data.title;
    const eventDateStr = data.date ? new Date(data.date).toLocaleString(undefined, {
      dateStyle: 'full',
      timeStyle: 'short'
    }) : 'Date TBD';
    modalEventDate.textContent = eventDateStr;
    modalEventLocation.textContent = data.location || 'N/A';
    
    // Normalize ticket id
    const ticketId = data.ticketId;
    modalTicketId.textContent = ticketId;
    modalTicketStatus.textContent = data.status;
    
    // 2. Set the QR code image source
    // why: we point the image source directly to the backend endpoint.
    // This allows the backend to generate the image in-memory on demand, keeping the server stateless.
    modalQrImg.src = `${BACKEND_BASE}/tickets/${ticketId}/qr`;

    // 3. Fallback Mechanism
    // Why: If the backend fails to generate the image (example: 'Pillow' library missing, or server error),
    // we catch the error and draw a fallback Canvas on the client side.
    // This ensures the user can still see their Ticket ID even if the QR system is down.
    modalQrImg.onerror = () => {
      console.warn('QR image failed to load from server, showing fallback ticket id.');
      // Create canvas fallback
      const canvas = document.createElement('canvas');
      canvas.width = 250; // Match CSS max-width
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px sans-serif'; // Make ID bigger
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(ticketId), canvas.width / 2, canvas.height / 2);

      // Replace the broken <img> with the <canvas>
      if (modalQrImg.parentNode) {
        // Give new canvas the same ID
        canvas.id = 'modal-qr-img'; 
        modalQrImg.parentNode.replaceChild(canvas, modalQrImg);
        // Update our variable to point to the canvas
        modalQrImg = canvas; 
      }
    };
    
    // 4. Show the modal
    modalOverlay.classList.add('visible');
  }

  /**
   * Closes the modal and resets the QR image state.
   */
  function closeTicketModal() {
    modalOverlay.classList.remove('visible');
    
    // Cleanup Logic.
    // why: If the previous modal showed the fallback Canvas, we must swap it back 
    // to a standard <img> tag so the next ticket tries to load the real QR code again.
    if (modalQrImg.tagName === 'CANVAS') {
      // Re-create the original <img> element so it tries again next time
      const newImg = document.createElement('img');
      newImg.id = 'modal-qr-img';
      newImg.src = ''; // Will be set on open
      newImg.alt = 'Ticket QR Code';
      
      // Replace the canvas with the new img tag
      modalQrImg.parentNode.replaceChild(newImg, modalQrImg);
      // Update our variable to point to the new img
      modalQrImg = newImg;
    }
  }

  //Extra feature:
  /**
   * Starts a countdown timer for a specific element.
   * @param {HTMLElement} element - The div to update.
   * @param {string} eventDateString - The ISO date string from the backend.
   */
  function startCountdown(element, eventDateString) {
    const eventTime = new Date(eventDateString).getTime();

    // Update the countdown every second
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = eventTime - now;

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result
        if (distance > 0) {
            element.innerHTML = `Starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
            // Event has passed
            clearInterval(interval);
            element.innerHTML = "This event has already passed.";
            element.classList.add("expired"); // This will make it gray
        }
    }, 1000);
  }
  
  // Main Execution
  
  // Add listeners to close the modal
  modalCloseBtn.addEventListener('click', closeTicketModal);
  modalOverlay.addEventListener('click', (event) => {
    // Only close if the user clicks on the gray overlay itself
    if (event.target === modalOverlay) {
      closeTicketModal();
    }
  });

  // Load the tickets when the page opens
  loadTickets();
});
