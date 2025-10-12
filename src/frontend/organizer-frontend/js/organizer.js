// Toggle menu dropdown
const dot = document.getElementById('dot');
const menu = document.getElementById('menu');

if (dot && menu) {
    dot.addEventListener('click', () => {
        menu.classList.toggle('open');
    });
}

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        // Temporary feedback (replace with backend logic later)
        alert(`Logging in as: ${email}`);
    });
}

// Handle signup form submission
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('signupEmail')?.value.trim();
        const password = document.getElementById('signupPassword')?.value.trim();

        if (!name || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        // Temporary feedback
        alert(`Signing up as: ${name} (${email})`);
    });
}

// Handle forgot password form submission
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('forgotEmail')?.value.trim();

        if (!email) {
            alert("Please enter your email.");
            return;
        }

        // Temporary feedback
        alert(`Password reset link sent to: ${email}`);
    });
}