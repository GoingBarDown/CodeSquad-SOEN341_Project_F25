document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const API_BASE = 'http://127.0.0.1:5000';
  fetch(`${API_BASE}/users/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: email, // backend expects 'username', using email as username
      password: password
    })
  })
  .then(response => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error('Invalid credentials');
    }
  })
  .then(data => {
    // Login successful, user data available
    document.cookie = `userId=${data.user.id}; path=/;`;
    document.cookie = `username=${data.user.username}; path=/;`;
    window.location.href = 'index.html';
  })
  .catch(error => {
    alert(error.message || 'Login failed');
  });
});
