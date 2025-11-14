// Menu toggle is handled centrally in `index.js`. Avoid attaching a
// duplicate/unguarded handler here which can throw if DOM elements
// aren't yet present.

// --- Page Specific Logic ---
document.addEventListener("DOMContentLoaded", () => {
  
  // Get references to all the modal parts
  const gridContainer = document.getElementById("ticket-grid-container");
  const modalOverlay = document.getElementById("ticket-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  
  const modalEventTitle = document.getElementById("modal-event-title");
  const modalEventDate = document.getElementById("modal-event-date");
  const modalEventLocation = document.getElementById("modal-event-location");
  const modalQrImg = document.getElementById("modal-qr-img");
  const modalTicketId = document.getElementById("modal-ticket-id");
  const modalTicketStatus = document.getElementById("modal-ticket-status");

  
   // Fetches ticket and event data from the backend and builds the grid.
   
  async function loadTickets() {
    try {
      const studentId = localStorage.getItem('userId') || (function(){
        const m = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
        return m ? decodeURIComponent(m[2]) : null;
      })();

      if (!studentId) {
        // Not logged in — redirect to login page
        gridContainer.innerHTML = '<p class="loading-message" style="color: red;">Not logged in. Redirecting to login...</p>';
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
      }

  // Use the studentId in the API URL (explicit backend base so frontend works when served from file://)
  const BACKEND_BASE = 'http://127.0.0.1:5000';
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

      // Clear the "Loading..." message
      gridContainer.innerHTML = '';

      // Loop through each ticket and create a card
      tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        
        // Normalize field names from backend: event_date or eventDate
  const rawEventDate = ticket.event_date || ticket.eventDate || ticket.event_date || ticket.eventDateRaw || ticket.event_date_raw;
        // Format the date for display
        const eventDate = new Date(rawEventDate).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Use data-attributes to store all ticket info on the button
        card.innerHTML = `
          <div>
            <h3>${ticket.event_title}</h3>
            <p>${eventDate}</p>
          </div>
          <button class="view-ticket-btn" 
            data-title="${ticket.event_title}"
            data-date="${ticket.event_date}"
            data-location="${ticket.event_location}"
            data-ticket-id="${ticket.ticket_id || ticket.ticketId || ticket.id}"
            data-status="${ticket.ticket_status || ticket.status}">
            View Ticket
          </button>
        `;
        gridContainer.appendChild(card);
      });

      // If the page was opened with a highlightTicket query param, try to auto-open it
      try {
        const params = new URLSearchParams(window.location.search);
        const highlight = params.get('highlightTicket');
        if (highlight) {
          // Find the button with the matching data-ticket-id and click it
          const btn = Array.from(document.querySelectorAll('.view-ticket-btn'))
            .find(b => (b.dataset.ticketId || b.dataset.ticketid || b.dataset['ticket-id'] || b.dataset['ticket']) == String(highlight));
          if (btn) {
            // Delay slightly to allow rendering and then open
            setTimeout(() => btn.click(), 400);
          }
        }
      } catch (e) {
        console.warn('Failed to auto-open highlighted ticket', e);
      }

      // Add event listeners to all the new buttons
      document.querySelectorAll('.view-ticket-btn').forEach(button => {
        button.addEventListener('click', openTicketModal);
      });

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
  modalEventDate.textContent = new Date(data.date).toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
    });
    modalEventLocation.textContent = data.location || 'N/A';
  // Normalize ticket id field names in dataset (dataset keys are lowercase)
  const ticketId = data.ticketId || data.ticketid || data.ticket || data['ticket-id'] || data['ticket-id'];
  modalTicketId.textContent = ticketId;
  modalTicketStatus.textContent = data.status || data.status;

    // 2. Set the QR code image source (use absolute backend base)
    const BACKEND_BASE = 'http://127.0.0.1:5000';
    modalQrImg.src = `${BACKEND_BASE}/tickets/${ticketId}/qr`;

    // Fallback: if backend fails to generate the PNG (e.g., PIL not installed),
    // show a simple canvas with the ticket id so the user still sees a code.
    modalQrImg.onerror = () => {
      console.warn('QR image failed to load from server, showing fallback ticket id.');
      // Create canvas fallback
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw a simple border
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      // Draw ticket id text centered
      ctx.fillStyle = '#000000';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(ticketId), canvas.width / 2, canvas.height / 2);

      // Replace the image with the canvas in the modal
      if (modalQrImg.parentNode) {
        modalQrImg.parentNode.replaceChild(canvas, modalQrImg);
      }
    };
    
    // 3. Show the modal
    modalOverlay.classList.add('visible');
  }

  //Closes the modal.
   
  function closeTicketModal() {
    modalOverlay.classList.remove('visible');
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