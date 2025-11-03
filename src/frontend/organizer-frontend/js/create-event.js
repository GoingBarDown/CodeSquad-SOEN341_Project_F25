document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createEventForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventData = {
      title: document.getElementById('title').value,
      start_date: document.getElementById('date').value,
      category: document.getElementById('category').value,
    //   location: document.getElementById('location').value,
      description: document.getElementById('description').value
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Event created successfully!");
        window.location.href = "organizer-dashboard.html";
      } else {
        alert(`❌ Error: ${result.error || "Something went wrong"}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Network error — is the backend running?");
    }
  });
});