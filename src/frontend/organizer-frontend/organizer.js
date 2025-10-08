// 🌸 Organizer JS
// Handles UI interactions and basic form logic

// Toggle menu visibility
const menuBtn = document.getElementById('dot');
const menu = document.getElementById('menu');

menuBtn.addEventListener('click', () => {
    menu.classList.toggle('open');
});

// Handle login form submission
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email.endsWith('@club.concordia.ca')) {
            alert('Please use your organizer email (ending with @club.concordia.ca)');
            return;
        }

        if (email && password) {
            alert(`Welcome, ${email}! Redirecting to Organizer Dashboard...`);
            window.location.href = 'organizer-analytics.html';
        }
    });
}
