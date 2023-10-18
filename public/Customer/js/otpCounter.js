    // Function to start the countdown timer
    function startCountdown() {
        let time = localStorage.getItem('otp_timer'); // Get remaining time from local storage
        const timer = document.getElementById('timer');
        const resendButton = document.getElementById('resendButton');

        function updateTimer() {
            if (time > 0) {
                time--;
                timer.textContent = time;
                localStorage.setItem('otp_timer', time); // Update the remaining time in local storage
                setTimeout(updateTimer, 1000);
            } else {
                // Handle the expiration of the OTP here
                // You can display a message or take other actions
                resendButton.style.display = 'block'; // Show the "Resend OTP" button
            }
        }

        updateTimer();
    }

    // Check if a timer is already running in local storage
    if (localStorage.getItem('otp_timer')) {
        startCountdown();
    }

    // Reset the timer when the "Resend OTP" button is clicked
    document.getElementById('resendButton').addEventListener('click', function () {
        localStorage.setItem('otp_timer', 60); // Set initial time in local storage
        startCountdown();
        this.style.display = 'none'; // Hide the "Resend OTP" button
    });