// Toggle menu dropdown
document.getElementById('dot').addEventListener('click', function() {
    document.getElementById('menu').classList.toggle('open');
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (email === "" || password === "") {
        alert("Please fill in all fields.");
        return;
    }

    // Temporary feedback (you'll later connect this to backend)
    alert(`Logging in as: ${email}`);
});
