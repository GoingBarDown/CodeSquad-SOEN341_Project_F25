// // studentProfile.js
// // Restored profile-loading logic. This file mirrors the behavior in profilePage.js

// const API_BASE = 'http://127.0.0.1:5000';

// function getCookie(name) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(';').shift();
//   return null;
// }

// async function loadStudentProfile() {
//   try {
//     let res = await fetch(`${API_BASE}/api/student/me`, { credentials: 'include' });
//     if (!res.ok) {
//       const userId = getCookie('userId') || localStorage.getItem('userId');
//       if (!userId) {
//         console.warn('No userId found; cannot load profile');
//         return;
//       }
//       res = await fetch(`${API_BASE}/users/${userId}`);
//       if (!res.ok) throw new Error(`Failed to fetch user ${userId}: ${res.status}`);
//     }

//     const student = await res.json();
//     const displayName = student.first_name || student.username || student.name || 'N/A';
//     const email = student.email || 'N/A';
//     const studentId = student.student_id != null ? student.student_id : (student.id || 'N/A');
//     const program = student.program || 'N/A';

//     const nameEl = document.getElementById('student-name');
//     const emailEl = document.getElementById('student-email');
//     const pwdEl = document.getElementById('student-password');
//     const idEl = document.getElementById('student-id');
//     const programEl = document.getElementById('student-program');

//     if (nameEl) nameEl.textContent = displayName;
//     if (emailEl) emailEl.textContent = email;
//     if (pwdEl) pwdEl.textContent = '********';
//     if (idEl) idEl.textContent = studentId;
//     if (programEl) programEl.textContent = program;

//   } catch (err) {
//     console.error('Error loading student profile:', err);
//   }
// }

// document.addEventListener('DOMContentLoaded', loadStudentProfile);
