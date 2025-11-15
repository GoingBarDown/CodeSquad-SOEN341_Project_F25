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
                    
                    // Fetch the user's organization_id from organization_members
                    try {
                        const membersResponse = await fetch('http://127.0.0.1:5000/organization_members', {
                            headers: { 'Content-Type': 'application/json' }
                        });
                        
                        if (membersResponse.ok) {
                            const members = await membersResponse.json();
                            const userOrgMember = members.find(m => m.user_id === response.user.id);
                            
                            if (userOrgMember) {
                                // Update userData with organization_id
                                const userDataWithOrg = {
                                    ...response.user,
                                    organization_id: userOrgMember.organization_id
                                };
                                localStorage.setItem('userData', JSON.stringify(userDataWithOrg));
                                console.log('Added organization_id to userData:', userOrgMember.organization_id);
                            }
                        }
                    } catch (err) {
                        console.warn('Could not fetch organization_id:', err);
                        // Continue anyway, the app will still work but with limited filtering
                    }
                    
                    // Show personalized welcome message
                    const organizerName = response.user.username || 'Organizer';
                    alert(`✅ Welcome back, ${organizerName}! Login successful!`);
                } else {
                    alert('✅ Login successful!');
                }
                
                // Redirect to dashboard
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