// Profile Page – extended with VIEW + EDIT modes
// ----------------------------------------------

const API_BASE = 'http://127.0.0.1:5000';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {

  // --- LOGIN PROTECTION ---
  const userId = getCookie('userId') || localStorage.getItem('userId');
  if (!userId) {
    window.location.href = 'login.html';
    return;
  }

  localStorage.setItem("role", "student");
  localStorage.setItem("loggedInUser", "student");

  // --- DOM ELEMENTS ---
  const viewSection = document.getElementById("profileView");
  const editSection = document.getElementById("studentProfileForm");
  const editBtn = document.getElementById("editBtn");

  // VIEW FIELDS
  const viewFirst = document.getElementById("viewFirstName");
  const viewLast = document.getElementById("viewLastName");
  const viewEmail = document.getElementById("viewEmail");
  const viewStudentId = document.getElementById("viewStudentId");
  const viewProgram = document.getElementById("viewProgram");
  const viewPhone = document.getElementById("viewPhone");
  const viewBio = document.getElementById("viewBio");

  // EDIT FIELDS (your existing form)
  const firstInput = document.getElementById("firstName");
  const lastInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const sidInput = document.getElementById("studentId");
  const programInput = document.getElementById("program");
  const phoneInput = document.getElementById("phone");
  const bioInput = document.getElementById("bio");

  async function safeJson(res) {
    try { return await res.json(); }
    catch { return null; }
  }

  // ---------------------------
  //  📌 LOAD PROFILE FROM BACKEND
  // ---------------------------
  async function loadProfile() {
    try {
      let res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`);

      if (res.status === 401) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/student/me`);
        if (!res.ok) throw new Error("Unable to fetch student profile.");
      }

      const student = await safeJson(res);
      if (!student) return;

      const first = student.first_name || "";
      const last = student.last_name || "";
      const email = student.email || "";
      const studentId = student.student_id || student.id || "";
      const program = student.program || "";
      const phone = student.phone || "";
      const bio = student.bio || "";

      // --- populate VIEW MODE ---
      viewFirst.textContent = first;
      viewLast.textContent = last;
      viewEmail.textContent = email;
      viewStudentId.textContent = studentId;
      viewProgram.textContent = program || "Not set";
      viewPhone.textContent = phone || "Not set";
      viewBio.textContent = bio || "No bio available.";

      // --- populate EDIT MODE ---
      firstInput.value = first;
      lastInput.value = last;
      emailInput.value = email;
      sidInput.value = studentId;
      programInput.value = program;
      phoneInput.value = phone;
      bioInput.value = bio;

    } catch (error) {
      console.error("Error loading student profile:", error);
    }
  }

  await loadProfile();

  // ---------------------------
  //  ✏️ EDIT BUTTON → SWITCH MODE
  // ---------------------------
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      viewSection.style.display = "none";
      editSection.style.display = "block";
    });
  }

  // ---------------------------
  //  💾 SAVE CHANGES
  // ---------------------------
  editSection.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updated = {
      first_name: firstInput.value.trim(),
      last_name: lastInput.value.trim(),
      program: programInput.value.trim(),
      phone: phoneInput.value.trim(),
      bio: bioInput.value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });

      if (!res.ok) throw new Error("Could not update profile.");

      alert("Profile updated successfully!");

      await loadProfile();

      // return to view mode
      editSection.style.display = "none";
      viewSection.style.display = "block";

    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  });

});

