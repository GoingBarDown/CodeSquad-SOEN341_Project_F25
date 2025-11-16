const API_BASE = 'http://127.0.0.1:5000';

// Get user ID from cookie or localStorage
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {

  const userId = getCookie('userId') || localStorage.getItem('userId');
  if (!userId) {
    window.location.href = 'login.html';
    return;
  }

  // Form elements
  const form = document.getElementById("studentProfileForm");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const studentId = document.getElementById("studentId");
  const program = document.getElementById("program");
  const phone = document.getElementById("phone");
  const bio = document.getElementById("bio");

  // Load student data
  async function loadProfile() {
    try {
      let res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error("Cannot load profile");

      const student = await res.json();

      firstName.value = student.first_name || "";
      lastName.value = student.last_name || "";
      email.value = student.email || "";
      studentId.value = student.student_id || student.id || "";
      program.value = student.program || "";
      phone.value = student.phone || "";
      bio.value = student.bio || "";

    } catch (error) {
      console.error("Profile load error:", error);
    }
  }

  await loadProfile();

  // Save handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updated = {
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      program: program.value.trim(),
      phone: phone.value.trim(),
      bio: bio.value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });

      if (!res.ok) throw new Error("Failed to update profile");

      alert("Profile updated successfully!");

    } catch (err) {
      alert("Error updating profile.");
      console.error(err);
    }
  });

});
