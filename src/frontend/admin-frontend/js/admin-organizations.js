document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin Organizations Page Loaded");

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

  const welcomeMessage = document.getElementById('welcome-message');
if (welcomeMessage) {
    welcomeMessage.style.display = 'block';
}

  const searchInput = document.getElementById('organization-search');
  const filterSelect = document.getElementById('filter-options');

  if (searchInput) searchInput.addEventListener('input', applyOrganizationFilters);
  if (filterSelect) filterSelect.addEventListener('change', applyOrganizationFilters);

  applyOrganizationFilters(); // Load once
});

let currentOrganization = null;
let organizationMembers = {}; // Map of organization_id to member count

function applyOrganizationFilters() {
  const search = document.getElementById('organization-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('filter-options')?.value || '';

  console.log("Filters applied:", { search, filter });

  // Fetch organizations from backend using API
  (async () => {
    try {
      const organizations = await ADMIN_API.getOrganizations();
      const members = await ADMIN_API.getOrganizationMembers();
      
      // Count members per organization
      organizationMembers = {};
      members.forEach(member => {
        if (!organizationMembers[member.organization_id]) {
          organizationMembers[member.organization_id] = 0;
        }
        organizationMembers[member.organization_id]++;
      });
      
      let organizationsList = Array.isArray(organizations) ? organizations : [];
      
      // Apply search filter
      if (search) {
        organizationsList = organizationsList.filter(org => {
          const title = org.title || '';
          const description = org.description || '';
          return title.toLowerCase().includes(search) || description.toLowerCase().includes(search);
        });
      }
      
      // Apply sort filter
      if (filter === 'az') {
        organizationsList.sort((a, b) => {
          const titleA = a.title || '';
          const titleB = b.title || '';
          return titleA.localeCompare(titleB);
        });
      } else if (filter === 'za') {
        organizationsList.sort((a, b) => {
          const titleA = a.title || '';
          const titleB = b.title || '';
          return titleB.localeCompare(titleA);
        });
      }
      
      renderOrganizationList(organizationsList);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      const listContainer = document.getElementById('organization-list-container');
      if (listContainer) {
        listContainer.innerHTML = `<div class="no-results">Error loading organizations: ${error.message}</div>`;
      }
    }
  })();
}

function renderOrganizationList(organizations) {
  const listContainer = document.getElementById('organization-list-container');
  const searchTerm = document.getElementById('organization-search')?.value || '';
  
  listContainer.innerHTML = '';

  if (!organizations || organizations.length === 0) {
    if (searchTerm) {
      listContainer.innerHTML = `
        <div class="no-results">
          <div style="font-size: 1.2rem; margin-bottom: 10px;">🔍 No organizations match "${searchTerm}"</div>
          <div style="font-size: 0.9rem; color: #666; line-height: 1.6;">
            Try:<br>
            - Checking your spelling<br>
            - Using different keywords<br>
            - <a href="#" onclick="clearOrganizationFilters(); return false;" style="color: rgb(151, 9, 21); font-weight: bold;">Clearing your search</a>
          </div>
        </div>
      `;
    } else {
      listContainer.innerHTML = `
        <div class="no-results">
          <div style="font-size: 1.2rem; margin-bottom: 10px;">🏢 No organizations yet</div>
          <div style="font-size: 0.9rem; color: #666;">Get started by having organizers create organizations!</div>
        </div>
      `;
    }
    return;
  }

  organizations.forEach(org => {
    const div = document.createElement('div');
    div.classList.add('organiser-item');
    div.innerHTML = `
      <div class="list-item-name">${org.title || org.id}</div>
      <div class="list-item-preview">${org.status || 'pending'}</div>
    `;
    div.addEventListener('click', () => showOrganizationDetails(org));
    listContainer.appendChild(div);
  });
}

function showOrganizationDetails(org) {
  // Store current organization for delete function
  currentOrganization = org;

  // Update info card fields
  document.getElementById('info-id').textContent = org.id || '—';
  document.getElementById('info-name').textContent = org.title || '—';
  document.getElementById('info-description').textContent = org.description || '—';
  document.getElementById('info-status').textContent = org.status || 'pending';
  document.getElementById('info-members').textContent = organizationMembers[org.id] || 0;
  document.getElementById('info-events').textContent = 'N/A';

  // Show/hide buttons based on organization status
  const approveBtn = document.querySelector('button[onclick="approveOrganization()"]');
  const denyBtn = document.querySelector('button[onclick="denyOrganization()"]');
  const editBtn = document.querySelector('button[onclick="openEditOrganizationModal()"]');
  const deleteBtn = document.querySelector('button[onclick="deleteCurrentOrganization()"]');
  
  const status = org.status;
  
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
  // No organization or other status: show all buttons
  else {
    if (approveBtn) approveBtn.style.display = 'block';
    if (denyBtn) denyBtn.style.display = 'block';
    if (editBtn) editBtn.style.display = 'block';
    if (deleteBtn) deleteBtn.style.display = 'block';
  }

  // Remove placeholder style
  document.querySelectorAll('.info-value').forEach(v => v.classList.remove('placeholder'));
}

async function approveOrganization() {
  if (!currentOrganization) {
    alert('Please select an organization first');
    return;
  }

  if (!confirm(`Approve organization "${currentOrganization.title}"?`)) {
    return;
  }

  try {
    await ADMIN_API.updateOrganizationStatus(currentOrganization.id, 'approved');
    alert('Organization approved successfully!');
    currentOrganization.status = 'approved';
    showOrganizationDetails(currentOrganization);
    applyOrganizationFilters(); // Refresh list
  } catch (error) {
    alert(`Error approving organization: ${error.message}`);
  }
}

async function denyOrganization() {
  if (!currentOrganization) {
    alert('Please select an organization first');
    return;
  }

  if (!confirm(`Deny organization "${currentOrganization.title}"?`)) {
    return;
  }

  try {
    await ADMIN_API.updateOrganizationStatus(currentOrganization.id, 'denied');
    alert('Organization denied successfully!');
    currentOrganization.status = 'denied';
    showOrganizationDetails(currentOrganization);
    applyOrganizationFilters(); // Refresh list
  } catch (error) {
    alert(`Error denying organization: ${error.message}`);
  }
}

async function deleteCurrentOrganization() {
  if (!currentOrganization) {
    alert('Please select an organization first');
    return;
  }

  if (!confirm(`Are you sure you want to delete organization "${currentOrganization.title}"? This action cannot be undone.`)) {
    return;
  }

  try {
    await fetch(`${ADMIN_API.baseUrl}/organizations/${currentOrganization.id}`, {
      method: 'DELETE',
      headers: ADMIN_API.getHeaders()
    });
    alert('Organization deleted successfully!');
    currentOrganization = null;
    applyOrganizationFilters(); // Refresh list
    
    // Clear info panel
    document.getElementById('info-name').textContent = 'Select an organization';
    document.getElementById('info-name').classList.add('placeholder');
    document.querySelectorAll('.info-value').forEach(v => {
      if (v.id !== 'info-name') {
        v.textContent = '—';
        v.classList.add('placeholder');
      }
    });
  } catch (error) {
    alert(`Error deleting organization: ${error.message}`);
  }
}

async function openEditOrganizationModal() {
  if (!currentOrganization) {
    alert('Please select an organization first');
    return;
  }

  try {
    // Fetch fresh organization data
    const org = currentOrganization;

    // Create modal
    const modalId = 'editOrgModal';
    let modal = document.getElementById(modalId);

    if (modal) {
      modal.remove();
    }

    // Create modal container with overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = modalId;
    
    const statusSelected_pending = org.status === 'pending' ? 'selected' : '';
    const statusSelected_approved = org.status === 'approved' ? 'selected' : '';
    const statusSelected_denied = org.status === 'denied' ? 'selected' : '';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #e0e0e0;">
        <h2 style="color: rgb(151, 9, 21); margin: 0; font-size: 1.5rem;">Edit Organization</h2>
        <button type="button" class="close-btn" onclick="closeEditOrgModal()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666;">&times;</button>
      </div>

      <form id="editOrgForm">
        <label for="editOrgName">Organization Name:</label>
        <input type="text" id="editOrgName" value="${org.title ? org.title.replace(/"/g, '&quot;') : ''}" required />

        <label for="editOrgDescription">Description:</label>
        <textarea id="editOrgDescription" rows="4">${org.description ? org.description.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</textarea>

        <label for="editOrgStatus">Status:</label>
        <select id="editOrgStatus" required>
          <option value="pending" ${statusSelected_pending}>Pending</option>
          <option value="approved" ${statusSelected_approved}>Approved</option>
          <option value="denied" ${statusSelected_denied}>Denied</option>
        </select>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
          <button type="button" onclick="closeEditOrgModal()" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);
    
    const form = document.getElementById('editOrgForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedData = {
        title: document.getElementById('editOrgName').value.trim(),
        description: document.getElementById('editOrgDescription').value.trim(),
        status: document.getElementById('editOrgStatus').value
      };

      try {
        await ADMIN_API.updateOrganization(org.id, updatedData);
        alert('Organization updated successfully!');
        closeEditOrgModal();
        
        // Update current organization and refresh
        currentOrganization = { ...org, ...updatedData };
        showOrganizationDetails(currentOrganization);
        applyOrganizationFilters();
      } catch (error) {
        alert(`Error updating organization: ${error.message}`);
      }
    });

  } catch (error) {
    alert(`Error loading organization: ${error.message}`);
  }
}

