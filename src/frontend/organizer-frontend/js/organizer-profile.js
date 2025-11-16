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

    // Check organization approval status first
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            await checkOrgApprovalStatus(user);
        } catch (e) {
            console.error('Error checking approval status:', e);
        }
    }

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

// Check organization approval status
async function checkOrgApprovalStatus(user) {
    try {
        // Get all organization members
        const membersResponse = await fetch('http://127.0.0.1:5000/organization_members', {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!membersResponse.ok) {
            console.error('Failed to fetch organization members');
            return;
        }
        
        const members = await membersResponse.json();
        const userOrgMember = members.find(m => m.user_id === user.id);
        
        if (!userOrgMember) {
            console.error('User not found in organization members');
            return;
        }
        
        // Get the organization details
        const orgResponse = await fetch(`http://127.0.0.1:5000/organizations/${userOrgMember.organization_id}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!orgResponse.ok) {
            console.error('Failed to fetch organization');
            return;
        }
        
        const org = await orgResponse.json();
        
        // Check if organization is NOT approved
        if (org.status && org.status !== 'approved') {
            showApprovalDialog(org);
        }
    } catch (err) {
        console.error('Error checking organization approval status:', err);
    }
}

// Show approval pending or denied dialog
function showApprovalDialog(org) {
    const modal = document.createElement('div');
    modal.classList.add('approval-modal-overlay');
    
    let title, icon, message, info, isDenied = false;
    
    if (org.status === 'denied') {
        title = 'Account Denied';
        icon = '❌';
        message = 'Your account was denied. Contact customer support for assistance.';
        info = '';
        isDenied = true;
    } else {
        title = 'Account Pending Approval';
        icon = '⏳';
        message = `Your account has been created, but your organization <strong>"${org.title}"</strong> is pending approval by an administrator.`;
        info = 'In the meantime, you can view events, but you won\'t be able to create or edit events until your organization is approved.';
    }
    
    modal.innerHTML = `
        <div class="approval-modal-content">
            <div class="approval-modal-icon">${icon}</div>
            <h2>${title}</h2>
            <p class="approval-message">
                ${message}
            </p>
            ${info ? `<p class="approval-info">${info}</p>` : ''}
            ${isDenied ? '<button class="approval-btn-ok" onclick="logoutDeniedUser()">OK</button>' : '<button class="approval-btn-ok">OK</button>'}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // If denied, disable all page content and make modal non-dismissible
    if (isDenied) {
        const pageContent = document.querySelector('main') || document.querySelector('.dashboard-container');
        if (pageContent) {
            pageContent.style.display = 'none';
        }
        modal.style.pointerEvents = 'auto';
        modal.querySelector('.approval-btn-ok').addEventListener('click', logoutDeniedUser);
    } else {
        modal.querySelector('.approval-btn-ok').addEventListener('click', () => {
            modal.remove();
        });
    }
}

// Logout denied user
function logoutDeniedUser() {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    alert('Your account access has been denied. Please contact customer support.');
    window.location.href = 'organizer-login.html';
}