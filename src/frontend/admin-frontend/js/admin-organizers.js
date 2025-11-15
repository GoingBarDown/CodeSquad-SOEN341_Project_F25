document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin Organiser Page Loaded");

  // Display welcome message with admin name
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      const adminNameEl = document.getElementById('admin-name');
      if (adminNameEl && user.username) {
        adminNameEl.textContent = user.username;
      }
    } catch (e) {
      console.error('Error getting admin name:', e);
    }
  }

  // Hide welcome message after 5 minutes or if user has visited before
  const welcomeMessage = document.getElementById('welcome-message');
if (welcomeMessage) {
    welcomeMessage.style.display = 'block';
}

  const searchInput = document.getElementById('organiser-search');
  const filterSelect = document.getElementById('filter-options');
  const orgFilter = document.getElementById('filter-org'); 


  if (searchInput) searchInput.addEventListener('input', applyOrganiserFilters);
  if (filterSelect) filterSelect.addEventListener('change', applyOrganiserFilters);
  if (orgFilter) orgFilter.addEventListener('change', applyOrganiserFilters);

  applyOrganiserFilters(); // Load once
});

let currentOrganizer = null;
let organizationData = {}; // Map of organizer user_id to organization


function applyOrganiserFilters() {
  const search = document.getElementById('organiser-search')?.value.toLowerCase() || '';
  const sortFilter = document.getElementById('filter-options')?.value || '';

  (async () => {
    try {
      let organizers = await ADMIN_API.getOrganizers();
      let organizersList = organizers.filter(user => user.role === 'organizer');

      const organizations = await ADMIN_API.getOrganizations();
      const members = await ADMIN_API.getOrganizationMembers();

      // ---- STEP 1: POPULATE ORGANIZATION DROPDOWN BEFORE READING IT ----
      const orgFilterSelect = document.getElementById('filter-org');
      if (orgFilterSelect) {
        const previousValue = orgFilterSelect.value; // save user's selection

        orgFilterSelect.innerHTML = `<option value="">Organization</option>`;
        const uniqueOrgs = [...new Set(organizations.map(org => org.title))];

        uniqueOrgs.forEach(title => {
          const opt = document.createElement('option');
          opt.value = title;
          opt.textContent = title;
          orgFilterSelect.appendChild(opt);
        });

        // Restore previous selection
        orgFilterSelect.value = previousValue;
      }

      // NOW read the selected org
      const orgFilter = orgFilterSelect?.value || '';

      // ---- STEP 2: BUILD MAP organizer → organization ----
      organizationData = {};
      members.forEach(member => {
        const org = organizations.find(o => o.id === member.organization_id);
        if (org) organizationData[member.user_id] = org;
      });

      // ---- STEP 3: APPLY ORG FILTER ----
      if (orgFilter) {
        organizersList = organizersList.filter(user => {
          const org = organizationData[user.id];
          return org?.title === orgFilter;
        });
      }

      // ---- STEP 4: SEARCH FILTER ----
      if (search) {
        organizersList = organizersList.filter(user =>
          user.username.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        );
      }

      // ---- STEP 5: SORT ----
      if (sortFilter === 'az') {
        organizersList.sort((a, b) => a.username.localeCompare(b.username));
      } else if (sortFilter === 'za') {
        organizersList.sort((a, b) => b.username.localeCompare(a.username));
      }

      // ---- STEP 6: RENDER ----
      renderOrganiserList(organizersList);

    } catch (error) {
      console.error("Error fetching organizers:", error);
      const listContainer = document.getElementById('organiser-list-container');
      if (listContainer) {
        listContainer.innerHTML =
          `<div class="no-results">Error loading organizers: ${error.message}</div>`;
      }
    }
  })();
}



function renderOrganiserList(organisers) {
  const listContainer = document.getElementById('organiser-list-container');
  const searchTerm = document.getElementById('organiser-search')?.value || '';
  
  listContainer.innerHTML = '';

  if (!organisers || organisers.length === 0) {
    if (searchTerm) {
      listContainer.innerHTML = `
        <div class="no-results">
          <div style="font-size: 1.2rem; margin-bottom: 10px;">🔍 No organizers match "${searchTerm}"</div>
          <div style="font-size: 0.9rem; color: #666; line-height: 1.6;">
            Try:<br>
            - Checking your spelling<br>
            - Using different keywords<br>
            - <a href="#" onclick="clearOrganizerFilters(); return false;" style="color: rgb(151, 9, 21); font-weight: bold;">Clearing your search</a>
          </div>
        </div>
      `;
    } else {
      listContainer.innerHTML = `
        <div class="no-results">
          <div style="font-size: 1.2rem; margin-bottom: 10px;">🏢 No organizers yet</div>
          <div style="font-size: 0.9rem; color: #666;">Get started by creating your first organizer account!</div>
        </div>
      `;
    }
    return;
  }

  organisers.forEach(organiser => {
    const div = document.createElement('div');
    div.classList.add('organiser-item');
    div.innerHTML = `
      <div class="list-item-name">${organiser.username || organiser.email}</div>
      <div class="list-item-preview">${organiser.email || '—'}</div>
    `;
    div.addEventListener('click', () => showOrganiserDetails(organiser));
    listContainer.appendChild(div);
  });
}

