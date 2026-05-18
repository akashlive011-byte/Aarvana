// countdown-timer.js
// Features:
// 1. Countdown timer set for exactly 2 days from page load
// 2. Real counting system that increments every second (live counter)
// 3. Session timer tracking how long user has been on page

(function() {
  'use strict';

  // ============ COUNTDOWN TIMER (2 days) ============
  const now = new Date();
  const targetDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  const daysElement = document.getElementById('days');
  const hoursElement = document.getElementById('hours');
  const minutesElement = document.getElementById('minutes');
  const secondsElement = document.getElementById('seconds');
  const countdownContainer = document.getElementById('countdown');
  const expiredMessage = document.getElementById('expiredMessage');

  function updateCountdown() {
    const currentTime = new Date().getTime();
    const distance = targetDate.getTime() - currentTime;

    if (distance <= 0) {
      if (daysElement) daysElement.textContent = '00';
      if (hoursElement) hoursElement.textContent = '00';
      if (minutesElement) minutesElement.textContent = '00';
      if (secondsElement) secondsElement.textContent = '00';
      
      if (countdownContainer) {
        countdownContainer.style.display = 'none';
      }
      if (expiredMessage) {
        expiredMessage.style.display = 'block';
      }
      
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
    if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
    if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
    if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
  }

  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);

  // ============ REAL COUNTING SYSTEM ============
  const realCounterDisplay = document.getElementById('realCounter');
  const counterValueDisplay = document.getElementById('counterValue');
  const sessionSecondsDisplay = document.getElementById('sessionSeconds');
  
  // Initialize counters
  let realCount = 0;
  let sessionSeconds = 0;
  
  // Starting value for real counter (simulates existing activity)
  // Using a random base between 1,000,000 and 5,000,000 for visual effect
  const baseCount = Math.floor(Math.random() * 4000000) + 1000000;
  realCount = baseCount;
  
  // Update real counter display with formatted number
  function updateRealCounter() {
    // Increment real count by a random amount (1-5 per second for dynamic feel)
    const increment = Math.floor(Math.random() * 5) + 1;
    realCount += increment;
    
    // Format with leading zeros to 8 digits
    const formattedCount = realCount.toString().padStart(8, '0');
    if (realCounterDisplay) {
      realCounterDisplay.textContent = formattedCount;
    }
    
    // Update total counts stat
    if (counterValueDisplay) {
      counterValueDisplay.textContent = realCount.toLocaleString();
    }
  }
  
  // Update session timer
  function updateSessionTimer() {
    sessionSeconds++;
    if (sessionSecondsDisplay) {
      sessionSecondsDisplay.textContent = sessionSeconds.toLocaleString();
    }
  }
  
  // Initialize displays
  updateRealCounter();
  updateSessionTimer();
  
  // Run real counter every second
  const realCounterInterval = setInterval(() => {
    updateRealCounter();
    updateSessionTimer();
  }, 1000);

  // ============ LOGGING ============
  console.log('⏳ Countdown started. Target launch:', targetDate.toLocaleString());
  console.log('🔢 Real counter initialized at:', realCount.toLocaleString());
  console.log('⏱️ Session timer active');
  console.log('📁 Files: countdown-styles.css | countdown-timer.js');

  // Handle page visibility for accuracy
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateCountdown();
      // Real counter continues regardless, but we refresh display
      if (realCounterDisplay) {
        realCounterDisplay.textContent = realCount.toString().padStart(8, '0');
      }
    }
  });

  // Cleanup on page unload (good practice)
  window.addEventListener('beforeunload', () => {
    clearInterval(countdownInterval);
    clearInterval(realCounterInterval);
  });

})();
