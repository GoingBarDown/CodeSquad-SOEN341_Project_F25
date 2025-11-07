const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const username = document.getElementById('username')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        const confirmPassword = document.getElementById('confirmPassword')?.value.trim();
        const role = document.getElementById('role')?.value || 'organizer';

        // Validation
        if (!name || !username || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long!");
            return;
        }

        // Username validation
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            alert("Username can only contain letters, numbers, hyphens and underscores!");
            return;
        }

        try {
            console.log('Attempting signup with:', { username, email });
            
            const response = await API.signup({
                username: username,   // Required by backend
                email: email,
                password: password,
                role: role
            });

            console.log('Signup response:', response);
            
            // Backend returns {'message': 'User created', 'id': user_id}
            if (response.message === 'User created' || response.id) {
                alert('✅ Signup successful! Please login with your credentials.');
                window.location.href = 'organizer-login.html';
            } else {
                throw new Error(response.error || response.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            console.error('Error message:', error.message);
            alert(`❌ Signup failed: ${error.message || 'Please try again.'}`);
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