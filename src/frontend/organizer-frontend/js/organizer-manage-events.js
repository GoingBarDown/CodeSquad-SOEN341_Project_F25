// document.addEventListener("DOMContentLoaded", () => {
//   const dot = document.getElementById("dot");
//   const menu = document.getElementById("menu");
//   dot.addEventListener("click", () => menu.classList.toggle("open"));

//   // 🟣 Sample Event Analytics Data
//   const eventAnalytics = [
//     {
//       title: "Robotics Workshop",
//       registered: 120,
//       capacity: 150,
//       attendance: 105,
//       participants: [
//         { name: "Alice Johnson", ticketID: "RW-001", status: "Checked-In" },
//         { name: "Bob Smith", ticketID: "RW-002", status: "Pending" },
//         { name: "Charlie Davis", ticketID: "RW-003", status: "Checked-In" }
//       ]
//     },
//     {
//       title: "Guest Lecture: AI",
//       registered: 180,
//       capacity: 200,
//       attendance: 162,
//       participants: [
//         { name: "Nina Patel", ticketID: "AI-201", status: "Checked-In" },
//         { name: "Oscar Lee", ticketID: "AI-202", status: "Pending" },
//         { name: "Priya Mehta", ticketID: "AI-203", status: "Checked-In" }
//       ]
//     },
//     {
//       title: "Campus Social Night",
//       registered: 90,
//       capacity: 120,
//       attendance: 76,
//       participants: [
//         { name: "Ethan Ross", ticketID: "SN-301", status: "Checked-In" },
//         { name: "Lara Chen", ticketID: "SN-302", status: "Pending" },
//         { name: "Marco Diaz", ticketID: "SN-303", status: "Checked-In" }
//       ]
//     }
//   ];

//   // 🟢 Render Analytics Cards
//   const container = document.getElementById("analyticsContainer");
//   eventAnalytics.forEach((event, index) => {
//     const attendanceRate = Math.round((event.attendance / event.registered) * 100);
//     const remaining = event.capacity - event.registered;

//     const card = document.createElement("div");
//     card.className = "card";
//     card.innerHTML = `
//       <h3>${event.title}</h3>
//       <p class="stat"><b>${event.registered} / ${event.capacity}</b><br><small>Registered Participants</small></p>
//       <p><b>Attendance Rate:</b> ${attendanceRate}%</p>
//       <p><b>Remaining Capacity:</b> ${remaining}</p>
//       <button class="btn-primary download-btn" data-index="${index}" style="margin-top: 12px;">Download CSV</button>

//     `;
//     container.appendChild(card);
//   });

//   // 🟠 Download Event-specific Participant CSV
//   document.querySelectorAll(".download-btn").forEach(button => {
//     button.addEventListener("click", (e) => {
//       const eventIndex = e.target.dataset.index;
//       const event = eventAnalytics[eventIndex];
//       const csv = [
//         ["Name", "Ticket ID", "Status"],
//         ...event.participants.map(p => [p.name, p.ticketID, p.status])
//       ].map(r => r.join(",")).join("\n");

//       const blob = new Blob([csv], { type: "text/csv" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = `${event.title.replace(/\s+/g, "_")}_participants.csv`;
//       link.click();
//     });
//   });

//   // 🟣 Ticket Validation & Export (shared section)
//   const validateBtn = document.getElementById("validateBtn");
//   const ticketInput = document.getElementById("ticketInput");
//   const statusText = document.getElementById("statusText");

//   const attendees = [
//     { name: "Alice Johnson", ticketID: "TCK123", status: "Checked-In" },
//     { name: "Bob Smith", ticketID: "TCK124", status: "Pending" },
//     { name: "Carla Mendes", ticketID: "TCK125", status: "Checked-In" }
//   ];

//   validateBtn.addEventListener("click", () => {
//     const id = ticketInput.value.trim().toUpperCase();
//     const found = attendees.find(a => a.ticketID === id);
//     if (!id) {
//       statusText.textContent = "Please enter a Ticket ID.";
//       statusText.style.color = "orange";
//     } else if (found) {
//       statusText.textContent = `✅ Valid Ticket (${found.name})`;
//       statusText.style.color = "green";
//     } else {
//       statusText.textContent = "❌ Invalid Ticket ID.";
//       statusText.style.color = "red";
//     }
//   });

//   // 🟢 QR Scanner
//   function onScanSuccess(decodedText) {
//     ticketInput.value = decodedText;
//     statusText.textContent = `Scanned: ${decodedText}`;
//     statusText.style.color = "blue";
//   }

//   const qrReader = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 200 });
//   qrReader.render(onScanSuccess);
// });


document.addEventListener("DOMContentLoaded", () => {
    // Menu toggle
    const dot = document.getElementById("dot");
    const menu = document.getElementById("menu");
    dot.addEventListener("click", () => menu.classList.toggle("open"));

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
                card.innerHTML = `
                    <h3>${event.title}</h3>
                    <p class="stat"><b>${registered} / ${event.capacity}</b><br>
                    <small>Registered Participants</small></p>
                    <p><b>Attendance Rate:</b> ${attendanceRate}%</p>
                    <p><b>Checked In:</b> ${checkedIn} / ${registered}</p>
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

        API.getTicket(ticketId)
            .then(ticket => {
                if (ticket) {
                    statusText.textContent = `✅ Valid Ticket (ID: ${ticket.id}, Status: ${ticket.status})`;
                    statusText.style.color = "green";
                } else {
                    statusText.textContent = "❌ Invalid Ticket ID.";
                    statusText.style.color = "red";
                }
            })
            .catch(err => {
                statusText.textContent = "❌ Invalid Ticket ID.";
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