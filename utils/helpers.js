/* ============================================
   js/utils/helpers.js - Utility Helper Functions
   
   Common functions used across the website:
   - Formatting (currency, date, text)
   - Validation (email, phone, URL)
   - DOM manipulation (debounce, throttle)
   - Storage (get/set with expiry)
   - URL parameters
   ============================================ */

// ==================== CURRENCY FORMATTING ====================

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: '$')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency, locale) {
    currency = currency || '$';
    locale = locale || 'en-US';
    
    if (isNaN(amount)) return currency + '0.00';
    
    return currency + parseFloat(amount).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format a number as Bangladeshi Taka
 * @param {number} amount - The amount to format
 * @returns {string} Formatted Taka string
 */
function formatTaka(amount) {
    return '৳' + parseFloat(amount || 0).toFixed(2);
}

/**
 * Parse price from any format to number
 * @param {string|number} price - Price value
 * @returns {number} Parsed price as number
 */
function parsePrice(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    return parseFloat(price.toString().replace(/[^0-9.]/g, '')) || 0;
}

// ==================== DATE FORMATTING ====================

/**
 * Format a date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'full', 'date', 'time', 'relative'
 * @returns {string} Formatted date string
 */
function formatDate(date, format) {
    if (!date) return 'N/A';
    
    var d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    format = format || 'full';
    
    var options = {};
    
    switch (format) {
        case 'full':
            options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            break;
        case 'date':
            options = { year: 'numeric', month: 'long', day: 'numeric' };
            break;
        case 'time':
            options = { hour: '2-digit', minute: '2-digit' };
            break;
        case 'short':
            options = { year: 'numeric', month: 'short', day: 'numeric' };
            break;
        default:
            options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    }
    
    return d.toLocaleDateString('en-US', options);
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
function timeAgo(date) {
    if (!date) return 'N/A';
    
    var d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    var now = new Date();
    var diff = now - d;
    var seconds = Math.floor(diff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    
    if (days > 30) return formatDate(date, 'date');
    if (days > 0) return days + ' day' + (days > 1 ? 's' : '') + ' ago';
    if (hours > 0) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
    if (minutes > 0) return minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
    return 'Just now';
}

// ==================== TEXT FORMATTING ====================

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength, suffix) {
    if (!text) return '';
    maxLength = maxLength || 100;
    suffix = suffix || '...';
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Convert string to slug (URL-friendly)
 * @param {string} text - Text to convert
 * @returns {string} Slug string
 */
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
function capitalizeWords(text) {
    if (!text) return '';
    return text.replace(/\b\w/g, function(char) { return char.toUpperCase(); });
}

/**
 * Generate a random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length) {
    length = length || 10;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ==================== VALIDATION ====================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    if (!email) return false;
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate phone number (Bangladesh format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidBangladeshPhone(phone) {
    if (!phone) return false;
    var cleaned = phone.replace(/[\s\-\(\)]/g, '');
    var regex = /^01[3-9]\d{8}$/;
    return regex.test(cleaned);
}

/**
 * Validate phone number (International format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
    if (!phone) return false;
    var cleaned = phone.replace(/[\s\-\(\)]/g, '');
    var regex = /^\+?[\d]{7,15}$/;
    return regex.test(cleaned);
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
    if (!url) return false;
    var regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return regex.test(url);
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
}

// ==================== DOM UTILITIES ====================

/**
 * Debounce function - limits how often a function can fire
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    var timeout;
    wait = wait || 300;
    return function() {
        var context = this;
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Throttle function - ensures function fires at most once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    var inThrottle;
    limit = limit || 300;
    return function() {
        var context = this;
        var args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function() {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Get element by selector with optional parent
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {HTMLElement|null} Found element or null
 */
function getEl(selector, parent) {
    parent = parent || document;
    return parent.querySelector(selector);
}

/**
 * Get all elements by selector with optional parent
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {NodeList} Found elements
 */
function getEls(selector, parent) {
    parent = parent || document;
    return parent.querySelectorAll(selector);
}

/**
 * Toggle CSS class on an element
 * @param {HTMLElement|string} el - Element or selector
 * @param {string} className - Class to toggle
 */
function toggleClass(el, className) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (el) el.classList.toggle(className);
}

/**
 * Add CSS class to an element
 * @param {HTMLElement|string} el - Element or selector
 * @param {string} className - Class to add
 */
function addClass(el, className) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (el) el.classList.add(className);
}

/**
 * Remove CSS class from an element
 * @param {HTMLElement|string} el - Element or selector
 * @param {string} className - Class to remove
 */
function removeClass(el, className) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (el) el.classList.remove(className);
}

