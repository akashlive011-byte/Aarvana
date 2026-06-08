/* ============================================
   js/cart/cart.js - Shopping Cart Functionality
   
   Handles:
   - Load cart from localStorage
   - Render cart items with image, name, price, quantity
   - Update item quantity (+/- buttons)
   - Remove individual items
   - Clear all items at once
   - Validate cart against backend (Google Sheets API)
   - Calculate subtotal, shipping, total
   - Empty cart state
   ============================================ */

// ==================== CART DATA ====================

var cartItems = [];  // Array of cart item objects stored in localStorage

/**
 * Load cart from localStorage
 * Called on page load
 */
function loadCart() {
    var stored = localStorage.getItem('aarvana_cart');
    cartItems = stored ? JSON.parse(stored) : [];
}

/**
 * Save cart to localStorage
 * Also updates cart badge in header via core script
 */
function saveCart() {
    localStorage.setItem('aarvana_cart', JSON.stringify(cartItems));
    // Update cart count badge in header (function from script.js)
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

/**
 * Calculate subtotal of all items in cart
 * @returns {number} Total price of all items
 */
function calculateSubtotal() {
    var total = 0;
    for (var i = 0; i < cartItems.length; i++) {
        total += cartItems[i].price * cartItems[i].quantity;
    }
    return total;
}

// ==================== CART VALIDATION WITH BACKEND ====================

/**
 * Validate cart against backend API (Google Sheets)
 * Updates prices and checks stock if backend is active
 * Called when cart page loads
 */
function validateCartWithBackend() {
    // Only validate if backend API is active (from api-config.js)
    if (typeof isBackendActive !== 'function' || !isBackendActive()) {
        renderCart();
        return;
    }
    
    // Nothing to validate if cart is empty
    if (cartItems.length === 0) {
        renderCart();
        return;
    }
    
    // Show validating indicator in loading area
    var loading = document.getElementById('cartLoading');
    if (loading) {
        loading.innerHTML = '<p class="text-sm text-gray-400">Validating cart...</p>' +
            '<div class="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-gray-800 mx-auto mt-3"></div>';
    }
    
    // Call API to validate cart (from google-sheets-api.js)
    apiValidateCart(cartItems)
        .then(function(result) {
            if (result && result.validated && result.items) {
                // Update cart items with validated data from backend
                for (var i = 0; i < cartItems.length; i++) {
                    var validated = findItemById(result.items, cartItems[i].id);
                    if (validated) {
                        // Update price if changed on backend
                        if (validated.currentPrice && validated.currentPrice !== cartItems[i].price) {
                            cartItems[i].price = validated.currentPrice;
                        }
                        // Mark as out of stock if backend says so
                        if (validated.inStock === false) {
                            cartItems[i].outOfStock = true;
                        }
                        // Cap quantity to max available
                        if (validated.maxQuantity && cartItems[i].quantity > validated.maxQuantity) {
                            cartItems[i].quantity = validated.maxQuantity;
                        }
                    }
                }
                saveCart();
            }
            renderCart();
        })
        .catch(function() {
            // Validation failed - show cart as-is from localStorage
            renderCart();
        });
}

/**
 * Find item by ID in an array
 * @param {Array} items - Array to search
 * @param {string} id - ID to find
 * @returns {Object|null} Found item or null
 */
function findItemById(items, id) {
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) return items[i];
    }
    return null;
}

// ==================== RENDER CART ====================

/**
 * Render the entire cart page
 * Shows items, empty state, or summary based on cart content
 */
