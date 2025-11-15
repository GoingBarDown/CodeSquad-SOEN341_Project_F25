document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin Student Page Loaded");

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
  const lastWelcomeTime = localStorage.getItem('lastWelcomeTime');
  const now = Date.now();
  
  if (welcomeMessage) {
    // If they've visited a dashboard page before, hide the welcome immediately
    if (lastWelcomeTime) {
      welcomeMessage.style.display = 'none';
    } else {
      // First time - show welcome, then hide after 5 minutes (300000ms)
      localStorage.setItem('lastWelcomeTime', now);
      setTimeout(() => {
        welcomeMessage.style.display = 'none';
      }, 300000);
    }
  }

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
  // Backend returns snake_case, so use correct field names
  document.getElementById('info-firstname').textContent = student.first_name || student.username || '—';
  document.getElementById('info-lastname').textContent = student.last_name || '—';
  document.getElementById('info-studentid').textContent = student.student_id || student.id || '—';
  document.getElementById('info-email').textContent = student.email || '—';
  document.getElementById('info-program').textContent = student.program || 'N/A';
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
    
    // Clear selection and refresh
    currentStudent = null;
    document.getElementById('student-info').innerHTML = `
      <div class="info-header">
        <h2>Student Information</h2>
      </div>
      <div class="info-details">
        <div class="info-label">First Name:</div>
        <div class="info-value placeholder" id="info-firstname">Select a student</div>
        <div class="info-label">Last Name:</div>
        <div class="info-value placeholder" id="info-lastname">—</div>
        <div class="info-label">Student ID:</div>
        <div class="info-value placeholder" id="info-studentid">—</div>
        <div class="info-label">Email:</div>
        <div class="info-value placeholder" id="info-email">—</div>
        <div class="info-label">Program:</div>
        <div class="info-value placeholder" id="info-program">—</div>
        <div class="info-label">Events Attended:</div>
        <div class="info-value placeholder" id="info-events">—</div>
      </div>
      <div class="info-actions">
        <button onclick="openEditStudentModal()" class="event-action-button btn-edit">Edit Student</button>
        <button onclick="deleteCurrentStudent()" class="event-action-button btn-delete">Delete Student</button>
      </div>
    `;
    
    applyStudentFilters(); // Refresh the list
  } catch (error) {
    console.error('Error deleting student:', error);
    alert(`❌ Failed to delete student: ${error.message}`);
  }
}

async function openEditStudentModal() {
  if (!currentStudent) {
    alert('Please select a student first');
    return;
  }

  // Fetch fresh student data from backend
  let studentData = currentStudent;
  try {
    studentData = await ADMIN_API.getUserById(currentStudent.id);
    console.log('Fetched fresh student data:', studentData);
  } catch (error) {
    console.error('Error fetching student data:', error);
    // Continue with currentStudent data if fetch fails
  }

  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edit Student: ${studentData.username}</h2>
      <form id="editStudentForm">
        <label for="editUsername">Username:</label>
        <input type="text" id="editUsername" value="${studentData.username || ''}" required />

        <label for="editEmail">Email:</label>
        <input type="email" id="editEmail" value="${studentData.email || ''}" required />

        <label for="editFirstName">First Name:</label>
        <input type="text" id="editFirstName" value="${studentData.first_name || ''}" />

        <label for="editLastName">Last Name:</label>
        <input type="text" id="editLastName" value="${studentData.last_name || ''}" />

        <label for="editStudentId">Student ID:</label>
        <input type="text" id="editStudentId" value="${studentData.student_id || ''}" />

        <label for="editProgram">Program:</label>
        <input type="text" id="editProgram" value="${studentData.program || ''}" />

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
    
    // Use snake_case for backend API
    const updatedData = {
      username,
      email,
      first_name: document.getElementById('editFirstName').value.trim(),
      last_name: document.getElementById('editLastName').value.trim(),
      student_id: document.getElementById('editStudentId').value.trim(),
      program: document.getElementById('editProgram').value.trim()
    };

    try {
      // Update user with correct field names
      const response = await fetch(`${ADMIN_API.baseUrl}/users/${currentStudent.id}`, {
        method: 'PUT',
        headers: ADMIN_API.getHeaders(),
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update student');
      }
      
      const result = await response.json();
      alert('✅ Student updated successfully!');
      
      // Update local data with the response data
      currentStudent = result.data || result || { ...currentStudent, ...updatedData };
      showStudentDetails(currentStudent);
      
      modal.remove();
      
      // Refresh the student list to reflect any changes
      applyStudentFilters();
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

