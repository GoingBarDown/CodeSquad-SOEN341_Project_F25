document.addEventListener("DOMContentLoaded", () => {
  const dot = document.getElementById("dot");
  const menu = document.getElementById("menu");
  dot.addEventListener("click", () => menu.classList.toggle("open"));

  // Sample Event Analytics Data
  const eventAnalytics = [
    { title: "Robotics Workshop", registered: 120, capacity: 150, attendance: 105 },
    { title: "Guest Lecture: AI", registered: 180, capacity: 200, attendance: 162 },
    { title: "Campus Social Night", registered: 90, capacity: 120, attendance: 76 },
  ];

  // Render analytics cards
  const container = document.getElementById("analyticsContainer");
  eventAnalytics.forEach(event => {
    const attendanceRate = Math.round((event.attendance / event.registered) * 100);
    const remaining = event.capacity - event.registered;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${event.title}</h3>
      <p class="stat"><b>${event.registered} / ${event.capacity}</b><br><small>Registered Participants</small></p>
      <p><b>Attendance Rate:</b> ${attendanceRate}%</p>
      <p><b>Remaining Capacity:</b> ${remaining}</p>
    `;
    container.appendChild(card);
  });

  // Ticket Validation & CSV Export
  const validateBtn = document.getElementById("validateBtn");
  const ticketInput = document.getElementById("ticketInput");
  const statusText = document.getElementById("statusText");
  const exportBtn = document.getElementById("exportBtn");

  const attendees = [
    { name: "Alice Johnson", ticketID: "TCK123", status: "Checked-In" },
    { name: "Bob Smith", ticketID: "TCK124", status: "Pending" },
    { name: "Carla Mendes", ticketID: "TCK125", status: "Checked-In" }
  ];

  validateBtn.addEventListener("click", () => {
    const id = ticketInput.value.trim().toUpperCase();
    const found = attendees.find(a => a.ticketID === id);
    if (!id) {
      statusText.textContent = "Please enter a Ticket ID.";
      statusText.style.color = "orange";
    } else if (found) {
      statusText.textContent = `✅ Valid Ticket (${found.name})`;
      statusText.style.color = "green";
    } else {
      statusText.textContent = "❌ Invalid Ticket ID.";
      statusText.style.color = "red";
    }
  });

  exportBtn.addEventListener("click", () => {
    const csv = [
      ["Name", "Ticket ID", "Status"],
      ...attendees.map(a => [a.name, a.ticketID, a.status])
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "attendees.csv";
    link.click();
  });

  // QR Scanner
  function onScanSuccess(decodedText) {
    ticketInput.value = decodedText;
    statusText.textContent = `Scanned: ${decodedText}`;
    statusText.style.color = "blue";
  }
  const qrReader = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 200 });
  qrReader.render(onScanSuccess);
});
