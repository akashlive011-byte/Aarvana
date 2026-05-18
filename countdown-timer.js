// countdown-timer.js
// Features:
// 1. Countdown timer set for exactly 2 days from page load
// 2. Persistent visitor counter using localStorage (survives refresh)
// 3. Tracks number of visits from current browser
// 4. Shows last visit timestamp

(function() {
  'use strict';

  // ============ PERSISTENT STORAGE KEYS ============
  const STORAGE_KEYS = {
    TOTAL_VISITORS: 'launchpad_total_visitors',
    YOUR_VISITS: 'launchpad_your_visits',
    LAST_VISIT: 'launchpad_last_visit',
    SESSION_START: 'launchpad_session_start',
    COUNTDOWN_TARGET: 'launchpad_countdown_target'
  };

  // ============ HELPER: Get/Set localStorage with fallback ============
  function getStoredNumber(key, defaultValue = 0) {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;
      const num = parseInt(stored, 10);
      return isNaN(num) ? defaultValue : num;
    } catch (e) {
      console.warn('localStorage not available:', e);
      return defaultValue;
    }
  }

  function setStoredValue(key, value) {
    try {
      localStorage.setItem(key, value.toString());
    } catch (e) {
      console.warn('Cannot write to localStorage:', e);
    }
  }

  function getStoredString(key, defaultValue = '') {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  // ============ INITIALIZE / UPDATE VISITOR COUNTERS ============
  function initializeVisitorCounters() {
    // Get existing values
    let totalVisitors = getStoredNumber(STORAGE_KEYS.TOTAL_VISITORS, 1000000);
    let yourVisits = getStoredNumber(STORAGE_KEYS.YOUR_VISITS, 0);
    const lastVisit = getStoredString(STORAGE_KEYS.LAST_VISIT, 'First visit');

    // Increment counters
    totalVisitors += 1;
    yourVisits += 1;

    // Update current visit timestamp
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Save to localStorage
    setStoredValue(STORAGE_KEYS.TOTAL_VISITORS, totalVisitors);
    setStoredValue(STORAGE_KEYS.YOUR_VISITS, yourVisits);
    setStoredValue(STORAGE_KEYS.LAST_VISIT, formattedTime);

    return {
      totalVisitors,
      yourVisits,
      lastVisit: formattedTime
    };
  }

  // ============ COUNTDOWN TIMER (2 days) ============
  function initializeCountdown() {
    // Try to get stored target date, or create new one
    let targetDateStr = getStoredString(STORAGE_KEYS.COUNTDOWN_TARGET, '');
    let targetDate;

    if (targetDateStr) {
      targetDate = new Date(targetDateStr);
      // Check if stored target is still valid (not expired and within reasonable range)
      const now = new Date();
      if (isNaN(targetDate.getTime()) || targetDate.getTime() <= now.getTime()) {
        // Target expired or invalid, create new
        targetDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        setStoredValue(STORAGE_KEYS.COUNTDOWN_TARGET, targetDate.toISOString());
      }
    } else {
      const now = new Date();
      targetDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      setStoredValue(STORAGE_KEYS.COUNTDOWN_TARGET, targetDate.toISOString());
    }

    return targetDate;
  }

  const targetDate = initializeCountdown();
  
  // DOM elements for countdown
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

  // ============ UPDATE DOM WITH VISITOR DATA ============
  const counters = initializeVisitorCounters();
  
  const visitorCounterDisplay = document.getElementById('visitorCounter');
  const totalVisitorsDisplay = document.getElementById('totalVisitors');
  const yourVisitsDisplay = document.getElementById('yourVisits');
  const lastVisitDisplay = document.getElementById('lastVisit');
  const visitCountSpan = document.getElementById('visitCount');

  // Format and display
  function updateVisitorDisplay() {
    const formattedTotal = counters.totalVisitors.toString().padStart(8, '0');
    if (visitorCounterDisplay) {
      visitorCounterDisplay.textContent = formattedTotal;
    }
    if (totalVisitorsDisplay) {
      totalVisitorsDisplay.textContent = counters.totalVisitors.toLocaleString();
    }
    if (yourVisitsDisplay) {
      yourVisitsDisplay.textContent = counters.yourVisits;
    }
    if (lastVisitDisplay) {
      lastVisitDisplay.textContent = counters.lastVisit;
    }
    if (visitCountSpan) {
      visitCountSpan.textContent = counters.yourVisits;
    }
  }

  updateVisitorDisplay();

  // ============ REAL-TIME COUNTER INCREMENT ============
  // The counter continues to increment while page is open
  setInterval(() => {
    // Re-read from storage in case another tab updated it
    let currentTotal = getStoredNumber(STORAGE_KEYS.TOTAL_VISITORS, counters.totalVisitors);
    currentTotal += 1;
    setStoredValue(STORAGE_KEYS.TOTAL_VISITORS, currentTotal);
    
    // Update display
    const formatted = currentTotal.toString().padStart(8, '0');
    if (visitorCounterDisplay) {
      visitorCounterDisplay.textContent = formatted;
    }
    if (totalVisitorsDisplay) {
      totalVisitorsDisplay.textContent = currentTotal.toLocaleString();
    }
    
    // Update in-memory counter
    counters.totalVisitors = currentTotal;
  }, 3000); // Increment every 3 seconds for realistic pacing

  // ============ RESET BUTTON (for testing) ============
  const resetButton = document.getElementById('resetCounter');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (confirm('Reset all counter data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEYS.TOTAL_VISITORS);
        localStorage.removeItem(STORAGE_KEYS.YOUR_VISITS);
        localStorage.removeItem(STORAGE_KEYS.LAST_VISIT);
        localStorage.removeItem(STORAGE_KEYS.COUNTDOWN_TARGET);
        location.reload();
      }
    });
  }

  // ============ SYNC ACROSS TABS ============
  window.addEventListener('storage', (event) => {
    // When another tab updates the counter, refresh our display
    if (event.key === STORAGE_KEYS.TOTAL_VISITORS) {
      const newTotal = getStoredNumber(STORAGE_KEYS.TOTAL_VISITORS, counters.totalVisitors);
      counters.totalVisitors = newTotal;
      if (visitorCounterDisplay) {
        visitorCounterDisplay.textContent = newTotal.toString().padStart(8, '0');
      }
      if (totalVisitorsDisplay) {
        totalVisitorsDisplay.textContent = newTotal.toLocaleString();
      }
    }
  });

  // ============ LOGGING ============
  console.log('📊 Persistent Visitor Counter Active');
  console.log('👥 Total Visitors:', counters.totalVisitors.toLocaleString());
  console.log('🔄 Your Visits:', counters.yourVisits);
  console.log('🕐 Last Visit:', counters.lastVisit);
  console.log('⏳ Countdown Target:', targetDate.toLocaleString());
  console.log('💾 Data stored in localStorage - survives refresh!');
  console.log('📁 Files: index.html | countdown-styles.css | countdown-timer.js');

})();