// ==================== STORAGE UTILITIES ====================

/**
 * Set item in localStorage with optional expiry
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} expiryHours - Expiry in hours (optional)
 */
function setStorage(key, value, expiryHours) {
    var data = { value: value };
    
    if (expiryHours) {
        data.expiry = new Date().getTime() + (expiryHours * 60 * 60 * 1000);
    }
    
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Storage full or unavailable:', e);
    }
}

/**
 * Get item from localStorage with expiry check
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found or expired
 * @returns {*} Stored value or default
 */
function getStorage(key, defaultValue) {
    try {
        var stored = localStorage.getItem(key);
        if (!stored) return defaultValue;
        
        var data = JSON.parse(stored);
        
        // Check expiry
        if (data.expiry && new Date().getTime() > data.expiry) {
            localStorage.removeItem(key);
            return defaultValue;
        }
        
        return data.value !== undefined ? data.value : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {}
}

/**
 * Clear all app storage (except cart)
 */
function clearAppStorage() {
    var keepKeys = ['aarvana_cart'];
    var cart = localStorage.getItem('aarvana_cart');
    
    localStorage.clear();
    
    // Restore cart
    if (cart) {
        localStorage.setItem('aarvana_cart', cart);
    }
}

// ==================== URL UTILITIES ====================

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @param {string} url - URL to parse (default: current URL)
 * @returns {string|null} Parameter value or null
 */
function getUrlParam(name, url) {
    url = url || window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Get all URL parameters as an object
 * @param {string} url - URL to parse (default: current URL)
 * @returns {Object} Parameters object
 */
function getUrlParams(url) {
    url = url || window.location.href;
    var params = {};
    var queryString = url.split('?')[1];
    
    if (!queryString) return params;
    
    var pairs = queryString.split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    
    return params;
}

/**
 * Update URL parameter without reloading page
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 */
function updateUrlParam(key, value) {
    var params = getUrlParams();
    params[key] = value;
    
    var queryString = Object.keys(params)
        .map(function(k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
        .join('&');
    
    var newUrl = window.location.pathname + (queryString ? '?' + queryString : '');
    window.history.replaceState({}, '', newUrl);
}

// ==================== NUMBER UTILITIES ====================

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp a number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Pad a number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} size - Total length
 * @returns {string} Padded number string
 */
function padNumber(num, size) {
    size = size || 2;
    return String(num).padStart(size, '0');
}

// ==================== MISCELLANEOUS ====================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} Resolves when copied
 */
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    
    // Fallback for older browsers
    return new Promise(function(resolve, reject) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            resolve();
        } catch (e) {
            reject(e);
        }
        document.body.removeChild(textarea);
    });
}

/**
 * Scroll to element smoothly
 * @param {string|HTMLElement} el - Element or selector
 * @param {number} offset - Offset from top
 */
function scrollToElement(el, offset) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    offset = offset || 0;
    
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobile() {
    return window.innerWidth < 1024;
}

/**
 * Check if device is touch-enabled
 * @returns {boolean} True if touch device
 */
function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

/**
 * Get current page name from URL
 * @returns {string} Page name
 */
function getCurrentPage() {
    var path = window.location.pathname;
    var page = path.split('/').pop();
    return page || 'index.html';
}

/**
 * Log message with timestamp (only in development)
 * @param {string} message - Message to log
 * @param {string} type - Log type: 'log', 'warn', 'error'
 */
function devLog(message, type) {
    type = type || 'log';
    var timestamp = new Date().toISOString();
    var prefix = '[Aarvana ' + timestamp + ']';
    
    switch (type) {
        case 'warn':
            console.warn(prefix, message);
            break;
        case 'error':
            console.error(prefix, message);
            break;
        default:
            console.log(prefix, message);
    }
}