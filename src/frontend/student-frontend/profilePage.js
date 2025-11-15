// Profile Page – fully merged & correct version
// ---------------------------------------------

const API_BASE = 'http://127.0.0.1:5000';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {

  // 🔒 LOGIN PROTECTION
  const userId = getCookie('userId') || localStorage.getItem('userId');
  if (!userId) {
    window.location.href = 'login.html';
    return;
  }

  // Make sure homepage displays correct menu
  localStorage.setItem("role", "student");
  localStorage.setItem("loggedInUser", "student");

  try {
    // helper to parse json safely
    async function safeJson(res) {
      try { return await res.json(); }
      catch { return null; }
    }

    // primary fetch
    let res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`);

    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }

    // fallback
    if (!res.ok) {
      res = await fetch(`${API_BASE}/api/student/me`);
      if (!res.ok) throw new Error("Unable to fetch student profile.");
    }

    const student = await safeJson(res);
    if (!student) return;

    // backend normalization
    const first = student.first_name || "";
    const last = student.last_name || "";
    const email = student.email || "";
    const studentId = student.student_id || student.id || "";
    const program = student.program || "";
    const phone = student.phone || "";
    const bio = student.bio || "";

    // fill input fields
    document.getElementById("firstName").value = first;
    document.getElementById("lastName").value = last;
    document.getElementById("email").value = email;
    document.getElementById("studentId").value = studentId;
    document.getElementById("program").value = program;
    document.getElementById("phone").value = phone;
    document.getElementById("bio").value = bio;

  } catch (error) {
    console.error("Error loading student profile:", error);
  }
});

