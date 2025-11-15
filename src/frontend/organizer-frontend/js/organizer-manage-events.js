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

    // Check organization approval status and show dialog if needed
    if (userData) {
        try {
            const user = JSON.parse(userData);
            checkOrgApprovalStatus(user);
        } catch (e) {
            console.error('Error checking approval status:', e);
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
            // Get the current organizer and organization info
            const userData = localStorage.getItem('userData');
            let currentOrganzerId = null;
            let currentOrgId = null;
            
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    currentOrganzerId = user.id;
                    currentOrgId = user.organization_id;
                } catch (e) {
                    console.error('Error getting user info:', e);
                }
            }
            
            // Filter events to only show those created by current organizer or organization
            const filteredEvents = events.filter(event => {
                // Show if organizer created it
                if (event.organizer_id === currentOrganzerId) {
                    return true;
                }
                // Show if same organization
                if (event.organization_id && currentOrgId && event.organization_id === currentOrgId) {
                    return true;
                }
                return false;
            });
            
            if (!filteredEvents || filteredEvents.length === 0) {
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

            filteredEvents.forEach(event => {
                // Get real ticket data for this event
                const eventTickets = ticketsByEvent[event.id] || [];
                const registered = eventTickets.length;
                const checkedIn = eventTickets.filter(t => t.status === 'checked-in').length;
                const attendanceRate = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;
                const remaining = event.capacity - registered;

                const card = document.createElement("div");
                card.className = "card";
                card.setAttribute('data-event-id', event.id); //add event ID to the card

                // Determine status display
                const status = event.status || 'draft';
                const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
                const statusClass = `status-${status.toLowerCase()}`;

                // Add unique IDs to the stat spans
                card.innerHTML = `
                    <h3>${event.title}</h3>
                    <span class="event-status ${statusClass}">${statusDisplay}</span>
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

// Check organization approval status
async function checkOrgApprovalStatus(user) {
    try {
        // Get all organization members
        const membersResponse = await fetch('http://127.0.0.1:5000/organization_members', {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!membersResponse.ok) {
            console.error('Failed to fetch organization members');
            return;
        }
        
        const members = await membersResponse.json();
        const userOrgMember = members.find(m => m.user_id === user.id);
        
        if (!userOrgMember) {
            console.error('User not found in organization members');
            return;
        }
        
        // Get the organization details
        const orgResponse = await fetch(`http://127.0.0.1:5000/organizations/${userOrgMember.organization_id}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!orgResponse.ok) {
            console.error('Failed to fetch organization');
            return;
        }
        
        const org = await orgResponse.json();
        
        // Check if organization is NOT approved
        if (org.status && org.status !== 'approved') {
            showApprovalDialog(org);
        }
    } catch (err) {
        console.error('Error checking organization approval status:', err);
    }
}

// Show approval pending or denied dialog
function showApprovalDialog(org) {
    const modal = document.createElement('div');
    modal.classList.add('approval-modal-overlay');
    
    let title, icon, message, info, isDenied = false;
    
    if (org.status === 'denied') {
        title = 'Account Denied';
        icon = '❌';
        message = 'Your account was denied. Contact customer support for assistance.';
        info = '';
        isDenied = true;
    } else {
        title = 'Account Pending Approval';
        icon = '⏳';
        message = `Your account has been created, but your organization <strong>"${org.title}"</strong> is pending approval by an administrator.`;
        info = 'In the meantime, you can view events, but you won\'t be able to create or edit events until your organization is approved.';
    }
    
    modal.innerHTML = `
        <div class="approval-modal-content">
            <div class="approval-modal-icon">${icon}</div>
            <h2>${title}</h2>
            <p class="approval-message">
                ${message}
            </p>
            ${info ? `<p class="approval-info">${info}</p>` : ''}
            ${isDenied ? '<button class="approval-btn-ok" onclick="logoutDeniedUser()">OK</button>' : '<button class="approval-btn-ok">OK</button>'}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // If denied, disable all page content and make modal non-dismissible
    if (isDenied) {
        const pageContent = document.querySelector('main') || document.querySelector('.dashboard-container');
        if (pageContent) {
            pageContent.style.display = 'none';
        }
        modal.style.pointerEvents = 'auto';
        modal.querySelector('.approval-btn-ok').addEventListener('click', logoutDeniedUser);
    } else {
        modal.querySelector('.approval-btn-ok').addEventListener('click', () => {
            modal.remove();
        });
    }
}

// Logout denied user
function logoutDeniedUser() {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    alert('Your account access has been denied. Please contact customer support.');
    window.location.href = 'organizer-login.html';
}