// --- Standard Menu Toggle ---
const dot = document.getElementById('dot');
const menu = document.getElementById('menu');
dot.onclick = () => {
  const isOpen = menu.classList.toggle('open');
  dot.innerHTML = isOpen ? '&#8211;' : '&#8801;';
}

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
    
      const studentId = localStorage.getItem('userId') || '1'; // Default to '1' for testing
      
      if (!studentId) {
           gridContainer.innerHTML = '<p class="loading-message" style="color: red;">Could not find user ID. Please log in again.</p>';
           return;
      }

      // Use the studentId in the API URL
      const response = await fetch(`/api/student/${studentId}/tickets-with-details`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.statusText}`);
      }
      
      const tickets = await response.json();

      if (tickets.length === 0) {
        gridContainer.innerHTML = '<p class="loading-message">You have not claimed any tickets yet.</p>';
        return;
      }

      // Clear the "Loading..." message
      gridContainer.innerHTML = '';

      // Loop through each ticket and create a card
      tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        
        // Format the date for display
        const eventDate = new Date(ticket.event_date).toLocaleDateString(undefined, {
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
            data-ticket-id="${ticket.ticket_id}"
            data-status="${ticket.ticket_status}">
            View Ticket
          </button>
        `;
        gridContainer.appendChild(card);
      });

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
    modalTicketId.textContent = data.ticketId;
    modalTicketStatus.textContent = data.status;
    
    // 2. Set the QR code image source
    modalQrImg.src = `/tickets/${data.ticketId}/qr`;
    
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