console.log("✅ Dashboard JS loaded");

async function loadEvents() {
  try {
    const response = await fetch('http://127.0.0.1:5000/events'); // or your backend URL
    const events = await response.json();
    
    const container = document.getElementById('eventsList'); // whatever your HTML element is
    container.innerHTML = '';

    events.forEach(event => {
      const div = document.createElement('div');
      div.classList.add('event-card');
      div.innerHTML = `
        <h3>${event.name}</h3>
        <p>${event.date}</p>
        <p>${event.description}</p>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadEvents);
