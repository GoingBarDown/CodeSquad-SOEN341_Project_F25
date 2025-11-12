const dot=document.getElementById('dot');
const menu=document.getElementById('menu');
dot.onclick=()=>{
  const isOpen=menu.classList.toggle('open');
  dot.innerHTML=isOpen?'&#8211;':'&#8801;';}
  //minus and menu symbols

  //to load student's tickets
  async function loadStudentTickets() {
  try {
    
    const response = await fetch('/api/student/me/tickets'); 
    
    if (!response.ok) throw new Error("Failed to fetch tickets");
    
    const tickets = await response.json();
    const ticketListContainer = document.getElementById("ticket-list-container");
    
    if (!ticketListContainer) {
      console.error("Error: #ticket-list-container not found in HTML.");
      return;
    }

    if (tickets.length === 0) {
      ticketListContainer.innerHTML = '<p>You have no tickets yet.</p>';
      return;
    }

    // Clear loading text
    ticketListContainer.innerHTML = '';

    // Create a card for each ticket
    tickets.forEach(ticket => {
      const ticketElement = document.createElement('div');
      ticketElement.className = 'ticket-card'; // Add a class for styling
      
      // Use the new /qr endpoint for the image src
      ticketElement.innerHTML = `
        <h4>Event ID: ${ticket.event_id}</h4> 
        <p>Ticket ID: ${ticket.id}</p>
        <p>Status: ${ticket.status}</p>
        <img src="/tickets/${ticket.id}/qr" alt="Ticket QR Code">
      `;
      // To-do: You'll want to fetch event details to show the Event Name
      
      ticketListContainer.appendChild(ticketElement);
    });

  } catch (error) {
    console.error("Error loading student tickets:", error);
    const ticketListContainer = document.getElementById("ticket-list-container");
    if(ticketListContainer) {
      ticketListContainer.innerHTML = '<p style="color: red;">Could not load tickets.</p>';
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch('/api/student/me'); // for logged-in user
    if (!response.ok) throw new Error("Failed to fetch student profile");

    const student = await response.json();

    document.getElementById("student-name").textContent = student.name || "N/A";
    document.getElementById("student-email").textContent = student.email || "N/A";
    document.getElementById("student-password").textContent = "********"; // Don't show real password
    document.getElementById("student-id").textContent = student.id || "N/A";
    document.getElementById("student-program").textContent = student.program || "N/A";

  } catch (error) {
    console.error("Error loading student profile:", error);
  }
  loadStudentTickets();
});
