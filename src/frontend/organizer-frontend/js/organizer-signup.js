// Load organizations on page load
document.addEventListener('DOMContentLoaded', async () => {
    const organizationSelect = document.getElementById('organization');
    const createOrgBtn = document.getElementById('createOrgBtn');
    const newOrgContainer = document.getElementById('newOrgContainer');
    
    // Load existing organizations (only approved ones)
    try {
        const response = await fetch('http://127.0.0.1:5000/organizations', {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const organizations = await response.json();
            // Filter to only show approved organizations
            const approvedOrgs = organizations.filter(org => org.status === 'approved');
            approvedOrgs.forEach(org => {
                const option = document.createElement('option');
                option.value = org.id;
                option.textContent = org.title;
                organizationSelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Failed to load organizations:', err);
    }
    
    // Toggle new organization form
    if (createOrgBtn) {
        createOrgBtn.addEventListener('click', (e) => {
            e.preventDefault();
            newOrgContainer.classList.toggle('active');
            organizationSelect.value = '';
        });
    }
});

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName')?.value.trim();
        const lastName = document.getElementById('lastName')?.value.trim();
        const username = document.getElementById('username')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const studentId = document.getElementById('studentId')?.value.trim();
        const organizationId = document.getElementById('organization')?.value;
        const newOrgName = document.getElementById('newOrgName')?.value.trim();
        const newOrgDesc = document.getElementById('newOrgDesc')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        const confirmPassword = document.getElementById('confirmPassword')?.value.trim();
        const role = document.getElementById('role')?.value || 'organizer';

        // Validation
        if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
            alert("Please fill in all required fields.");
            return;
        }

        if (!organizationId && !newOrgName) {
            alert("Please select or create an organization.");
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
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            alert("Username can only contain letters, numbers and underscores!");
            return;
        }

        try {
            console.log('Attempting signup with:', { firstName, lastName, username, email });
            
            // Step 1: Create the user account
            const response = await API.signup({
                first_name: firstName,
                last_name: lastName,
                username: username,
                email: email,
                password: password,
                role: role,
                student_id: studentId || null
            });

            console.log('Signup response:', response);
            
            if (response.message === 'User created' || response.id) {
                const userId = response.id;
                let finalOrgId = organizationId;
                
                // Step 2: Create new organization if needed
                if (newOrgName) {
                    try {
                        const orgResponse = await fetch('http://127.0.0.1:5000/organizations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: newOrgName,
                                description: newOrgDesc || ''
                            })
                        });
                        
                        if (orgResponse.ok) {
                            const orgData = await orgResponse.json();
                            finalOrgId = orgData.id || orgData.organization_id;
                            console.log('New organization created:', finalOrgId);
                        }
                    } catch (err) {
                        console.error('Failed to create organization:', err);
                    }
                }
                
                // Step 3: Add user to organization
                if (finalOrgId) {
                    try {
                        await fetch('http://127.0.0.1:5000/organization-members', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                organization_id: finalOrgId,
                                user_id: userId
                            })
                        });
                        console.log('User added to organization');
                    } catch (err) {
                        console.error('Failed to add user to organization:', err);
                    }
                }
                
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