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
    // Load event analytics
    API.getEvents()
        .then(events => {
            const container = document.getElementById("analyticsContainer");
            events.forEach(event => {
                // Get attendance data for this event
                API.getEventAttendance(event.id)
                    .then(attendance => {
                        const attendanceRate = Math.round((attendance.checked_in / attendance.registered) * 100);
                        const remaining = event.capacity - attendance.registered;

                        const card = document.createElement("div");
                        card.className = "card";
                        card.innerHTML = `
                            <h3>${event.title}</h3>
                            <p class="stat"><b>${attendance.registered} / ${event.capacity}</b><br>
                            <small>Registered Participants</small></p>
                            <p><b>Attendance Rate:</b> ${attendanceRate}%</p>
                            <p><b>Remaining Capacity:</b> ${remaining}</p>
                            <button class="btn-primary download-btn" data-id="${event.id}">Download CSV</button>
                        `;
                        container.appendChild(card);
                    });
            });

            // Handle CSV downloads
            document.addEventListener('click', e => {
                if (e.target.classList.contains('download-btn')) {
                    const eventId = e.target.dataset.id;
                    API.getEventParticipants(eventId)
                        .then(participants => {
                            const csv = [
                                ["Name", "Ticket ID", "Status"],
                                ...participants.map(p => [p.name, p.ticketId, p.status])
                            ].map(r => r.join(",")).join("\n");

                            const blob = new Blob([csv], { type: "text/csv" });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = `event_${eventId}_participants.csv`;
                            link.click();
                        });
                }
            });
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

        API.validateTicket(ticketId)
            .then(result => {
                if (result.valid) {
                    statusText.textContent = `✅ Valid Ticket (${result.attendeeName})`;
                    statusText.style.color = "green";
                } else {
                    statusText.textContent = "❌ Invalid Ticket ID.";
                    statusText.style.color = "red";
                }
            })
            .catch(err => {
                statusText.textContent = "Error validating ticket";
                statusText.style.color = "red";
            });
    });

    // QR Scanner integration
    function onScanSuccess(decodedText) {
        ticketInput.value = decodedText;
        validateBtn.click(); // Automatically validate scanned tickets
    }

    const qrReader = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 200 });
    qrReader.render(onScanSuccess);
});

// Event editing functionality
const eventId = new URLSearchParams(window.location.search).get('id');

if (eventId) {
    API.getEvent(eventId)
        .then(event => {
            document.getElementById('editTitle').value = event.title;
            document.getElementById('editStartDate').value = new Date(event.start_date).toISOString().split('T')[0];
            document.getElementById('editEndDate').value = new Date(event.end_date).toISOString().split('T')[0];
            document.getElementById('editCategory').value = event.category;
            document.getElementById('editCapacity').value = event.capacity || '';
            document.getElementById('editPrice').value = event.price || '';
            document.getElementById('editDescription').value = event.description || '';
        })
        .catch(err => {
            console.error('Failed to load event:', err);
            alert('Could not load event details');
        });
}

const editForm = document.getElementById('editEventForm');
if (editForm) {
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedEvent = {
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            start_date: new Date(document.getElementById('editStartDate').value).toISOString(),
            end_date: new Date(document.getElementById('editEndDate').value).toISOString(),
            category: document.getElementById('editCategory').value,
            capacity: parseInt(document.getElementById('editCapacity').value) || null,
            price: parseFloat(document.getElementById('editPrice').value) || 0
        };

        API.updateEvent(eventId, updatedEvent)
            .then(response => {
                if (response.success) {
                    alert('Event updated successfully');
                    window.location.href = 'organizer-events-list.html';
                } else {
                    alert('Failed to update event: ' + (response.message || 'Please try again'));
                }
            })
            .catch(err => {
                console.error('Update failed:', err);
                alert('Failed to update event');
            });
    });
}

const deleteButton = document.getElementById('deleteEventBtn');
if (deleteButton) {
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this event?')) {
            API.deleteEvent(eventId)
                .then(() => {
                    alert('Event deleted successfully');
                    window.location.href = 'organizer-events-list.html';
                })
                .catch(err => alert('Failed to delete event'));
        }
    });
}

const cancelButton = document.getElementById('cancelBtn');
if (cancelButton) {
    cancelButton.addEventListener('click', () => {
        window.location.href = 'organizer-events-list.html';
    });
}