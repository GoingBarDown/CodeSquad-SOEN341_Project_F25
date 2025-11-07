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