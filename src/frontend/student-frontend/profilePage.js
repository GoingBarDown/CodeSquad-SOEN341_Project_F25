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
    // Allow client-side overrides saved by the edit form when backend update is not available.
    const override = (key) => {
      try {
        // try several possible localStorage keys for resilience
        return localStorage.getItem(`profile_${key}`) || localStorage.getItem(key) || null;
      } catch (e) { return null; }
    };

    // Debug: dump relevant localStorage keys so we can see what was saved
    try {
      console.debug('profilePage: localStorage snapshot', {
        profile_first_name: localStorage.getItem('profile_first_name'),
        profile_last_name: localStorage.getItem('profile_last_name'),
        profile_program: localStorage.getItem('profile_program'),
        profile_phone: localStorage.getItem('profile_phone'),
        profile_bio: localStorage.getItem('profile_bio'),
        userId: localStorage.getItem('userId'),
        loggedInUser: localStorage.getItem('loggedInUser')
      });
    } catch (e) {
      // ignore
    }

    const displayName = (override('first_name') || student.first_name || student.username || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A');
    const email = student.email || 'N/A';
    const studentId = (student.student_id != null && student.student_id !== '') ? student.student_id : (student.id || 'N/A');
    const program = override('program') || student.program || 'N/A';

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

  // Additional fields that may be shown on the page: phone and bio
  const phoneEl = document.getElementById('student-phone');
  const bioEl = document.getElementById('bio');
  const firstEl = document.getElementById('first-name');
  const lastEl = document.getElementById('last-name');

    // const usedOverrides = {}; // ununsed variable 
    const ofn = override('first_name');
    const oln = override('last_name');
    const opr = override('program');
    const oph = override('phone');
    const obi = override('bio');

    if (firstEl) firstEl.textContent = (ofn || student.first_name || '—');
    if (lastEl) lastEl.textContent = (oln || student.last_name || '—');
    if (phoneEl) phoneEl.textContent = (oph || student.phone || '—');
    if (bioEl) bioEl.textContent = (obi || student.bio || '—');

    // Remove the loading mask once we've populated the fields
    try {
      const card = document.querySelector('.profile-card');
      if (card) {
        card.classList.remove('loading');
      }
    } catch (e) { /* ignore */ }

    if (ofn || oln || opr || oph || obi) {
      // Keep a console debug for local overrides (helps during development),
      // but do NOT show a transient banner in the UI on page load.
      console.debug('profilePage: using local overrides (suppressed banner)', { ofn, oln, opr, oph, obi });
    }

    // Safety fallback: if for some reason the fetch never resolves, remove
    // the loading state after a short timeout so the page isn't permanently hidden.
    setTimeout(() => {
      try { document.querySelector('.profile-card')?.classList.remove('loading'); } catch(e){}
    }, 3500);

  } catch (error) {
    console.error('Error loading student profile:', error);
  }
});
