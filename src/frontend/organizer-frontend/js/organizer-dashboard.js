// console.log("✅ Dashboard JS loaded");

// async function loadEvents() {
//   try {
//     const response = await fetch('http://127.0.0.1:5000/events'); // or your backend URL
//     const events = await response.json();
    
//     const container = document.getElementById('eventsList'); // whatever your HTML element is
//     container.innerHTML = '';

//     events.forEach(event => {
//       const div = document.createElement('div');
//       div.classList.add('event-card');
//       div.innerHTML = `
//         <h3>${event.name}</h3>
//         <p>${event.date}</p>
//         <p>${event.description}</p>
//       `;
//       container.appendChild(div);
//     });
//   } catch (error) {
//     console.error('Error loading events:', error);
//   }
// }

// document.addEventListener('DOMContentLoaded', loadEvents);

document.addEventListener('DOMContentLoaded', () => {
    // Load dashboard stats
    API.getEvents()
        .then(events => {
            const totalEvents = events.length;
            const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).length;
            const pastEvents = events.filter(e => new Date(e.start_date) < new Date()).length;
            
            // Update dashboard numbers
            document.getElementById('totalEvents').textContent = totalEvents;
            document.getElementById('upcomingEvents').textContent = upcomingEvents;
            document.getElementById('pastEvents').textContent = pastEvents;
        })
        .catch(err => {
            console.error('Failed to load dashboard:', err);
            alert('Failed to load dashboard statistics');
        });

    // Load organizer profile summary
    API.getProfile()
        .then(profile => {
            document.getElementById('organizerName').textContent = profile.username;
            document.getElementById('organizerEmail').textContent = profile.email;
        })
        .catch(err => console.error('Failed to load profile:', err));

    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.dashboard-menu').classList.toggle('collapsed');
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = 'organizer-login.html';
        });
    }
});