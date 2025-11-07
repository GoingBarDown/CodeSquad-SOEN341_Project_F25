document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  // You can use name as username, or add a username field if needed
  fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: email, // or use name if you want
      password: password,
      email: email,
      role: 'student'
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.id) {
      // Optionally fetch user data
      fetch(`/users/${data.id}`)
        .then(res => res.json())
        .then(userData => {
          document.cookie = `userId=${userData.id}; path=/;`;
          document.cookie = `username=${userData.username}; path=/;`;
          window.location.href = 'index.html';
        });
    } else {
      alert(data.error || 'Sign up failed');
    }
  })
  .catch(() => {
    alert('Network error. Please try again.');
  });
});