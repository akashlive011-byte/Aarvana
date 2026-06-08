/* ============================================
   js/api/google-sheets-api.js
   Google Sheets Backend API Integration
   
   Used when admin panel is active.
   Replaces data/products.json and data/config.json
   All users see the same data from Google Sheets.
   ============================================ */

// ==================== PRODUCTS API ====================

/**
 * Fetch all products from Google Sheets
 * @returns {Promise} Array of products
 */
function apiGetProducts() {
  return apiGet('getProducts');
}

/**
 * Add a new product via Google Sheets
 * @param {Object} data - Product data
 * @returns {Promise} Created product
 */
function apiAddProduct(data) {
  return apiPost('addProduct', data);
}

/**
 * Update an existing product via Google Sheets
 * @param {string} id - Product ID
 * @param {Object} data - Updated product data
 * @returns {Promise} Updated product
 */
function apiUpdateProduct(id, data) {
  return apiPost('updateProduct', { id: id, data: data });
}

/**
 * Delete a product via Google Sheets
 * @param {string} id - Product ID
 * @returns {Promise} Deletion result
 */
function apiDeleteProduct(id) {
  return apiPost('deleteProduct', { id: id });
}

/**
 * Toggle product featured status via Google Sheets
 * @param {string} id - Product ID
 * @returns {Promise} Updated product
 */
function apiToggleFeatured(id) {
  return apiPost('toggleFeatured', { id: id });
}

// ==================== SETTINGS API ====================

/**
 * Fetch checkout settings from Google Sheets
 * @returns {Promise} Settings object
 */
function apiGetSettings() {
  return apiGet('getSettings');
}

/**
 * Update checkout settings via Google Sheets
 * @param {Object} settings - Settings to update
 * @returns {Promise} Updated settings
 */
function apiUpdateSettings(settings) {
  return apiPost('updateSettings', settings);
}

// ==================== MEGA SALE API ====================

/**
 * Fetch active mega sale offers from Google Sheets
 * @returns {Promise} Mega sale offers
 */
function apiGetMegaSale() {
  return apiGet('getMegaSale');
}

/**
 * Update mega sale via Google Sheets
 * @param {Object} offer - Mega sale offer data
 * @returns {Promise} Updated offer
 */
function apiUpdateMegaSale(offer) {
  return apiPost('updateMegaSale', offer);
}

// ==================== CART VALIDATION API ====================

/**
 * Validate cart items against Google Sheets inventory
 * Checks if products exist, are in stock, and prices are correct
 * @param {Array} cartItems - Cart items to validate
 * @returns {Promise} Validation result with updated prices
 */
function apiValidateCart(cartItems) {
  return apiPost('validateCart', { items: cartItems });
}

// ==================== ORDERS API ====================

/**
 * Submit order to Google Sheets
 * @param {Object} order - Order data
 * @returns {Promise} Order confirmation
 */
function apiSubmitOrder(order) {
  return apiPost('submitOrder', order);
}

/**
 * Fetch order status from Google Sheets
 * @param {string} orderNumber - Order number
 * @returns {Promise} Order details
 */
function apiGetOrderStatus(orderNumber) {
  return apiGet('getOrder&orderNumber=' + orderNumber);
}

// ==================== LOCATION DATA API ====================

/**
 * Fetch Bangladesh location data from Google Sheets
 * @returns {Promise} Location data object
 */
function apiGetLocations() {
  return apiGet('getLocations');
}