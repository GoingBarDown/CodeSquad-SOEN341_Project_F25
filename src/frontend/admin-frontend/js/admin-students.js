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

let currentStudent = null;

function applyStudentFilters() {
  const search = document.getElementById('student-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('filter-options')?.value || '';

  console.log("Filters applied:", { search, filter });

  // Fetch students from backend using API
  (async () => {
    try {
      const students = await ADMIN_API.getStudents();
      // Filter by role to get only students
      let studentsList = students.filter(user => user.role === 'student');
      
      // Apply search filter (search in username and email)
      if (search) {
        studentsList = studentsList.filter(user => 
          user.username.toLowerCase().includes(search) || 
          user.email.toLowerCase().includes(search)
        );
      }
      
      // Apply sort filter
      if (filter === 'az') {
        studentsList.sort((a, b) => a.username.localeCompare(b.username));
      } else if (filter === 'za') {
        studentsList.sort((a, b) => b.username.localeCompare(a.username));
      }
      
      renderStudentList(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
      const listContainer = document.getElementById('student-list-container');
      if (listContainer) {
        listContainer.innerHTML = `<div class="no-results">Error loading students: ${error.message}</div>`;
      }
    }
  })();
}

function renderStudentList(students) {
  const listContainer = document.getElementById('student-list-container');
  const searchTerm = document.getElementById('student-search')?.value || '';
  
  listContainer.innerHTML = '';

  if (!students || students.length === 0) {
    if (searchTerm) {
      listContainer.innerHTML = `
        <div class="no-results">
          <div style="font-size: 1.2rem; margin-bottom: 10px;">🔍 No students match "${searchTerm}"</div>
          <div style="font-size: 0.9rem; color: #666; line-height: 1.6;">
            Try:<br>
            - Checking your spelling<br>
            - Using different keywords<br>
            - <a href="#" onclick="clearStudentFilters(); return false;" style="color: rgb(151, 9, 21); font-weight: bold;">Clearing your search</a>
          </div>
        </div>
      `;
    } else {
      listContainer.innerHTML = `
        <div class="no-results">
          <div style="font-size: 1.2rem; margin-bottom: 10px;">👥 No students yet</div>
          <div style="font-size: 0.9rem; color: #666;">Get started by creating your first student account!</div>
        </div>
      `;
    }
    return;
  }

  students.forEach(student => {
    const div = document.createElement('div');
    div.classList.add('student-item');
    div.innerHTML = `
      <div class="list-item-name">${student.username}</div>
      <div class="list-item-preview">${student.email || '—'}</div>
    `;
    div.addEventListener('click', () => showStudentDetails(student));
    listContainer.appendChild(div);
  });
}

function showStudentDetails(student) {
  // Store current student for delete function
  currentStudent = student;

  // Update existing info card fields with actual backend data
  document.getElementById('info-firstname').textContent = student.username || '—';
  document.getElementById('info-lastname').textContent = student.id || '—';
  document.getElementById('info-studentid').textContent = student.id || '—';
  document.getElementById('info-email').textContent = student.email || '—';
  document.getElementById('info-password').textContent = student.role || 'Student';
  document.getElementById('info-program').textContent = 'N/A';
  document.getElementById('info-events').textContent = 'N/A';

  // Remove placeholder style
  document.querySelectorAll('.info-value').forEach(v => v.classList.remove('placeholder'));
}

async function deleteCurrentStudent() {
  console.log('deleteCurrentStudent called');
  console.log('currentStudent:', currentStudent);
  
  if (!currentStudent) {
    alert('Please select a student first');
    return;
  }

  if (!confirm(`Are you sure you want to delete student "${currentStudent.username}"? This action cannot be undone.`)) {
    return;
  }

  try {
    console.log('Attempting to delete student with ID:', currentStudent.id);
    await ADMIN_API.deleteStudent(currentStudent.id);
    alert('✅ Student successfully deleted.');
    currentStudent = null;
    applyStudentFilters(); // Refresh the list
  } catch (error) {
    console.error('Error deleting student:', error);
    alert(`❌ Failed to delete student: ${error.message}`);
  }
}

function openEditStudentModal() {
  if (!currentStudent) {
    alert('Please select a student first');
    return;
  }

  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edit Student: ${currentStudent.username}</h2>
      <form id="editStudentForm">
        <label for="editUsername">Username:</label>
        <input type="text" id="editUsername" value="${currentStudent.username || ''}" required />

        <label for="editEmail">Email:</label>
        <input type="email" id="editEmail" value="${currentStudent.email || ''}" required />

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" class="btn-primary">Save Changes</button>
          <button type="button" class="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle form submission
  modal.querySelector('#editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updatedData = {
      username: document.getElementById('editUsername').value,
      email: document.getElementById('editEmail').value
    };

    try {
      // For users, we need to use a PUT endpoint if available
      const response = await fetch(`${ADMIN_API.baseUrl}/users/${currentStudent.id}`, {
        method: 'PUT',
        headers: ADMIN_API.getHeaders(),
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update student');
      }
      
      alert('✅ Student updated successfully!');
      
      // Update local data
      currentStudent = { ...currentStudent, ...updatedData };
      showStudentDetails(currentStudent);
      
      modal.remove();
    } catch (error) {
      console.error('Error updating student:', error);
      alert(`❌ Failed to update student: ${error.message}`);
    }
  });

  // Handle cancel button
  modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function clearStudentFilters() {
  document.getElementById('student-search').value = '';
  document.getElementById('filter-options').value = 'az';
  applyStudentFilters();
}

