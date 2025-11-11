document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin Student Page Loaded");

  // === ELEMENT REFERENCES ===
  const searchInput = document.getElementById('student-search');
  const filterSelect = document.getElementById('filter-options');

  // Attach listeners
  if (searchInput) searchInput.addEventListener('input', applyStudentFilters);
  if (filterSelect) filterSelect.addEventListener('change', applyStudentFilters);

  // Initial load
  applyStudentFilters();
});

function applyStudentFilters() {
  const search = document.getElementById('student-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('filter-options')?.value || '';

  console.log("Filters applied:", { search, filter });

  // --- Backend will hook in here ---
  // fetch(`/api/students?search=${search}&filter=${filter}`)
  //   .then(res => res.json())
  //   .then(renderStudentList);

  // For now, placeholder empty list
  renderStudentList([]);
}

function renderStudentList(students) {
  const listContainer = document.getElementById('student-list-container');
  listContainer.innerHTML = '';

  if (!students || students.length === 0) {
    listContainer.innerHTML = `<div class="no-results">No students found.</div>`;
    return;
  }

  students.forEach(student => {
    const div = document.createElement('div');
    div.classList.add('student-item');
    div.textContent = `${student.firstName} ${student.lastName}`;
    div.addEventListener('click', () => showStudentDetails(student));
    listContainer.appendChild(div);
  });
}

function showStudentDetails(student) {
  // Update existing info card fields instead of replacing HTML
  document.getElementById('info-firstname').textContent = student.firstName || '—';
  document.getElementById('info-lastname').textContent = student.lastName || '—';
  document.getElementById('info-studentid').textContent = student.id || '—';
  document.getElementById('info-email').textContent = student.email || '—';
  document.getElementById('info-password').textContent = '••••••••'; // Hide actual password
  document.getElementById('info-program').textContent = student.program || '—';
  document.getElementById('info-events').textContent = student.eventsAttended || '—';

  // Remove placeholder style
  document.querySelectorAll('.info-value').forEach(v => v.classList.remove('placeholder'));
}

