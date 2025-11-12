document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin Organiser Page Loaded");

  const searchInput = document.getElementById('organiser-search');
  const filterSelect = document.getElementById('filter-options');

  if (searchInput) searchInput.addEventListener('input', applyOrganiserFilters);
  if (filterSelect) filterSelect.addEventListener('change', applyOrganiserFilters);

  applyOrganiserFilters(); // Load once
});

let currentOrganizer = null;

function applyOrganiserFilters() {
  const search = document.getElementById('organiser-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('filter-options')?.value || '';

  console.log("Filters applied:", { search, filter });

  // Fetch organizers from backend using API
  (async () => {
    try {
      const organizers = await ADMIN_API.getOrganizers(search, filter);
      // Filter by role to get only organizers
      const organizersList = organizers.filter(user => user.role === 'organizer');
      renderOrganiserList(organizersList);
    } catch (error) {
      console.error("Error fetching organizers:", error);
      const listContainer = document.getElementById('organiser-list-container');
      if (listContainer) {
        listContainer.innerHTML = `<div class="no-results">Error loading organizers: ${error.message}</div>`;
      }
    }
  })();
}

function renderOrganiserList(organisers) {
  const listContainer = document.getElementById('organiser-list-container');
  listContainer.innerHTML = '';

  if (!organisers || organisers.length === 0) {
    listContainer.innerHTML = `<div class="no-results">No organisers found.</div>`;
    return;
  }

  organisers.forEach(organiser => {
    const div = document.createElement('div');
    div.classList.add('organiser-item');
    div.textContent = `${organiser.username || organiser.email}`;
    div.addEventListener('click', () => showOrganiserDetails(organiser));
    listContainer.appendChild(div);
  });
}

function showOrganiserDetails(organiser) {
  // Store current organizer for delete function
  currentOrganizer = organiser;

  // Update existing info card fields with actual backend data
  document.getElementById('info-orgname').textContent = organiser.username || '—';
  document.getElementById('info-email').textContent = organiser.email || '—';
  document.getElementById('info-community').textContent = organiser.role || '—';
  document.getElementById('info-events').textContent = 'N/A';

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
    
    const updatedData = {
      username: document.getElementById('editUsername').value,
      email: document.getElementById('editEmail').value
    };

    try {
      // For users, we need to use a PUT endpoint if available
      const response = await fetch(`${ADMIN_API.baseUrl}/users/${currentOrganizer.id}`, {
        method: 'PUT',
        headers: ADMIN_API.getHeaders(),
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update organizer');
      }
      
      alert('✅ Organizer updated successfully!');
      
      // Update local data
      currentOrganizer = { ...currentOrganizer, ...updatedData };
      showOrganiserDetails(currentOrganizer);
      
      modal.remove();
    } catch (error) {
      console.error('Error updating organizer:', error);
      alert(`❌ Failed to update organizer: ${error.message}`);
    }
  });

  // Handle cancel button
  modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}