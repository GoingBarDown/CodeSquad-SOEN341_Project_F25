// Menu handling is centralized in index.js; avoid duplicate handlers here to
// prevent conflicts on profilePage.html. index.js attaches the toggle and
// outside-click behavior at DOMContentLoaded.

const API_BASE = 'http://127.0.0.1:5000';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // helper to parse JSON safely
    async function safeJson(res) {
      try {
        return await res.json();
      } catch (e) {
        const text = await res.text().catch(() => '<unreadable>');
        console.warn('Response not JSON:', text);
        return null;
      }
    }

    // Primary approach: use the userId cookie that the login page sets.
    // The backend exposes GET /users/<id> which returns the user object.
    const userId = getCookie('userId') || localStorage.getItem('userId');
    if (!userId) {
      console.warn('No userId found in cookie/localStorage; cannot load profile. Redirecting to login.');
      window.location.href = 'login.html';
      return;
    }

  // NOTE: removed credentials: 'include' to avoid requiring backend CORS credential support.
  // If your server requires cookies for auth, either serve the frontend from same origin
  // or ask backend team to enable Access-Control-Allow-Credentials.
  let res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`);
    console.debug(`/users/${userId}`, res.status);

    // If unauthorized -> redirect to login
    if (res.status === 401) {
      console.warn('Not authenticated (401). Redirecting to login.');
      window.location.href = 'login.html';
      return;
    }

    // If not OK, try legacy endpoint /api/student/me as a fallback
    if (!res.ok) {
      console.warn(`/users/${userId} returned ${res.status} — trying /api/student/me fallback`);
  // Try fallback endpoint without credentials
  res = await fetch(`${API_BASE}/api/student/me`);
      console.debug('/api/student/me', res.status);
      if (!res.ok) {
        throw new Error(`Failed to fetch profile (tried /users/${userId} and /api/student/me): ${res.status}`);
      }
    }

    const student = await safeJson(res);
    if (!student) {
      console.error('No student data received from server');
      return;
    }

    // Normalize fields from backend user model
  // Backend user.data fields (from db/models.User.data):
  // id, username, email, role, first_name, last_name, student_id, program
  const displayName = (student.first_name || student.username || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A');
  const email = student.email || 'N/A';
  const studentId = (student.student_id != null && student.student_id !== '') ? student.student_id : (student.id || 'N/A');
  const program = student.program || 'N/A';

    const nameEl = document.getElementById('student-name');
    const emailEl = document.getElementById('student-email');
    const pwdEl = document.getElementById('student-password');
    const idEl = document.getElementById('student-id');
    const programEl = document.getElementById('student-program');

    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = email;
    if (pwdEl) pwdEl.textContent = '********'; // never show raw password
    if (idEl) idEl.textContent = studentId;
    if (programEl) programEl.textContent = program;

  } catch (error) {
    console.error('Error loading student profile:', error);
  }
});
