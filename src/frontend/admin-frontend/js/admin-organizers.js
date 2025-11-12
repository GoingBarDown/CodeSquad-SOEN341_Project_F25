document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin Organiser Page Loaded");

  const searchInput = document.getElementById('organiser-search');
  const filterSelect = document.getElementById('filter-options');

  if (searchInput) searchInput.addEventListener('input', applyOrganiserFilters);
  if (filterSelect) filterSelect.addEventListener('change', applyOrganiserFilters);

  applyOrganiserFilters(); // Load once
});

function applyOrganiserFilters() {
  const search = document.getElementById('organiser-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('filter-options')?.value || '';

  console.log("Filters applied:", { search, filter });

  // --- BACKEND CONNECTION WILL REPLACE THIS ---
  // fetch(`/api/organisers?search=${search}&filter=${filter}`)
  //   .then(res => res.json())
  //   .then(renderOrganiserList);

  // For now, empty placeholder list
  renderOrganiserList([]);
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
  // Update existing info card fields
  document.getElementById('info-orgname').textContent = organiser.organization_name || '—';
  document.getElementById('info-email').textContent = organiser.email || '—';
  document.getElementById('info-community').textContent = organiser.community || '—';
  document.getElementById('info-events').textContent = organiser.events_created || '—';

  // Remove placeholder style
  document.querySelectorAll('.info-value').forEach(v => v.classList.remove('placeholder'));
}
