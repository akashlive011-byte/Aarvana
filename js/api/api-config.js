/* ============================================
   js/api/api-config.js
   API Configuration & Management
   
   Handles:
   - API URL configuration
   - Backend mode toggle (JSON vs Google Sheets)
   - Shared settings for all API calls
   ============================================ */

// ==================== API CONFIGURATION ====================

var API_BASE_URL = localStorage.getItem('aarvana_api_url') || '';
var USE_BACKEND_API = localStorage.getItem('aarvana_use_backend') === 'true';

/**
 * Check if backend API is active
 * @returns {boolean}
 */
function isBackendActive() {
  return USE_BACKEND_API && API_BASE_URL !== '';
}

/**
 * Activate backend API mode
 * Called from admin panel settings
 * @param {string} url - Google Apps Script Web App URL
 */
function apiActivate(url) {
  API_BASE_URL = url;
  USE_BACKEND_API = true;
  localStorage.setItem('aarvana_api_url', url);
  localStorage.setItem('aarvana_use_backend', 'true');
}

/**
 * Deactivate backend API mode
 * Reverts to using data/*.json files
 */
function apiDeactivate() {
  USE_BACKEND_API = false;
  localStorage.setItem('aarvana_use_backend', 'false');
}

/**
 * Get the API URL for a specific action
 * @param {string} action - API action name
 * @returns {string} Full API URL
 */
function getApiUrl(action) {
  return API_BASE_URL + '?action=' + action;
}

/**
 * Make a GET request to the API
 * @param {string} action - API action name
 * @returns {Promise} Fetch promise
 */
function apiGet(action) {
  return fetch(getApiUrl(action))
    .then(function(response) {
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    });
}

/**
 * Make a POST request to the API
 * @param {string} action - API action name
 * @param {Object} data - Data to send
 * @returns {Promise} Fetch promise
 */
function apiPost(action, data) {
  return fetch(getApiUrl(action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(function(response) {
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  });
}