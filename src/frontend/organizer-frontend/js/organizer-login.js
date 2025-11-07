const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = document.getElementById('identifier')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!identifier || !password) {
            alert("❌ Please fill in all fields.");
            return;
        }

        try {
            // Determine if identifier is email or username
            const isEmail = identifier.includes('@');
            
            const loginData = {
                [isEmail ? 'email' : 'username']: identifier,
                password: password
            };

            const response = await API.login(loginData);

            if (response.message === 'Authenticated' || response.user) {
                // Store auth data
                if (response.user) {
                    localStorage.setItem('userData', JSON.stringify(response.user));
                    localStorage.setItem('authToken', response.user.id);
                }
                
                // Redirect to dashboard with success message
                alert('✅ Login successful!');
                window.location.href = 'organizer-dashboard.html';
            } else {
                throw new Error(response.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(`❌ ${error.message || 'Login failed. Please try again.'}`);
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