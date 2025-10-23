document.addEventListener("DOMContentLoaded", () => {
  const dot = document.getElementById("dot");
  const menu = document.getElementById("menu");
  dot.addEventListener("click", () => menu.classList.toggle("open"));

  // 🟣 Event Analytics Data (EMPTY STATE)
  const eventAnalytics = []; // ← no dummy events

  // 🟢 Render Analytics Cards
  const container = document.getElementById("analyticsContainer");
  if (eventAnalytics.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "No events added yet.";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.fontSize = "1.1rem";
    emptyMsg.style.color = "#555";
    container.appendChild(emptyMsg);
  } else {
    eventAnalytics.forEach((event, index) => {
      const attendanceRate = Math.round((event.attendance / event.registered) * 100);
      const remaining = event.capacity - event.registered;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${event.title}</h3>
        <p class="stat"><b>${event.registered} / ${event.capacity}</b><br><small>Registered Participants</small></p>
        <p><b>Attendance Rate:</b> ${attendanceRate}%</p>
        <p><b>Remaining Capacity:</b> ${remaining}</p>
        <button class="btn-primary download-btn" data-index="${index}" style="margin-top: 12px;">Download CSV</button>
      `;
      container.appendChild(card);
    });
  }

  // 🟠 Download Event-specific Participant CSV
  document.querySelectorAll(".download-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const eventIndex = e.target.dataset.index;
      const event = eventAnalytics[eventIndex];
      if (!event || !event.participants) {
        alert("No participant data available.");
        return;
      }

      const csv = [
        ["Name", "Ticket ID", "Status"],
        ...event.participants.map(p => [p.name, p.ticketID, p.status])
      ].map(r => r.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${event.title.replace(/\s+/g, "_")}_participants.csv`;
      link.click();
    });
  });

  // 🟣 Ticket Validation & Export (shared section)
  const validateBtn = document.getElementById("validateBtn");
  const ticketInput = document.getElementById("ticketInput");
  const statusText = document.getElementById("statusText");

  const attendees = []; // start empty, no dummy ticket list

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

  // 🟢 QR Scanner
  function onScanSuccess(decodedText) {
    ticketInput.value = decodedText;
    statusText.textContent = `Scanned: ${decodedText}`;
    statusText.style.color = "blue";
  }

  const qrReader = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 200 });
  qrReader.render(onScanSuccess);
});

