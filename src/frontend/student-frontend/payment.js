// Menu toggle
document.getElementById("dot").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("open");
});

// Handle payment verification
const form = document.getElementById("paymentForm");
const status = document.getElementById("paymentStatus");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentId = document.getElementById("studentId").value.trim();
  if (!studentId.startsWith("4")) {
    status.textContent = "❌ Invalid Student ID. Please start with 'S'.";
    status.style.color = "red";
    return;
  }

  status.textContent = "Processing payment...";
  status.style.color = "#912338";

  setTimeout(() => {
    status.textContent = "✅ Payment Approved! Ticket confirmed.";
    status.style.color = "green";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  }, 1500);
});
