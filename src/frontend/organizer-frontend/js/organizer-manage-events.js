// === AUTHENTICATION CHECK ===
function checkOrganizerAccess() {
    const userData = localStorage.getItem('userData');
    
    if (!userData) {
        alert('❌ Please login first');
        window.location.href = 'organizer-login.html';
        return false;
    }
    
    try {
        const user = JSON.parse(userData);
        
        if (user.role !== 'organizer') {
            alert('❌ You do not have permission to access this page. Only organizers can access this area.');
            window.location.href = '../student-frontend/index.html';
            return false;
        }
        
        return true;
    } catch (e) {
        console.error('Error checking organizer access:', e);
        localStorage.clear();
        window.location.href = 'organizer-login.html';
        return false;
    }
}

// Check access before loading page
if (!checkOrganizerAccess()) {
    throw new Error('Access denied');
}

// Handle login/logout button in menu
document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.querySelector('a[href="organizer-login.html"]');
    const userData = localStorage.getItem('userData');
    
    if (loginLink) {
        if (userData) {
            // User is logged in, change to LOGOUT
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('userData');
                localStorage.removeItem('authToken');
                window.location.href = 'organizer-login.html';
            };
        } else {
            // User is not logged in, show LOGIN
            loginLink.textContent = 'Login';
            loginLink.href = 'organizer-login.html';
        }
    }

    // Menu toggle
    const dot = document.getElementById("dot");
    const menu = document.getElementById("menu");
    dot.addEventListener("click", () => menu.classList.toggle("open"));

    
    // This finds the card and updates its numbers
    function updateAnalyticsCard(eventId) {
        // 1. Find the card for this event
        const card = document.querySelector(`.card[data-event-id="${eventId}"]`);
        if (!card) return;

        // 2. Find the specific stat elements we need to update
        const registeredEl = card.querySelector(`#stat-registered-${eventId}`);
        const checkedInEl = card.querySelector(`#stat-checked-in-${eventId}`);
        const rateEl = card.querySelector(`#stat-rate-${eventId}`);
        
        if (!registeredEl || !checkedInEl || !rateEl) return;

        // 3. Get the current numbers from the text
        let registered = parseInt(registeredEl.textContent);
        let checkedIn = parseInt(checkedInEl.textContent);

        // 4. Increment the checked-in count
        // We only call this on success, so we know it's a new check-in
        checkedIn += 1;

        // 5. Recalculate the attendance rate
        const newRate = (registered > 0) ? Math.round((checkedIn / registered) * 100) : 0;

        // 6. Update the HTML text
        checkedInEl.textContent = checkedIn;
        rateEl.textContent = newRate;
    }

    // Load all tickets and events for analytics
    Promise.all([API.getEvents(), API.getAllTickets()])
        .then(([events, allTickets]) => {
            if (!events || events.length === 0) {
                document.getElementById("analyticsContainer").innerHTML = "<p>No events found</p>";
                return;
            }

            const container = document.getElementById("analyticsContainer");
            
            // Create a map of tickets by event ID
            const ticketsByEvent = {};
            allTickets.forEach(ticket => {
                const eventId = ticket.event_id;
                if (!ticketsByEvent[eventId]) {
                    ticketsByEvent[eventId] = [];
                }
                ticketsByEvent[eventId].push(ticket);
            });

            events.forEach(event => {
                // Get real ticket data for this event
                const eventTickets = ticketsByEvent[event.id] || [];
                const registered = eventTickets.length;
                const checkedIn = eventTickets.filter(t => t.status === 'checked-in').length;
                const attendanceRate = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;
                const remaining = event.capacity - registered;

                const card = document.createElement("div");
                card.className = "card";
                card.setAttribute('data-event-id', event.id); //add event ID to the card

                // Add unique IDs to the stat spans
                card.innerHTML = `
                    <h3>${event.title}</h3>
                    <p class="stat"><b><span id="stat-registered-${event.id}">${registered}</span> / ${event.capacity}</b><br>
                    <small>Registered Participants</small></p>
                    <p><b>Attendance Rate:</b> <span id="stat-rate-${event.id}">${attendanceRate}</span>%</p>
                    <p><b>Checked In:</b> <span id="stat-checked-in-${event.id}">${checkedIn}</span> / <span id="stat-registered-total-${event.id}">${registered}</span></p>
                    <p><b>Remaining Capacity:</b> ${remaining}</p>
                    <br>
                    <button class="btn-primary download-btn" data-id="${event.id}" data-title="${event.title}">Download CSV</button>
                `;
                container.appendChild(card);
            });

            // Handle CSV downloads with real ticket data
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const eventId = e.target.dataset.id;
                    const eventTitle = e.target.dataset.title;
                    
                    // Get tickets for this event and fetch user data
                    const eventTickets = ticketsByEvent[eventId] || [];
                    
                    if (eventTickets.length > 0) {
                        // Fetch user data for each ticket
                        const userPromises = eventTickets.map(ticket => 
                            API.getUser(ticket.attendee_id)
                                .catch(() => ({ username: 'Unknown' }))
                        );
                        
                        Promise.all(userPromises)
                            .then(users => {
                                const participants = eventTickets.map((ticket, idx) => ({
                                    name: users[idx]?.username || 'Unknown',
                                    ticketId: ticket.id,
                                    status: ticket.status
                                }));
                                
                                const csv = [
                                    ["Name", "Ticket ID", "Status"],
                                    ...participants.map(p => [p.name, p.ticketId, p.status])
                                ].map(r => r.join(",")).join("\n");

                                const blob = new Blob([csv], { type: "text/csv" });
                                const link = document.createElement("a");
                                link.href = URL.createObjectURL(blob);
                                link.download = `${eventTitle.replace(/\s+/g, "_")}_participants.csv`;
                                link.click();
                            });
                    } else {
                        // No tickets, download empty template
                        const csv = [
                            ["Name", "Ticket ID", "Status"],
                            ["No participants yet", "-", "-"]
                        ].map(r => r.join(",")).join("\n");

                        const blob = new Blob([csv], { type: "text/csv" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `${eventTitle.replace(/\s+/g, "_")}_participants.csv`;
                        link.click();
                    }
                });
            });
        })
        .catch(err => {
            console.error("Failed to load events or tickets:", err);
            document.getElementById("analyticsContainer").innerHTML = "<p>Error loading events</p>";
        });

    // Ticket validation
    const validateBtn = document.getElementById("validateBtn");
    const ticketInput = document.getElementById("ticketInput");
    const statusText = document.getElementById("statusText");

    validateBtn.addEventListener("click", () => {
        const ticketId = ticketInput.value.trim();
        if (!ticketId) {
            statusText.textContent = "Please enter a Ticket ID.";
            statusText.style.color = "orange";
            return;
        }

        statusText.textContent = `Validating ticket ${ticketId}...`;
        statusText.style.color = "blue";

        fetch('/tickets/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticketId: ticketId })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || "Validation Failed");
                });
            }
            return response.json();
        })
        .then(data => {
            // Success!
            statusText.textContent = ` ${data.message} (For: ${data.attendeeName})`;
            statusText.style.color = "green";

            // <-- MODIFICATION: Call the update function on success -->
            const eventId = data.ticket.event_id;
            updateAnalyticsCard(eventId);
            
            // Clear input after success
            ticketInput.value = '';
        })
        .catch(error => {
            // Handle errors
            statusText.textContent = ` Error: ${error.message}`;
            statusText.style.color = "red";
        });
    });

    // QR Scanner integration
    try {
        function onScanSuccess(decodedText) {
            ticketInput.value = decodedText;
            validateBtn.click(); // Automatically validate scanned tickets
        }

        const qrReader = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 200 });
        qrReader.render(onScanSuccess);
    } catch (err) {
        console.log("QR Scanner not available:", err);
    }
});