function closeEditOrgModal() {
  const modal = document.getElementById('editOrgModal');
  if (modal) {
    modal.remove();
  }
}

function clearOrganizationFilters() {
  document.getElementById('organization-search').value = '';
  document.getElementById('filter-options').value = 'az';
  applyOrganizationFilters();
}

// Close modal when clicking outside (on overlay)
document.addEventListener('click', (e) => {
  const modal = document.getElementById('editOrgModal');
  if (modal && e.target === modal) {
    closeEditOrgModal();
  }
});

// ===== MANAGE MEMBERS FUNCTIONALITY =====

async function openManageMembersModal() {
  if (!currentOrganization) {
    alert('Please select an organization first');
    return;
  }

  try {
    // Fetch all users and organization members
    const allUsers = await ADMIN_API.getStudents();
    const allOrganizers = await ADMIN_API.getOrganizers();
    const allOrgUsers = [...allUsers, ...allOrganizers];
    
    const allMembers = await ADMIN_API.getOrganizationMembers();
    const currentMembers = allMembers.filter(m => m.organization_id === currentOrganization.id);
    const memberUserIds = new Set(currentMembers.map(m => m.user_id));

    // Create modal
    const modalId = 'manageMembersModal';
    let modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = modalId;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.maxWidth = '600px';
    
    // Build members list HTML
    let membersHTML = '<div style="margin-bottom: 20px;">';
    if (currentMembers.length === 0) {
      membersHTML += '<p style="color: #999; font-style: italic;">No members in this organization yet.</p>';
    } else {
      membersHTML += '<h3 style="margin-bottom: 10px; color: #333;">Current Members:</h3>';
      membersHTML += '<ul style="list-style: none; padding: 0; margin: 0;">';
      currentMembers.forEach(member => {
        const user = allOrgUsers.find(u => u.id === member.user_id);
        const username = user ? user.username : `User ${member.user_id}`;
        membersHTML += `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
            <span style="font-weight: 500;">${username}</span>
            <button type="button" onclick="removeOrgMember(${currentOrganization.id}, ${member.user_id})" class="event-action-button btn-delete" style="margin: 0; padding: 8px 12px; font-size: 0.85rem;">Remove</button>
          </li>
        `;
      });
      membersHTML += '</ul>';
    }
    membersHTML += '</div>';

    // Build add members section
    let addMembersHTML = '<div style="border-top: 2px solid #e0e0e0; padding-top: 20px;">';
    addMembersHTML += '<h3 style="margin-bottom: 10px; color: #333;">Add Members:</h3>';
    addMembersHTML += '<div id="availableUsersList" style="border: 1px solid #ddd; border-radius: 6px; padding: 10px; max-height: 250px; overflow-y: auto; margin-bottom: 15px; background-color: #f9f9f9;">';
    
    const availableUsers = allOrgUsers.filter(u => !memberUserIds.has(u.id));
    if (availableUsers.length === 0) {
      addMembersHTML += '<p style="color: #999; font-style: italic;">All users are already members.</p>';
    } else {
      availableUsers.forEach(user => {
        addMembersHTML += `
          <label style="display: flex; align-items: center; padding: 8px; cursor: pointer; margin: 0; border-bottom: 1px solid #eee;">
            <input type="checkbox" class="memberCheckbox" value="${user.id}" style="margin-right: 10px; cursor: pointer;" />
            <span>${user.username} <span style="color: #999; font-size: 0.85rem;">(${user.email})</span></span>
          </label>
        `;
      });
    }
    addMembersHTML += '</div>';
    addMembersHTML += `<button type="button" onclick="addMultipleOrgMembers(${currentOrganization.id})" class="event-action-button btn-approve" style="width: 100%; padding: 10px; margin: 0;">Add Selected Members</button>`;
    addMembersHTML += '</div>';

    modalContent.innerHTML = `
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #e0e0e0;">
        <h2 style="color: rgb(151, 9, 21); margin: 0; font-size: 1.5rem;">Manage Members - ${currentOrganization.title}</h2>
        <button type="button" class="close-btn" onclick="closeManageMembersModal()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666; padding: 0;">&times;</button>
      </div>
      ${membersHTML}
      ${addMembersHTML}
      <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
        <button type="button" onclick="closeManageMembersModal()" class="btn-cancel">Close</button>
      </div>
    `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

  } catch (error) {
    alert(`Error loading members: ${error.message}`);
    console.error(error);
  }
}

