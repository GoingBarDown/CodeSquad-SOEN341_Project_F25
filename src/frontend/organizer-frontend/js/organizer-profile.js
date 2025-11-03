// // Toggle dropdown
// document.getElementById('dot').addEventListener('click', () => {
//   document.getElementById('menu').classList.toggle('open');
// });

// // Preview uploaded profile photo
// document.getElementById('fileUpload').addEventListener('change', (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       document.getElementById('profilePic').src = e.target.result;
//     };
//     reader.readAsDataURL(file);
//   }
// });

// // Save form info
// document.getElementById('profileForm').addEventListener('submit', (e) => {
//   e.preventDefault();
//   alert("✅ Profile updated successfully!");
// });


document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profileForm');
    const organizationForm = document.getElementById('organizationForm');
    const createOrgBtn = document.getElementById('createOrgBtn');
    const orgModal = document.getElementById('orgModal');
    const organizationSelect = document.getElementById('organization');
    const fileUpload = document.getElementById('fileUpload');

    // Load user profile
    async function loadProfile() {
        try {
            const response = await API.getProfile();
            if (response.success) {
                // Fill form with profile data
                document.getElementById('displayName').value = response.data.display_name || '';
                document.getElementById('email').value = response.data.email || '';
                document.getElementById('phone').value = response.data.phone || '';
                document.getElementById('bio').value = response.data.bio || '';

                // Update profile picture if exists
                if (response.data.profile_picture) {
                    document.getElementById('profilePic').src = response.data.profile_picture;
                }

                // Load organizations and set selected one if exists
                await loadOrganizations();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            alert('❌ Failed to load profile data');
        }
    }

    // Load organizations for dropdown
    async function loadOrganizations() {
        try {
            const response = await API.getOrganizations();
            if (response.success) {
                organizationSelect.innerHTML = '<option value="">Select or create an organization</option>';
                response.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.title;
                    organizationSelect.appendChild(option);
                });

                // If user has an organization, select it
                if (response.userOrganizationId) {
                    organizationSelect.value = response.userOrganizationId;
                }
            }
        } catch (error) {
            console.error('Error loading organizations:', error);
            alert('❌ Failed to load organizations');
        }
    }

    // Handle profile picture upload
    if (fileUpload) {
        fileUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    alert('❌ File size must be less than 5MB');
                    return;
                }

                try {
                    // Show preview
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('profilePic').src = e.target.result;
                    };
                    reader.readAsDataURL(file);

                    // Upload file
                    const formData = new FormData();
                    formData.append('profile_picture', file);
                    const response = await API.uploadProfilePicture(formData);
                    
                    if (!response.success) {
                        throw new Error(response.message || 'Upload failed');
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    alert(`❌ ${error.message || 'Failed to upload profile picture'}`);
                }
            }
        });
    }

    // Handle profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const profileData = {
                display_name: document.getElementById('displayName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                bio: document.getElementById('bio').value.trim(),
                organization_id: document.getElementById('organization').value || null
            };

            try {
                const response = await API.updateProfile(profileData);
                if (response.success) {
                    alert('✅ Profile updated successfully!');
                } else {
                    throw new Error(response.message || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert(`❌ ${error.message || 'Failed to update profile'}`);
            }
        });
    }

    // Handle organization creation
    if (organizationForm) {
        organizationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const orgData = {
                title: document.getElementById('orgTitle').value.trim(),
                description: document.getElementById('orgDescription').value.trim()
            };

            try {
                const response = await API.createOrganization(orgData);
                if (response.success) {
                    alert('✅ Organization created successfully!');
                    closeOrgModal();
                    await loadOrganizations();
                    organizationSelect.value = response.data.id;
                } else {
                    throw new Error(response.message || 'Failed to create organization');
                }
            } catch (error) {
                console.error('Error creating organization:', error);
                alert(`❌ ${error.message || 'Failed to create organization'}`);
            }
        });
    }

    // Modal controls
    if (createOrgBtn) {
        createOrgBtn.addEventListener('click', () => {
            orgModal.style.display = 'block';
        });
    }

    window.closeOrgModal = () => {
        if (orgModal) {
            orgModal.style.display = 'none';
            organizationForm.reset();
        }
    };

    // Close modal if clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === orgModal) {
            closeOrgModal();
        }
    });

    // Initial load
    loadProfile();
});