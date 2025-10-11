// Toggle dropdown
document.getElementById('dot').addEventListener('click', () => {
  document.getElementById('menu').classList.toggle('open');
});

// Preview uploaded profile photo
document.getElementById('fileUpload').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('profilePic').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Save form info
document.getElementById('profileForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert("✅ Profile updated successfully!");
});