function showOrganiserDetails(organiser) {
  // Store current organizer for delete function
  currentOrganizer = organiser;

  // Update existing info card fields with actual backend data
  document.getElementById('info-id').textContent = organiser.id || '—';
  document.getElementById('info-orgname').textContent = organiser.username || '—';
  document.getElementById('info-email').textContent = organiser.email || '—';
  
  // Display organization name instead of role
  const org = organizationData[organiser.id];
  const orgName = org?.title || '—';
  document.getElementById('info-community').textContent = orgName;
  
  document.getElementById('info-status').textContent = org?.status || 'pending';
  document.getElementById('info-events').textContent = 'N/A';

  // Show/hide buttons based on organization status
  const approveBtn = document.querySelector('button[onclick="approveOrganizer()"]');
  const denyBtn = document.querySelector('button[onclick="denyOrganizer()"]');
  const editBtn = document.querySelector('button[onclick="openEditOrganizerModal()"]');
  const deleteBtn = document.querySelector('button[onclick="deleteCurrentOrganizer()"]');
  
  const status = org?.status;
  
  // If pending: show Approve/Deny, hide Edit/Delete
  if (status === 'pending') {
    if (approveBtn) approveBtn.style.display = 'block';
    if (denyBtn) denyBtn.style.display = 'block';
    if (editBtn) editBtn.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'none';
  } 
  // If approved or denied: hide Approve/Deny, show Edit/Delete
  else if (status === 'approved' || status === 'denied') {
    if (approveBtn) approveBtn.style.display = 'none';
    if (denyBtn) denyBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'block';
    if (deleteBtn) deleteBtn.style.display = 'block';
  }
  // No organization or other status: show Edit/Delete and approve buttons
  else {
    if (approveBtn) approveBtn.style.display = 'block';
    if (denyBtn) denyBtn.style.display = 'block';
    if (editBtn) editBtn.style.display = 'block';
    if (deleteBtn) deleteBtn.style.display = 'block';
  }

  // Remove placeholder style
  document.querySelectorAll('.info-value').forEach(v => v.classList.remove('placeholder'));
}

async function deleteCurrentOrganizer() {
  console.log('deleteCurrentOrganizer called');
  console.log('currentOrganizer:', currentOrganizer);
  
  if (!currentOrganizer) {
    alert('Please select an organizer first');
    return;
  }

  if (!confirm(`Are you sure you want to delete organizer "${currentOrganizer.username}"? This action cannot be undone.`)) {
    return;
  }

  try {
    console.log('Attempting to delete organizer with ID:', currentOrganizer.id);
    await ADMIN_API.deleteOrganizer(currentOrganizer.id);
    alert('✅ Organizer successfully deleted.');
    currentOrganizer = null;
    document.getElementById('organiser-info').innerHTML = `
      <div style="color: #aaa; text-align: center; padding: 20px; font-size: 14px;">
        Select an organizer to view details
      </div>
    `;
    applyOrganiserFilters(); // Refresh the list
  } catch (error) {
    console.error('Error deleting organizer:', error);
    alert(`❌ Failed to delete organizer: ${error.message}`);
  }
}

