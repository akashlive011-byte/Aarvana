// countdown-timer.js
// Sets a countdown for exactly 2 days from the moment page loads.
// Displays days, hours, minutes, seconds. When timer reaches zero, shows launch message.

(function() {
  'use strict';

  // Target date: current time + 2 days (48 hours)
  const now = new Date();
  const targetDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  // DOM elements
  const daysElement = document.getElementById('days');
  const hoursElement = document.getElementById('hours');
  const minutesElement = document.getElementById('minutes');
  const secondsElement = document.getElementById('seconds');
  const countdownContainer = document.getElementById('countdown');
  const expiredMessage = document.getElementById('expiredMessage');

  // Function to update the counter display
  function updateCountdown() {
    const currentTime = new Date().getTime();
    const distance = targetDate.getTime() - currentTime;

    // If countdown finished
    if (distance <= 0) {
      // Show zeros and display expired message
      if (daysElement) daysElement.textContent = '00';
      if (hoursElement) hoursElement.textContent = '00';
      if (minutesElement) minutesElement.textContent = '00';
      if (secondsElement) secondsElement.textContent = '00';
      
      // Hide countdown, show expired message
      if (countdownContainer) {
        countdownContainer.style.display = 'none';
      }
      if (expiredMessage) {
        expiredMessage.style.display = 'block';
      }
      
      // Also hide live-counter badge? We keep it but can change text.
      const liveBadge = document.querySelector('.live-counter-badge span:last-child');
      if (liveBadge) {
        liveBadge.textContent = 'Launch completed – website is live';
      }
      
      // Stop the interval
      clearInterval(timerInterval);
      return;
    }

    // Calculate time components
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update DOM with zero-padded values
    if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
    if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
    if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
    if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
  }

  // Initial call to avoid delay
  updateCountdown();

  // Update every second (1000ms)
  const timerInterval = setInterval(updateCountdown, 1000);

  // Optional: Display target date in console for verification
  console.log('⏳ Countdown started. Target launch:', targetDate.toLocaleString());
  console.log('Current time:', new Date().toLocaleString());
  console.log('Timer set for exactly 2 days (48 hours) from page load.');

  // Handle page visibility changes to keep counter accurate (optional)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Immediately update when tab becomes active again
      updateCountdown();
    }
  });

})();
