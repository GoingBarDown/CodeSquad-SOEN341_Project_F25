const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = document.getElementById('identifier')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!identifier || !password) {
            alert("❌ Please fill in all fields.");
            return;
        }

        try {
            const loginData = {
                username: identifier,
                password: password
            };

            console.log('Sending login request with:', loginData);
            const response = await fetch(`http://127.0.0.1:5000/users/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                alert(`Login failed: ${data.error || 'Unknown error'}`);
                return;
            }

            // Store whatever we got back
            localStorage.setItem('userData', JSON.stringify(data.user || data));
            localStorage.setItem('authToken', data.user?.id || data.id || 'token');
            
            console.log('Data stored, now redirecting...');
            setTimeout(() => {
                window.location.href = 'events.html';
            }, 100);
            
        } catch (error) {
            console.error('Login error:', error);
            alert(`Error: ${error.message}\n\nMake sure the backend server is running on http://127.0.0.1:5000`);
        }
    });
}
