// admin-analytics.js

async function loadAnalytics() {
    try {
        // Backend base URL
        const BACKEND_URL = "http://127.0.0.1:5000";

        console.log("Starting analytics load from:", BACKEND_URL);

        // ============================
        // Fetch Events
        // ============================
        console.log("Fetching events...");
        const eventsResponse = await fetch(`${BACKEND_URL}/events`);
        console.log("Events response status:", eventsResponse.status);
        
        if (!eventsResponse.ok) {
            throw new Error(`Events fetch failed with status ${eventsResponse.status}`);
        }
        
        const events = await eventsResponse.json();
        console.log("Events data received:", events);

        const totalEvents = events.length;

        // Your backend returns: status: "published"
        const publishedEvents = events.filter(e =>
            e.status && e.status.toLowerCase() === "published"
        ).length;

        console.log("Total events:", totalEvents, "Published:", publishedEvents);
        document.getElementById("stat-total-events").textContent = totalEvents;
        document.getElementById("stat-published-events").textContent = publishedEvents;


        // ============================
        // Fetch Users and filter by role
        // ============================
        console.log("Fetching users...");
        const usersResponse = await fetch(`${BACKEND_URL}/users`);
        console.log("Users response status:", usersResponse.status);
        
        if (!usersResponse.ok) {
            throw new Error(`Users fetch failed with status ${usersResponse.status}`);
        }
        
        const users = await usersResponse.json();
        console.log("Users data received:", users);

        // Filter students (role = "student")
        const students = users.filter(u => u.role && u.role.toLowerCase() === "student");
        console.log("Students count:", students.length);
        document.getElementById("stat-total-students").textContent = students.length;

        // Filter organizers (role = "organizer")
        const organizers = users.filter(u => u.role && u.role.toLowerCase() === "organizer");
        console.log("Organizers count:", organizers.length);
        document.getElementById("stat-total-organizers").textContent = organizers.length;

    } catch (error) {
        console.error("Error loading analytics:", error);
        console.error("Stack:", error.stack);
    }
}

// Load analytics when page opens
document.addEventListener("DOMContentLoaded", loadAnalytics);