function openEditOrganizerModal() {
  if (!currentOrganizer) {
    alert('Please select an organizer first');
    return;
  }

  const org = organizationData[currentOrganizer.id];
  const orgName = org?.title || '—';
  const orgDesc = org?.description || '';

  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edit Organizer: ${currentOrganizer.username}</h2>
      <form id="editOrganizerForm">
        <label for="editUsername">Username:</label>
        <input type="text" id="editUsername" value="${currentOrganizer.username || ''}" required />

        <label for="editEmail">Email:</label>
        <input type="email" id="editEmail" value="${currentOrganizer.email || ''}" required />

        <label for="editOrgName">Organization Name:</label>
        <input type="text" id="editOrgName" value="${orgName || ''}" ${!org ? 'disabled' : ''} />
        ${!org ? '<small style="color: #999;">Organization will be created when approved</small>' : ''}

        <label for="editOrgDesc">Organization Description:</label>
        <textarea id="editOrgDesc" ${!org ? 'disabled' : ''} placeholder="Brief description of the organization">${orgDesc || ''}</textarea>
        ${!org ? '<small style="color: #999;">Organization will be created when approved</small>' : ''}

        <label>Assign Role:</label>
        <div style="display: flex; gap: 15px; margin: 10px 0 20px 0; padding: 12px; background: #f5f5f5; border-radius: 6px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0;">
            <input type="radio" name="editRole" value="student" ${currentOrganizer.role === 'student' ? 'checked' : ''} required />
            <span style="font-weight: 500;">Student</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0;">
            <input type="radio" name="editRole" value="organizer" ${currentOrganizer.role === 'organizer' ? 'checked' : ''} required />
            <span style="font-weight: 500;">Organizer</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0;">
            <input type="radio" name="editRole" value="admin" ${currentOrganizer.role === 'admin' ? 'checked' : ''} required />
            <span style="font-weight: 500;">Admin</span>
          </label>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" class="btn-primary">Save Changes</button>
          <button type="button" class="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle form submission
  modal.querySelector('#editOrganizerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    
    // Validation
    if (!username) {
      alert('❌ Username cannot be empty');
      return;
    }
    if (!email) {
      alert('❌ Email cannot be empty');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('❌ Please enter a valid email address');
      return;
    }
    
    // Get selected role from radio buttons
    const role = document.querySelector('input[name="editRole"]:checked').value;
    
    const updatedData = {
      username,
      email,
      role: role
    };

    try {
      // Update organizer (user)
      const response = await fetch(`${ADMIN_API.baseUrl}/users/${currentOrganizer.id}`, {
        method: 'PUT',
        headers: ADMIN_API.getHeaders(),
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update organizer');
      }
      
      // Update organization if it exists
      const org = organizationData[currentOrganizer.id];
      if (org) {
        const newOrgName = document.getElementById('editOrgName').value.trim();
        const newOrgDesc = document.getElementById('editOrgDesc').value.trim();
        
        const orgUpdates = {};
        if (newOrgName && newOrgName !== org.title) {
          orgUpdates.title = newOrgName;
        }
        if (newOrgDesc !== (org.description || '')) {
          orgUpdates.description = newOrgDesc;
        }
        
        if (Object.keys(orgUpdates).length > 0) {
          const orgResponse = await fetch(`${ADMIN_API.baseUrl}/organizations/${org.id}`, {
            method: 'PUT',
            headers: ADMIN_API.getHeaders(),
            body: JSON.stringify(orgUpdates)
          });
          
          if (!orgResponse.ok) {
            const data = await orgResponse.json();
            throw new Error(data.error || 'Failed to update organization');
          }
          
          org.title = newOrgName || org.title;
          org.description = newOrgDesc;
          organizationData[currentOrganizer.id] = org;
        }
      }
      
      alert('✅ Changes saved successfully!');
      
      // Update local data
      currentOrganizer = { ...currentOrganizer, ...updatedData };
      showOrganiserDetails(currentOrganizer);
      
      modal.remove();
    } catch (error) {
      console.error('Error updating organizer:', error);
      alert(`❌ Failed to save changes: ${error.message}`);
    }
  });

  // Handle cancel button
  modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function clearOrganizerFilters() {
  document.getElementById('organiser-search').value = '';
  document.getElementById('filter-options').value = 'az';
  document.getElementById('filter-org').value = '';
  applyOrganiserFilters();
}

// --- Approval Functions ---
async function approveOrganizer() {
  if (!currentOrganizer) {
    alert('Please select an organizer first');
    return;
  }

  let org = organizationData[currentOrganizer.id];
  let orgName = org?.title || currentOrganizer.username;
  
  // If no organization exists, prompt for organization name
  if (!org) {
    // Create modal to input organization name
    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Create Organization for ${currentOrganizer.username}</h2>
        <form id="createOrgForm">
          <label for="orgTitle">Organization Name:</label>
          <input type="text" id="orgTitle" value="${currentOrganizer.username}" required />

          <label for="orgDesc">Organization Description:</label>
          <textarea id="orgDesc" placeholder="Brief description of the organization"></textarea>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn-primary">Create & Approve</button>
            <button type="button" class="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    modal.querySelector('#createOrgForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const orgTitle = document.getElementById('orgTitle').value.trim();
      const orgDesc = document.getElementById('orgDesc').value.trim();

      if (!orgTitle) {
        alert('Organization name is required');
        return;
      }

      try {
        console.log('Creating organization:', { title: orgTitle, description: orgDesc });
        const orgResponse = await fetch(`${ADMIN_API.baseUrl}/organizations`, {
          method: 'POST',
          headers: ADMIN_API.getHeaders(),
          body: JSON.stringify({
            title: orgTitle,
            description: orgDesc,
            status: 'pending'
          })
        });
        
        const orgData = await orgResponse.json();
        if (!orgResponse.ok) {
          throw new Error(orgData.error || 'Failed to create organization');
        }
        
        const newOrgId = orgData.id;
        
        // Create organization member link
        const memberResponse = await fetch(`${ADMIN_API.baseUrl}/organization_members`, {
          method: 'POST',
          headers: ADMIN_API.getHeaders(),
          body: JSON.stringify({
            organization_id: newOrgId,
            user_id: currentOrganizer.id
          })
        });
        
        if (!memberResponse.ok) {
          throw new Error('Failed to link organizer to organization');
        }
        
        org = {
          id: newOrgId,
          title: orgTitle,
          description: orgDesc,
          status: 'pending'
        };
        organizationData[currentOrganizer.id] = org;
        
        modal.remove();
        
        // Now approve the organization
        await ADMIN_API.updateOrganizationStatus(org.id, 'approved');
        alert('✅ Organization created and organizer approved successfully!');
        
        // Update local data
        org.status = 'approved';
        organizationData[currentOrganizer.id] = org;
        
        // Refresh display
        showOrganiserDetails(currentOrganizer);
      } catch (error) {
        console.error('Error creating organization:', error);
        alert(`❌ Failed to create organization: ${error.message}`);
      }
    });

    // Handle cancel button
    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    return;
  }

  // If organization already exists, just approve it
  try {
    await ADMIN_API.updateOrganizationStatus(org.id, 'approved');
    alert('✅ Organizer approved successfully!');
    
    // Update local data
    org.status = 'approved';
    organizationData[currentOrganizer.id] = org;
    
    // Refresh display
    showOrganiserDetails(currentOrganizer);
  } catch (error) {
    console.error('Error approving organizer:', error);
    alert(`❌ Failed to approve organizer: ${error.message}`);
  }
}

