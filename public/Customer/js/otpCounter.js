// Define the startCountdown function
function startCountdown() {
    let time = localStorage.getItem('otp_timer');
    const timer = document.getElementById('timer');
    const resendButton = document.getElementById('resendButton');

    function updateTimer() {
        if (time > 0) {
            time--;
            timer.textContent = time;
            localStorage.setItem('otp_timer', time);
            setTimeout(updateTimer, 1000);
        } else {
            // Handle the expiration of the OTP here
            resendButton.style.display = 'block'; // Show the "Resend OTP" button
        }
    }

    updateTimer();
}

// Check if a timer is already running in local storage
if (localStorage.getItem('otp_timer')) {
    startCountdown();
}