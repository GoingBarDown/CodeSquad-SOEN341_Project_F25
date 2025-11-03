document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch('/api/student/me'); // for logged-in user
    if (!response.ok) throw new Error("Failed to fetch student profile");

    const student = await response.json();

    document.getElementById("student-name").textContent = student.name || "N/A";
    document.getElementById("student-email").textContent = student.email || "N/A";
    document.getElementById("student-password").textContent = "********"; // Don't show real password
    document.getElementById("student-id").textContent = student.id || "N/A";
    document.getElementById("student-program").textContent = student.program || "N/A";

  } catch (error) {
    console.error("Error loading student profile:", error);
  }
});