async function denyOrganizer() {
  if (!currentOrganizer) {
    alert('Please select an organizer first');
    return;
  }

  let org = organizationData[currentOrganizer.id];
  let orgName = org?.title || currentOrganizer.username;
  
  // If no organization exists, prompt for organization name
  if (!org) {
    // Create modal to input organization name
    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Create Organization for ${currentOrganizer.username}</h2>
        <form id="createOrgForm">
          <label for="orgTitle">Organization Name:</label>
          <input type="text" id="orgTitle" value="${currentOrganizer.username}" required />

          <label for="orgDesc">Organization Description:</label>
          <textarea id="orgDesc" placeholder="Brief description of the organization"></textarea>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn-primary">Create & Deny</button>
            <button type="button" class="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    modal.querySelector('#createOrgForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const orgTitle = document.getElementById('orgTitle').value.trim();
      const orgDesc = document.getElementById('orgDesc').value.trim();

      if (!orgTitle) {
        alert('Organization name is required');
        return;
      }

      try {
        console.log('Creating organization:', { title: orgTitle, description: orgDesc });
        const orgResponse = await fetch(`${ADMIN_API.baseUrl}/organizations`, {
          method: 'POST',
          headers: ADMIN_API.getHeaders(),
          body: JSON.stringify({
            title: orgTitle,
            description: orgDesc,
            status: 'pending'
          })
        });
        
        const orgData = await orgResponse.json();
        if (!orgResponse.ok) {
          throw new Error(orgData.error || 'Failed to create organization');
        }
        
        const newOrgId = orgData.id;
        
        // Create organization member link
        const memberResponse = await fetch(`${ADMIN_API.baseUrl}/organization_members`, {
          method: 'POST',
          headers: ADMIN_API.getHeaders(),
          body: JSON.stringify({
            organization_id: newOrgId,
            user_id: currentOrganizer.id
          })
        });
        
        if (!memberResponse.ok) {
          throw new Error('Failed to link organizer to organization');
        }
        
        org = {
          id: newOrgId,
          title: orgTitle,
          description: orgDesc,
          status: 'pending'
        };
        organizationData[currentOrganizer.id] = org;
        
        modal.remove();
        
        // Now deny the organization
        await ADMIN_API.updateOrganizationStatus(org.id, 'denied');
        alert('✅ Organization created and organizer denied successfully!');
        
        // Update local data
        org.status = 'denied';
        organizationData[currentOrganizer.id] = org;
        
        // Refresh display
        showOrganiserDetails(currentOrganizer);
      } catch (error) {
        console.error('Error creating organization:', error);
        alert(`❌ Failed to create organization: ${error.message}`);
      }
    });

    // Handle cancel button
    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    return;
  }

  if (!confirm('Are you sure you want to deny this organizer?')) {
    return;
  }

  try {
    await ADMIN_API.updateOrganizationStatus(org.id, 'denied');
    alert('✅ Organizer denied successfully!');
    
    // Update local data
    org.status = 'denied';
    organizationData[currentOrganizer.id] = org;
    
    // Refresh display
    showOrganiserDetails(currentOrganizer);
  } catch (error) {
    console.error('Error denying organizer:', error);
    alert(`❌ Failed to deny organizer: ${error.message}`);
  }
}