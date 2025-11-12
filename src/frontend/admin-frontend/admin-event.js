// --- 0. Global Data Store and Configuration ---
let allEvents = [];
const API_BASE_URL = '/events'; 


// --- 1. Event Fetching (API Integration Point - GET) ---
async function fetchAllEvents() {
    try {
        // GET /events (Calls crud_events.get_all_events)
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch events: HTTP status ${response.status}`);
        }
        
        allEvents = await response.json(); 
        
        applyFilters();
    } catch (error) {
        console.error("Could not fetch events:", error);
        const container = document.getElementById('event-list-container');
        if (container) {
            container.innerHTML = '<div style="padding: 15px; color: red;">Error loading events. Check server connection and API route.</div>';
        }
    }
}


// --- 2. Rendering Events and Details (No changes needed) ---
function renderEventList(eventsToDisplay) {
    const container = document.getElementById('event-list-container');
    const contentView = document.querySelector('.content-view');
    if (!container || !contentView) return;

    container.innerHTML = '';
    contentView.innerHTML = '<p class="placeholder-text">Select an event to view details.</p>';

    if (eventsToDisplay.length === 0) {
        container.innerHTML = '<div class="no-results">No events match the current filter.</div>';
        return;
    }

    eventsToDisplay.forEach((event, index) => {
        const item = document.createElement('div');
        item.classList.add('event-list-item');
        item.setAttribute('data-event-id', event.id);
        item.innerHTML = `<strong>${event.title}</strong><br><small>Status: ${event.status} | ${event.date}</small>`;

        item.addEventListener('click', loadEventDetails);
        container.appendChild(item);

        if (index === 0) {
            item.classList.add('active');
            loadEventDetails({ currentTarget: item });
        }
    });
}

function loadEventDetails(event) {
    document.querySelectorAll('.event-list-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const eventId = parseInt(event.currentTarget.getAttribute('data-event-id'));
    const eventData = allEvents.find(e => e.id === eventId);
    const contentView = document.querySelector('.content-view');

    if (eventData && contentView) {
        let moderationButtons = '';
        if (eventData.status.toLowerCase() === 'pending') {
            moderationButtons = `
                <button onclick="changeEventStatus(${eventData.id}, 'Active')" class="event-action-button btn-approve">Approve</button>
                <button onclick="changeEventStatus(${eventData.id}, 'Denied')" class="event-action-button btn-deny">Deny</button>
            `;
        }
        
        let deleteButton = `<button onclick="deleteEvent(${eventData.id})" class="event-action-button btn-delete">Delete Event</button>`;

        const qrScannerHTML = `
            <div class="qr-scanner-card">
                <h3>Ticket Validator</h3>
                <p>Upload a student's QR code image to check them in for this event.</p>
                <input type="file" id="qr-file-input" accept="image/*">
                <canvas id="qr-canvas" style="display: none;"></canvas>
                <div id="qr-result-message"></div>
            </div>
        `;

        contentView.innerHTML = `
            <div class="event-info-card">
                <div class="info-header">
                    <h2>${eventData.title}</h2>
                    <span class="status-tag status-${eventData.status.toLowerCase()}">${eventData.status.toUpperCase()}</span>
                </div>
                <hr>
                <div class="info-details">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${eventData.date}</div>
                    <div class="info-label">Location:</div>
                    <div class="info-value">${eventData.location}</div>
                    <div class="info-label">Organizer:</div>
                    <div class="info-value">${eventData.organizer}</div>
                    <div class="info-label">Attendees:</div>
                    <div class="info-value">${eventData.attendees}</div>
                    <div class="info-label">Ticket Price:</div>
                    <div class="info-value">$${eventData.ticketPrice ? eventData.ticketPrice.toFixed(2) : '0.00'}</div>
                    <div class="info-label">Association:</div>
                    <div class="info-value">${eventData.association}</div>
                </div>
                
                <h4>Description:</h4>
                <p>${eventData.details}</p>

                <div class="admin-actions">
                    ${moderationButtons}
                    <button class="event-action-button btn-edit">Edit Details</button>
                    ${deleteButton}
                </div>
            </div>
            ${qrScannerHTML}
        `;
        const fileInput = document.getElementById("qr-file-input");
        if (fileInput) {
            fileInput.addEventListener("change", handleFileSelect);
        }
    }
}


// --- 3. Event Status Update (API Integration Point - PUT) ---
async function changeEventStatus(eventId, newStatus) {
    // PUT /events/<int:event_id> (Calls crud_events.update_event)
    try {
        const response = await fetch(`${API_BASE_URL}/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
             throw new Error(`Server failed to update status for event ID ${eventId}.`);
        }
        
        // Update frontend state
        const eventIndex = allEvents.findIndex(e => e.id === eventId);
        if (eventIndex > -1) {
            allEvents[eventIndex].status = newStatus;
            
            applyFilters(); 
            const updatedItem = document.querySelector(`[data-event-id="${eventId}"]`);
            if (updatedItem) loadEventDetails({ currentTarget: updatedItem });
        }
        alert(`Event status successfully updated to: ${newStatus}.`);
        
    } catch (error) {
        console.error("Error updating event status:", error);
        alert(`Failed to save status change. Error: ${error.message}`);
    }
}


