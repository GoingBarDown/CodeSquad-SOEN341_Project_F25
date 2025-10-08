// Toggle menu open/close
document.getElementById("dot").addEventListener("click", function () {
  document.getElementById("menu").classList.toggle("open");
});

// Handle login form
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email === "organizer@example.com" && password === "1234") {
    document.getElementById("message").textContent = "Login successful!";
    document.getElementById("message").style.color = "green";
  } else {
    document.getElementById("message").textContent = "Invalid credentials!";
    document.getElementById("message").style.color = "red";
  }
});
