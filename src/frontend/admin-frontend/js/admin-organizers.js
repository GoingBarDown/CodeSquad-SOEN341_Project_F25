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
  const