async function addOrgMember(organizationId) {
  const select = document.getElementById('addMemberSelect');
  const userId = select.value;

  if (!userId) {
    alert('Please select a user to add');
    return;
  }

  try {
    await ADMIN_API.addOrganizationMember(organizationId, parseInt(userId));
    alert('Member added successfully!');
    closeManageMembersModal();
    applyOrganizationFilters(); // Refresh to update member count
    openManageMembersModal(); // Reopen to show updated list
  } catch (error) {
    alert(`Error adding member: ${error.message}`);
  }
}

async function addMultipleOrgMembers(organizationId) {
  const checkboxes = document.querySelectorAll('.memberCheckbox:checked');
  const selectedUserIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

  if (selectedUserIds.length === 0) {
    alert('Please select at least one user to add');
    return;
  }

  try {
    // Add all selected members
    for (const userId of selectedUserIds) {
      await ADMIN_API.addOrganizationMember(organizationId, userId);
    }
    
    alert(`${selectedUserIds.length} member(s) added successfully!`);
    closeManageMembersModal();
    applyOrganizationFilters(); // Refresh to update member count
    openManageMembersModal(); // Reopen to show updated list
  } catch (error) {
    alert(`Error adding members: ${error.message}`);
  }
}

async function removeOrgMember(organizationId, userId) {
  if (!confirm('Are you sure you want to remove this member?')) {
    return;
  }

  try {
    await ADMIN_API.removeOrganizationMember(organizationId, userId);
    alert('Member removed successfully!');
    applyOrganizationFilters(); // Refresh to update member count
    openManageMembersModal(); // Reopen to show updated list
  } catch (error) {
    alert(`Error removing member: ${error.message}`);
  }
}

function closeManageMembersModal() {
  const modal = document.getElementById('manageMembersModal');
  if (modal) {
    modal.remove();
  }
}

// Close manage members modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('manageMembersModal');
  if (modal && e.target === modal) {
    closeManageMembersModal();
  }
});
