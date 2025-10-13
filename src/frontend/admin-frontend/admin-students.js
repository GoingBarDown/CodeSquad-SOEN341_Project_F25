document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin Student Page Loaded");

  // Attach filter + search listeners
  const searchInput = document.querySelector('.student-search');
  const yearFilter = document.querySelector('.filter-year');
  const statusFilter = document.querySelector('.filter-status');
  const eventsFilter = document.querySelector('.filter-events');

  if (searchInput) searchInput.addEventListener('input', applyStudentFilters);
  if (yearFilter) yearFilter.addEventListener('change', applyStudentFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyStudentFilters);
  if (eventsFilter) eventsFilter.addEventListener('change', applyStudentFilters);

  applyStudentFilters(); // initial load
});

function applyStudentFilters() {
  const search = document.querySelector('.student-search')?.value.toLowerCase() || '';
  const year = document.querySelector('.filter-year')?.value || '';
  const status = document.querySelector('.filter-status')?.value || '';
  const events = document.querySelector('.filter-events')?.value || '';

  console.log("Filters applied:", { search, year, status, events });

  // --- Backend dev will hook in here ---
  // fetch(`/api/students?search=${search}&year=${year}&status=${status}`)
  //   .then(res => res.json())
  //   .then(renderStudentList);

  renderStudentList([]); // empty placeholder
}

function renderStudentList(students) {
  const listContainer = document.querySelector('.student-list-container');
  listContainer.innerHTML = '';

  if (!students || students.length === 0) {
    listContainer.innerHTML = `<div class="no-results">No students found.</div>`;
    return;
  }

  students.forEach(student => {
    const div = document.createElement('div');
    div.classList.add('student-card');
    div.innerHTML = `
      <h3>${student.firstName} ${student.lastName}</h3>
      <p>${student.email}</p>
    `;
    div.addEventListener('click', () => showStudentDetails(student));
    listContainer.appendChild(div);
  });
}

function showStudentDetails(student) {
  const infoView = document.querySelector('.student-info');
  infoView.innerHTML = `
    <div class="info-card">
      <h2>${student.firstName} ${student.lastName}</h2>
      <p><strong>ID:</strong> ${student.id}</p>
      <p><strong>Email:</strong> ${student.email}</p>
      <p><strong>Status:</strong> ${student.status}</p>
      <p><strong>Events Attended:</strong> ${student.eventsAttended}</p>
      <p><strong>Year:</strong> ${student.year}</p>
    </div>
  `;
}
