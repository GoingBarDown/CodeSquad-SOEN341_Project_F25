// --- Mock Event Data ---
// We use this to test our logic until the backend API is ready.
// We need two examples: one free, one paid.

const MOCK_EVENT_FREE = {
    id: "evt-001",
    title: "Cybersecurity Workshop",
    price: 0, // This is a free event
    isPaid: false
};

const MOCK_EVENT_PAID = {
    id: "evt-002",
    title: "Spring Gala & Networking Event",
    price: 25.00, // This is a paid event
    isPaid: true 
};

// --- CONFIGURATION ---
// Change this to test the two different flows
const CURRENT_EVENT = MOCK_EVENT_PAID; 
// const CURRENT_EVENT = MOCK_EVENT_FREE; 

// Base URL for the backend API
const API_BASE_URL = 'http://127.0.0.1:5000/api';


// --- Main Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load the event details onto the page
    loadEventDetails(CURRENT_EVENT);

    // 2. Attach the click listener to the claim button
    const claimButton = document.getElementById('claim-ticket-btn');
    if (claimButton) {
        claimButton.addEventListener('click', () => {
            handleClaimTicket(CURRENT_EVENT);
        });
    }

    // 3. Attach listener for the mobile menu
    const dot = document.getElementById('dot');
    const menu = document.getElementById('menu');
    if (dot && menu) {
        dot.onclick = () => {
            menu.classList.toggle('open');
        }
    }
});

/**
 * Loads the mock event data into the HTML
 */
function loadEventDetails(event) {
    const container = document.getElementById('event-details-container');
    const button = document.getElementById('claim-ticket-btn');

    let priceText = event.isPaid ? `$${event.price.toFixed(2)}` : 'FREE';

    container.innerHTML = `
        <h1 style="font-family: 'Poller One', sans-serif;">${event.title}</h1>
        <p style="font-size: 1.5rem; font-weight: bold;">Price: ${priceText}</p>
        <p>Event ID: ${event.id}</p>
    `;
    
    // Update button text
    if (event.isPaid) {
        button.textContent = "Proceed to Payment";
    } else {
        button.textContent = "Claim Free Ticket";
    }
}

/**
 * This is the main function for your task.
 * It checks if the event is free or paid and calls the correct function.
 */
function handleClaimTicket(event) {
    if (event.isPaid) {
        // If it's a paid event, redirect to the payment flow
        redirectToPayment(event);
    } else {
        // If it's a free event, send the POST request
        claimFreeTicket(event);
    }
}

/**
 * Task 1: Redirect flow for PAID events
 */
function redirectToPayment(event) {
    const notificationArea = document.getElementById('notification-area');
    notificationArea.textContent = "Redirecting to payment processor...";
    notificationArea.style.color = "blue";
    
    // In a real app, this would redirect to a Stripe, PayPal, or Moneris page.
    // For this sprint, we redirect to a simple placeholder page.
    
    setTimeout(() => {
    localStorage.setItem("selectedEvent", JSON.stringify(event)); 
    window.location.href = "payment.html";
}, 1500);
}

/**
 * Task 2: POST request for FREE claims
 */
async function claimFreeTicket(event) {
    const claimButton = document.getElementById('claim-ticket-btn');
    const notificationArea = document.getElementById('notification-area');
    
    // Disable button to prevent multiple clicks
    claimButton.disabled = true;
    claimButton.textContent = "Processing...";
    notificationArea.style.color = "blue";
    notificationArea.textContent = "Attempting to claim your ticket...";

    // --- BACKEND HOOK ---
    // This is the logic that calls the backend (Task BE-4.2)
    // We will simulate it for now.
    
    try {
        // --- UNCOMMENT THIS BLOCK WHEN BACKEND IS READY ---
        /*
        const response = await fetch(`${API_BASE_URL}/tickets/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // We'll need to send an Auth token when login is working
                // 'Authorization': `Bearer ${YOUR_AUTH_TOKEN}` 
            },
            body: JSON.stringify({
                eventId: event.id
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ticket claim failed. Please try again.');
        }

        const ticketData = await response.json();
        */
        // --- END OF BACKEND BLOCK ---

        // --- SIMULATION (Delete when backend is ready) ---
        // Simulate a 2-second network delay
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        const ticketData = { 
            ticketId: "sim-ticket-12345", 
            eventId: event.id, 
            eventName: event.title 
        };
        // --- END OF SIMULATION ---

        // SUCCESS!
        notificationArea.style.color = "green";
        notificationArea.textContent = "Success! Your ticket has been claimed.";

        // Redirect to the "My Ticket" page (Task FE-S2.2)
        setTimeout(() => {
            // We pass the new ticket ID to the next page via URL
            window.location.href = `my-ticket.html?ticketId=${ticketData.ticketId}`;
        }, 1500);

    } catch (err) {
        // ERROR!
        console.error('Ticket Claim Error:', err);
        notificationArea.style.color = "red";
        notificationArea.textContent = `Error: ${err.message}`;
        claimButton.disabled = false;
        claimButton.textContent = "Claim Free Ticket";
    }
}