// --- 4. Event Deletion (API Integration Point - DELETE) ---
async function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) {
        return;
    }
    
    // DELETE /events/<int:event_id> (Calls crud_events.delete_event)
    try {
        const response = await fetch(`${API_BASE_URL}/${eventId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Server failed to delete event ID ${eventId}.`);
        }
        
        // Remove from local array and re-render
        allEvents = allEvents.filter(event => event.id !== eventId);
        
        applyFilters(); 
        alert("Event successfully deleted.");
        
    } catch (error) {
        console.error("Error deleting event:", error);
        alert(`Failed to delete event. Error: ${error.message}`);
    }
}


// --- 5. Filtering Logic (No changes needed) ---
function applyFilters() {
    const searchTerm = document.getElementById('main-search')?.value.toLowerCase() || '';
    const year = document.getElementById('filter-year')?.value || '';
    const semester = document.getElementById('filter-semester')?.value || '';
    const association = document.getElementById('filter-association')?.value || '';
    const status = document.getElementById('filter-buttons')?.value.toLowerCase() || '';

    if (allEvents.length === 0) {
      renderEventList([]);
      return;
    }

    const filtered = allEvents.filter(event => {
        const matchSearch = event.title.toLowerCase().includes(searchTerm) || event.organizer.toLowerCase().includes(searchTerm) || event.details.toLowerCase().includes(searchTerm);
        const matchYear = !year || event.year === year;
        const matchSemester = !semester || event.semester === semester;
        const matchAssoc = !association || event.association === association;
        const matchStatus = !status || event.status.toLowerCase() === status;

        return matchSearch && matchYear && matchSemester && matchAssoc && matchStatus;
    });

    renderEventList(filtered);
    console.log(`Filters applied: showing ${filtered.length} events.`);
}


// --- 6. Event Listener Setup (No changes needed) ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the event data
    fetchAllEvents();

    // Filters event listeners
    document.getElementById('main-search')?.addEventListener('input', applyFilters);
    document.getElementById('filter-year')?.addEventListener('change', applyFilters);
    document.getElementById('filter-semester')?.addEventListener('change', applyFilters);
    document.getElementById('filter-association')?.addEventListener('change', applyFilters);
    document.getElementById('filter-buttons')?.addEventListener('change', applyFilters);

    console.log("Admin Event Script Loaded.");
});

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const canvas = document.getElementById("qr-canvas");
  // Check if canvas exists, if not, create it dynamically (safer)
  const ctx = canvas.getContext("2d");

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      
      // Scan for QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log("Found QR code:", code.data);
        validateTicketId(code.data);
      } else {
        setQrResultMessage("error", "Could not read QR code from image.");
      }
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

async function validateTicketId(ticketId) {
  setQrResultMessage("info", `Validating ticket ${ticketId}...`);
  
  try {
    const response = await fetch('/tickets/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${your_auth_token}` // Add auth if needed
      },
      body: JSON.stringify({ ticketId: ticketId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Validation Failed");
    }
    
    // Success!
    setQrResultMessage("success", `Success! Ticket ${ticketId} checked in for ${data.attendeeName}.`);
    // Optionally, update event stats on the page
    
  } catch (error) {
    console.error("Validation error:", error.message);
    setQrResultMessage("error", `Error: ${error.message}`);
  }
}

function setQrResultMessage(type, message) {
  const resultMessage = document.getElementById("qr-result-message");
  if (resultMessage) {
    resultMessage.textContent = message;
    resultMessage.style.color = "black"; // Reset
    if (type === "success") resultMessage.style.color = "green";
    if (type === "error") resultDMessage.style.color = "red";
    if (type === "info") resultMessage.style.color = "blue";
  }
}