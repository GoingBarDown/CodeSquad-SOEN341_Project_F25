// --- Toggle Menu ---
document.getElementById('dot').addEventListener('click', () => {
  document.getElementById('menu').classList.toggle('open');
});

// --- Sample Data ---
const events = [
  {
    name: "Music Night",
    date: "2025-10-28",
    participants: [
      { name: "Alice Johnson", checkedIn: false },
      { name: "David Chen", checkedIn: true },
      { name: "Sofia Martinez", checkedIn: false }
    ]
  },
  {
    name: "Career Fair 2025",
    date: "2025-11-05",
    participants: [
      { name: "John Smith", checkedIn: false },
      { name: "Fatima Rahman", checkedIn: false },
      { name: "Omar El-Sayed", checkedIn: true }
    ]
  }
];

// --- Render Events ---
const container = document.getElementById("eventContainer");

function renderEvents() {
  container.innerHTML = "";
  events.forEach((event, index) => {
    const card = document.createElement("div");
    card.classList.add("eventCard");
    card.innerHTML = `
      <h3>${event.name}</h3>
      <p><strong>Date:</strong> ${event.date}</p>
      <table style="width:100%; margin-top:10px; border-collapse:collapse;">
        <thead>
          <tr style="text-align:left;">
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${event.participants.map((p, i) => `
            <tr>
              <td>${p.name}</td>
              <td>
                <button onclick="toggleCheckIn(${index}, ${i})" 
                        class="btn-primary" 
                        style="padding:4px 8px; font-size:0.85rem;">
                  ${p.checkedIn ? "Checked In" : "Check In"}
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    container.appendChild(card);
  });
}
renderEvents();

// --- Toggle Check-in ---
function toggleCheckIn(eventIndex, participantIndex) {
  const participant = events[eventIndex].participants[participantIndex];
  participant.checkedIn = !participant.checkedIn;
  renderEvents();
}

// --- Download CSV ---
document.getElementById("downloadCSV").addEventListener("click", () => {
  let csvContent = "Event,Participant,Checked In\n";
  events.forEach(event => {
    event.participants.forEach(p => {
      csvContent += `${event.name},${p.name},${p.checkedIn ? "Yes" : "No"}\n`;
    });
  });
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "attendance_list.csv";
  link.click();
});