function renderCart() {
    // Get DOM elements
    var loading = document.getElementById('cartLoading');
    var content = document.getElementById('cartContent');
    var itemsContainer = document.getElementById('cartItemsContainer');
    var emptyCart = document.getElementById('emptyCart');
    var cartSummary = document.getElementById('cartSummary');
    var clearAllBtn = document.getElementById('clearAllBtn');

    // Hide loading spinner
    if (loading) loading.classList.add('hidden');
    if (content) content.classList.remove('hidden');

    // ========== EMPTY CART STATE ==========
    if (cartItems.length === 0) {
        if (emptyCart) emptyCart.classList.remove('hidden');
        if (itemsContainer) itemsContainer.classList.add('hidden');
        if (cartSummary) cartSummary.classList.add('hidden');
        if (clearAllBtn) clearAllBtn.classList.add('hidden');
        return;
    }

    // ========== CART HAS ITEMS ==========
    if (emptyCart) emptyCart.classList.add('hidden');
    if (itemsContainer) itemsContainer.classList.remove('hidden');
    if (cartSummary) cartSummary.classList.remove('hidden');
    if (clearAllBtn) clearAllBtn.classList.remove('hidden');

    // Build HTML for each cart item
    var html = '';
    for (var i = 0; i < cartItems.length; i++) {
        var item = cartItems[i];
        var itemTotal = item.price * item.quantity;
        var imageUrl = item.image || 'https://via.placeholder.com/100x100?text=No+Image';
        var outOfStockClass = item.outOfStock ? 'opacity-50' : '';

        html += '<div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 ' + outOfStockClass + '">' +
            
            // ----- PRODUCT IMAGE (Linked to product detail) -----
            '<a href="../../product-details.html?id=' + item.id + '" class="flex-shrink-0">' +
                '<img src="' + imageUrl + '" alt="' + item.name + '" class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover">' +
            '</a>' +
            
            // ----- PRODUCT INFO -----
            '<div class="flex-1 min-w-0">' +
                '<a href="../../product-details.html?id=' + item.id + '" class="text-sm sm:text-base font-semibold text-gray-800 hover:text-gray-600 transition-colors">' + item.name + '</a>' +
                '<p class="text-sm font-bold text-gray-900 mt-1">$' + item.price.toFixed(2) + '</p>' +
                (item.outOfStock ? '<p class="text-xs text-red-500 mt-1">This item is currently out of stock</p>' : '') +
            '</div>' +
            
            // ----- QUANTITY CONTROLS + REMOVE -----
            '<div class="flex items-center gap-3">' +
                
                // Quantity selector (decrease / count / increase)
                '<div class="flex items-center border-2 border-gray-300 rounded-full">' +
                    '<button onclick="updateItemQty(\'' + item.id + '\', ' + (item.quantity - 1) + ')" class="qty-btn w-8 h-8 flex items-center justify-center text-gray-600 rounded-l-full"><i class="fas fa-minus text-[10px]"></i></button>' +
                    '<span class="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-800 border-x-2 border-gray-300">' + item.quantity + '</span>' +
                    '<button onclick="updateItemQty(\'' + item.id + '\', ' + (item.quantity + 1) + ')" class="qty-btn w-8 h-8 flex items-center justify-center text-gray-600 rounded-r-full"><i class="fas fa-plus text-[10px]"></i></button>' +
                '</div>' +
                
                // Item total price
                '<span class="text-sm font-bold text-gray-900 w-20 text-right">$' + itemTotal.toFixed(2) + '</span>' +
                
                // Remove single item button
                '<button onclick="removeItem(\'' + item.id + '\')" class="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label="Remove item">' +
                    '<i class="fas fa-trash-alt text-sm"></i>' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    // Inject all cart items HTML into container
    if (itemsContainer) itemsContainer.innerHTML = html;

    // Update order summary totals
    updateSummary();
}

/**
 * Update order summary section (subtotal, shipping, total)
 */
function updateSummary() {
    var subtotal = calculateSubtotal();
    var shipping = subtotal >= 500 ? 0 : 50;  // Free shipping for orders over $500
    var total = subtotal + shipping;

    var subtotalEl = document.getElementById('summarySubtotal');
    var shippingEl = document.getElementById('summaryShipping');
    var totalEl = document.getElementById('summaryTotal');

    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    
    if (shippingEl) {
        if (shipping === 0) {
            shippingEl.textContent = 'Free';
            shippingEl.className = 'font-semibold text-green-600';
        } else {
            shippingEl.textContent = '$' + shipping.toFixed(2);
            shippingEl.className = 'font-semibold';
        }
    }
    
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

// ==================== CART ACTIONS ====================

/**
 * Update quantity of a specific item in cart
 * Removes item if quantity becomes 0, caps at 10
 * @param {string} id - Product ID
 * @param {number} newQty - New quantity value
 */
function updateItemQty(id, newQty) {
    // Remove item if quantity falls below 1
    if (newQty < 1) {
        removeItem(id);
        return;
    }
    
    // Cap maximum quantity at 10
    if (newQty > 10) newQty = 10;

    // Find and update the item quantity
    for (var i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id === id) {
            cartItems[i].quantity = newQty;
            break;
        }
    }
    
    saveCart();
    renderCart();
}

/**
 * Remove a single item from cart by ID
 * @param {string} id - Product ID to remove
 */
function removeItem(id) {
    // Filter out the item with matching ID
    cartItems = cartItems.filter(function(item) {
        return item.id !== id;
    });
    
    saveCart();
    renderCart();

    // Show toast notification (function from script.js)
    if (typeof showToast === 'function') {
        showToast('Item removed from cart', 'info');
    }
}

/**
 * Clear ALL items from cart at once
 * Shows confirmation via toast notification
 */
function clearAllItems() {
    // Don't do anything if cart is already empty
    if (cartItems.length === 0) return;
    
    // Empty the entire cart array
    cartItems = [];
    
    saveCart();
    renderCart();

    // Show toast notification
    if (typeof showToast === 'function') {
        showToast('All items removed from cart', 'info');
    }
}

// ==================== INITIALIZATION ====================

/**
 * Initialize cart page when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    loadCart();  // Load cart data from localStorage
    
    // Validate cart with backend API if active, otherwise render directly
    if (typeof isBackendActive === 'function' && isBackendActive()) {
        validateCartWithBackend();
    } else {
        renderCart();
    }
});
