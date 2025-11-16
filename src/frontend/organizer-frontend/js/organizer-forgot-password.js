const forgotForm = document.getElementById('forgotPasswordForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email')?.value.trim();

        if (!email) {
            alert('Please enter your email address');
            return;
        }

        // Show success message and redirect to login
        alert('✅ Password reset instructions have been sent to your email');
        window.location.href = 'organizer-login.html';
    });
}

// Menu toggle + logout
document.addEventListener('DOMContentLoaded', () => {
    const dot = document.getElementById('dot');
    const menu = document.getElementById('menu');
    const logoutBtn = document.getElementById('logout-btn-organizer');

    // Toggle menu
    if (dot && menu) {
        dot.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
    }

    // Logout logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            localStorage.removeItem('role');
            localStorage.removeItem('loggedInUser');

            // Send organizer back to main homepage
            window.location.href = '../student-frontend/index.html';
        });
    }
});
