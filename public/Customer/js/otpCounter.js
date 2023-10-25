function startCountdown() {
    const timerElement = document.getElementById('timer');
    const resendButton = document.getElementById('resend');
    const resendContainer = document.getElementById('resendContainer');

    let timeLeft;
    const startTime = localStorage.getItem('countdownStart');

    if (startTime) {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      timeLeft = Math.max(60 - elapsedTime, 0);
    } else {
      timeLeft = 60;
      localStorage.setItem('countdownStart', Date.now());
    }

    const countdownInterval = setInterval(function () {
      timeLeft--;

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        timerElement.textContent = '0';
        localStorage.removeItem('countdownStart');
        // Hide the countdown timer and show the "Resend" button
        timerElement.style.display = 'none';
        resendContainer.style.display = 'block';
      } else {
        timerElement.textContent = timeLeft;
      }
    }, 1000);
  }

  window.onload = startCountdown;