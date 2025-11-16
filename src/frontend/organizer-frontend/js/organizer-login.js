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
                    
                    // Set role to organizer so index.html shows organizer menu
                    localStorage.setItem('role', 'organizer');
                    localStorage.setItem('loggedInUser', response.user.username || 'Organizer');

                    // Personalized welcome message
                    const organizerName = response.user.username || 'Organizer';
                    alert(`✅ Welcome back, ${organizerName}! Login successful!`);
                } else {
                    // fallback
                    localStorage.setItem('role', 'organizer');
                    localStorage.setItem('loggedInUser', 'Organizer');
                    alert('✅ Login successful!');
                }
                
                // Redirect to index.html instead of dashboard
                window.location.href = "../student-frontend/index.html";
            } else {
                throw new Error(response.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(`❌ ${error.message || 'Login failed. Please try again.'}`);
        }
    });
}

;