// === AUTHENTICATION CHECK ===
function checkOrganizerAccess() {
    const userData = localStorage.getItem('userData');
    
    if (!userData) {
        alert('❌ Please login first');
        window.location.href = 'organizer-login.html';
        return false;
    }
    
    try {
        const user = JSON.parse(userData);
        
        if (user.role !== 'organizer') {
            alert('❌ You do not have permission to access this page. Only organizers can access this area.');
            window.location.href = '../student-frontend/index.html';
            return false;
        }
        
        return true;
    } catch (e) {
        console.error('Error checking organizer access:', e);
        localStorage.clear();
        window.location.href = 'organizer-login.html';
        return false;
    }
}

// Check access before loading page
if (!checkOrganizerAccess()) {
    throw new Error('Access denied');
}

// Handle login/logout button in menu
document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.querySelector('a[href="organizer-login.html"]');
    const userData = localStorage.getItem('userData');
    
    if (loginLink) {
        if (userData) {
            // User is logged in, change to LOGOUT
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('userData');
                localStorage.removeItem('authToken');
                localStorage.removeItem('selectedProfilePicture');
                window.location.href = 'organizer-login.html';
            };
        } else {
            // User is not logged in, show LOGIN
            loginLink.textContent = 'Login';
            loginLink.href = 'organizer-login.html';
        }
    }
});

// Toggle dropdown
document.getElementById('dot').addEventListener('click', () => {
  document.getElementById('menu').classList.toggle('open');
});

// Load user profile data and setup form
document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profileForm');
    const organizationSelect = document.getElementById('organization');

    // Load user profile
    async function loadProfile() {
        try {
            const userData = localStorage.getItem('userData');
            if (!userData) return;
            
            const user = JSON.parse(userData);
            
            // Fill form with user data from localStorage
            document.getElementById('username').value = user.username || '';
            document.getElementById('firstName').value = user.first_name || '';
            document.getElementById('lastName').value = user.last_name || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('bio').value = user.bio || '';

            // Load organizations and set selected one if exists
            await loadOrganizations(user.organization_id);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // Load organizations for dropdown
    async function loadOrganizations(currentOrgId) {
        try {
            const response = await fetch('http://127.0.0.1:5000/organizations');
            const orgs = await response.json();
            
            organizationSelect.innerHTML = '<option value="">No Organization</option>';
            orgs.forEach(org => {
                const option = document.createElement('option');
                option.value = org.id;
                option.textContent = org.title;
                organizationSelect.appendChild(option);
            });

            // If user has an organization, select it
            if (currentOrgId) {
                organizationSelect.value = currentOrgId;
            }
        } catch (error) {
            console.error('Error loading organizations:', error);
        }
    }

    // Handle profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userData = localStorage.getItem('userData');
            const user = JSON.parse(userData);
            
            const profileData = {
                first_name: document.getElementById('firstName').value.trim(),
                last_name: document.getElementById('lastName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                bio: document.getElementById('bio').value.trim()
            };

            try {
                const response = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileData)
                });

                const result = await response.json();
                
                if (response.ok) {
                    // Update localStorage with new data
                    user.first_name = profileData.first_name;
                    user.last_name = profileData.last_name;
                    user.phone = profileData.phone;
                    user.bio = profileData.bio;
                    localStorage.setItem('userData', JSON.stringify(user));
                    
                    alert('✅ Profile updated successfully!');
                } else {
                    throw new Error(result.error || result.message || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert(`❌ ${error.message || 'Failed to update profile'}`);
            }
        });
    }

    // Initial load
    loadProfile();
});