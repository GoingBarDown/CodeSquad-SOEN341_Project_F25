// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('createEventForm');

//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const eventData = {
//       title: document.getElementById('title').value,
//       start_date: document.getElementById('date').value,
//       category: document.getElementById('category').value,
//     //   location: document.getElementById('location').value,
//       description: document.getElementById('description').value
//     };

//     try {
//       const response = await fetch("http://127.0.0.1:5000/events", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(eventData)
//       });

//       const result = await response.json();

//       if (response.ok) {
//         alert("✅ Event created successfully!");
//         window.location.href = "organizer-dashboard.html";
//       } else {
//         alert(`❌ Error: ${result.error || "Something went wrong"}`);
//       }
//     } catch (error) {
//       console.error(error);
//       alert("❌ Network error — is the backend running?");
//     }
//   });
// });

const createEventForm = document.getElementById('createEventForm');
if (createEventForm) {
    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Collect all form data
            const eventData = {
                title: document.getElementById('title').value.trim(),
                description: document.getElementById('description').value.trim(),
                start_date: new Date(document.getElementById('startDate').value).toISOString(),
                end_date: new Date(document.getElementById('endDate').value).toISOString(),
                category: document.getElementById('category').value,
                location: document.getElementById('location').value.trim(),
                capacity: parseInt(document.getElementById('capacity').value) || null,
                price: parseFloat(document.getElementById('price').value) || 0,
                link: document.getElementById('link').value.trim() || null,
                seating: document.getElementById('seating').value.trim() || null,
                status: document.getElementById('status').value
            };

            // Validate dates
            if (new Date(eventData.start_date) >= new Date(eventData.end_date)) {
                throw new Error('End date must be after start date');
            }

            // Validate price and capacity
            if (eventData.price < 0) {
                throw new Error('Price cannot be negative');
            }
            if (eventData.capacity !== null && eventData.capacity <= 0) {
                throw new Error('Capacity must be a positive number');
            }

            console.log('Sending event data:', eventData);

            // Call API to create event
            const response = await API.createEvent(eventData);
            
            // If we get here without an error, the event was created successfully
            alert('✅ Event created successfully!');
            window.location.href = 'organizer-dashboard.html';
        } catch (error) {
            console.error('Create event error:', error);
            alert(`❌ Error: ${error.message || 'Failed to create event. Please try again.'}`);
        }
    });
}

// Menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const dot = document.getElementById('dot');
    if (dot) {
        dot.addEventListener('click', () => {
            const menu = document.getElementById('menu');
            if (menu) menu.classList.toggle('open');
        });
    }
});