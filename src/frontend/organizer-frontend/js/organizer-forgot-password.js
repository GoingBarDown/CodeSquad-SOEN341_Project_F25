const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail')?.value.trim();
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }

        API.forgotPassword({ email })
            .then(response => {
                if (response.success) {
                    alert('Password reset instructions have been sent to your email');
                    window.location.href = 'organizer-login.html';
                } else {
                    alert('Failed: ' + (response.message || 'Email not found'));
                }
            })
            .catch(err => {
                console.error('Reset failed:', err);
                alert('Failed to process password reset request');
            });
    });
}