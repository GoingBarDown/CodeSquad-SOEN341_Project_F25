const signupFormElem = document.getElementById('signupForm');
if (!signupFormElem) {
  // Not on signup page — nothing to do
  // This prevents errors when signup.js is included on other pages
} else {
  signupFormElem.addEventListener('submit', function(e) {
    e.preventDefault();

  const firstName = (document.getElementById('first_name')?.value || document.getElementById('name')?.value || '').trim();
  const lastName = (document.getElementById('last_name')?.value || '').trim();
  const usernameInput = document.getElementById('username') ? document.getElementById('username').value.trim() : '';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  if (password.length < 8) {
    alert('Password must be at least 8 characters long!');
    return;
  }

  if (!usernameInput) {
    alert('Please choose a username.');
    return;
  }

  if (!firstName) {
    alert('Please enter your first name.');
    return;
  }

   if (!lastName) {
    alert('Please enter your last name.');
    return;
  }

  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(usernameInput)) {
    alert('Username invalid. Use 3-30 letters, numbers, ".", "_" or "-"');
    return;
  }

  // You can use name as username, or add a username field if needed
  // Generate a username from the email local-part plus a short random suffix
  const localPart = (email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase();
  const rand = Math.random().toString(36).slice(2,8);
  const generatedUsername = `${localPart}_${rand}`;

  fetch('http://127.0.0.1:5000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: usernameInput || generatedUsername,
      password: password,
      email: email,
      role: 'student',
      first_name: firstName,
      last_name: lastName
    })
  })
  .then(response => response.json())
    .then(data => {
    console.debug('signup.js: create user response', data);
    if (data && data.id) {
      // Redirect to login page after successful signup
      alert('Sign up successful! Please log in with your credentials.');
      window.location.href = 'login.html';
    } else {
      alert((data && (data.error || data.message)) || 'Sign up failed');
    }
  })
  .catch(() => {
    alert('Network error. Please try again.');
  });
  });
}