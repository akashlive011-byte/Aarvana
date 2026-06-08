/* ============================================
   js/products/product-logic.js
   Product Business Logic & Utilities
   
   Handles:
   - Price calculations (sale, discount, effective price)
   - Product validation
   - Product formatting
   - Category helpers
   - Badge management
   - SKU generation
   - Product comparison
   ============================================ */

// ==================== PRICE CALCULATIONS ====================

/**
 * Get the effective price of a product
 * Returns sale price if valid, otherwise regular price
 * @param {Object} product - Product object
 * @returns {number} Effective price
 */
function getEffectivePrice(product) {
    if (!product) return 0;
    if (hasValidSale(product)) {
        return product.salePrice;
    }
    return product.price || 0;
}

/**
 * Check if product has a valid sale
 * Sale is valid when salePrice exists AND is less than regular price
 * @param {Object} product - Product object
 * @returns {boolean}
 */
function hasValidSale(product) {
    return product && 
           product.salePrice !== null && 
           product.salePrice !== undefined && 
           product.salePrice > 0 && 
           product.salePrice < product.price;
}

/**
 * Calculate discount percentage
 * @param {Object} product - Product object
 * @returns {number} Discount percentage (0-100)
 */
function getDiscountPercent(product) {
    if (!hasValidSale(product)) return 0;
    return Math.round((1 - product.salePrice / product.price) * 100);
}

/**
 * Calculate discount amount (how much saved)
 * @param {Object} product - Product object
 * @returns {number} Amount saved
 */
function getDiscountAmount(product) {
    if (!hasValidSale(product)) return 0;
    return product.price - product.salePrice;
}

/**
 * Calculate total for a cart item
 * @param {Object} item - Cart item with price and quantity
 * @returns {number} Total amount
 */
function calculateItemTotal(item) {
    if (!item) return 0;
    var price = item.price || 0;
    var qty = item.quantity || 1;
    return price * qty;
}

/**
 * Calculate subtotal for cart items array
 * @param {Array} items - Array of cart items
 * @returns {number} Subtotal amount
 */
function calculateCartSubtotal(items) {
    if (!items || !items.length) return 0;
    var total = 0;
    for (var i = 0; i < items.length; i++) {
        total += calculateItemTotal(items[i]);
    }
    return total;
}

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} Formatted price string
 */
function formatPrice(price, currency) {
    currency = currency || '$';
    if (price === null || price === undefined) return currency + '0.00';
    return currency + parseFloat(price).toFixed(2);
}

/**
 * Format discount as display string
 * @param {number} percent - Discount percentage
 * @returns {string} Formatted discount (e.g., "-25%")
 */
function formatDiscount(percent) {
    return '-' + percent + '%';
}

// ==================== PRODUCT VALIDATION ====================

/**
 * Validate product data before saving
 * @param {Object} product - Product to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateProduct(product) {
    var errors = [];
    
    if (!product.name || product.name.trim() === '') {
        errors.push('Product name is required');
    }
    
    if (!product.price || isNaN(product.price) || product.price <= 0) {
        errors.push('Valid product price is required');
    }
    
    if (product.salePrice && (isNaN(product.salePrice) || product.salePrice < 0)) {
        errors.push('Sale price must be a valid number');
    }
    
    if (product.salePrice && product.salePrice >= product.price) {
        errors.push('Sale price must be less than regular price');
    }
    
    if (!product.category || product.category.trim() === '') {
        errors.push('Product category is required');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Check if product is in stock
 * @param {Object} product - Product object
 * @returns {boolean}
 */
function isInStock(product) {
    if (product.stock === undefined || product.stock === null) return true;
    return product.stock > 0;
}

/**
 * Check if product is low stock
 * @param {Object} product - Product object
 * @returns {boolean}
 */
function isLowStock(product) {
    if (product.stock === undefined || product.lowStockThreshold === undefined) return false;
    return product.stock > 0 && product.stock <= product.lowStockThreshold;
}

/**
 * Check if product is featured
 * @param {Object} product - Product object
 * @returns {boolean}
 */
function isFeatured(product) {
    return product && product.isFeatured === true;
}

// ==================== CATEGORY HELPERS ====================

/**
 * Get all available categories from products
 * @param {Array} products - Array of products
 * @returns {Array} Unique category names
 */
function getCategories(products) {
    if (!products || !products.length) return [];
    
    var categories = {};
    for (var i = 0; i < products.length; i++) {
        if (products[i].category) {
            categories[products[i].category] = true;
        }
    }
    return Object.keys(categories).sort();
}

/**
 * Get all subcategories for a given category
 * @param {Array} products - Array of products
 * @param {string} category - Category name
 * @returns {Array} Unique subcategory names
 */
function getSubcategories(products, category) {
    if (!products || !products.length) return [];
    
    var catProducts = filterByCategory(products, category);
    var subcategories = {};
    
    for (var i = 0; i < catProducts.length; i++) {
        if (catProducts[i].subcategory) {
            subcategories[catProducts[i].subcategory] = true;
        }
    }
    return Object.keys(subcategories).sort();
}

/**
 * Filter products by category
 * @param {Array} products - Array of products
 * @param {string} category - Category name
 * @returns {Array} Filtered products
 */
function filterByCategory(products, category) {
    if (!products || !category || category === 'all') return products || [];
    
    return products.filter(function(p) {
        return p.category && p.category.toLowerCase() === category.toLowerCase();
    });
}

/**
 * Count products per category
 * @param {Array} products - Array of products
 * @returns {Object} Category counts
 */
function countByCategory(products) {
    if (!products || !products.length) return {};
    
    var counts = {};
    for (var i = 0; i < products.length; i++) {
        var cat = products[i].category || 'Uncategorized';
        counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
}

// ==================== BADGE MANAGEMENT ====================

/**
 * Available badge types and their colors
 */
var BADGE_COLORS = {
    'New': 'bg-green-500',
    'Sale': 'bg-red-500',
    'Premium': 'bg-yellow-500',
    'Trending': 'bg-purple-500',
    'Hot': 'bg-orange-500',
    'Limited': 'bg-pink-500',
    'Best Seller': 'bg-blue-500',
    'Exclusive': 'bg-indigo-500'
};

/**
 * Get badge color class
 * @param {string} badge - Badge name
 * @returns {string} CSS class
 */
function getBadgeColor(badge) {
    return BADGE_COLORS[badge] || 'bg-gray-800';
}

/**
 * Get all available badge types
 * @returns {Array} Badge names
 */
function getBadgeTypes() {
    return Object.keys(BADGE_COLORS);
}

/**
 * Filter products by badge
 * @param {Array} products - Array of products
 * @param {string} badge - Badge name
 * @returns {Array} Filtered products
 */
function filterByBadge(products, badge) {
    if (!products || !badge) return products || [];
    
    return products.filter(function(p) {
        return p.badge && p.badge.toLowerCase() === badge.toLowerCase();
    });
}

// ==================== SKU GENERATION ====================

/**
 * Generate a unique SKU for a product
 * @param {string} category - Product category
 * @param {string} name - Product name
 * @returns {string} Generated SKU
 */
function generateSKU(category, name) {
    var prefix = '';
    
    switch((category || '').toLowerCase()) {
        case 'men': prefix = 'MEN'; break;
        case 'women': prefix = 'WMN'; break;
        case 'accessories': prefix = 'ACC'; break;
        default: prefix = 'GEN';
    }
    
    var nameCode = (name || 'PROD').substring(0, 3).toUpperCase();
    var random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    var timestamp = Date.now().toString(36).substring(4, 7).toUpperCase();
    
    return prefix + '-' + nameCode + '-' + timestamp + random;
}

/**
 * Generate a unique product ID
 * @returns {string} Product ID
 */
function generateProductId() {
    return 'PRD_' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000).toString(36).toUpperCase();
}

// ==================== PRODUCT SORTING ====================

/**
 * Sort products by given key
 * @param {Array} products - Array of products
 * @param {string} sortBy - Sort key
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted products
 */
function sortProductsArray(products, sortBy, order) {
    if (!products || !products.length) return [];
    
    var sorted = products.slice();
    order = order || 'asc';
    
    switch(sortBy) {
        case 'price':
            sorted.sort(function(a, b) {
                var pa = getEffectivePrice(a);
                var pb = getEffectivePrice(b);
                return order === 'asc' ? pa - pb : pb - pa;
            });
            break;
            
        case 'name':
            sorted.sort(function(a, b) {
                var compare = (a.name || '').localeCompare(b.name || '');
                return order === 'asc' ? compare : -compare;
            });
            break;
            
        case 'discount':
            sorted.sort(function(a, b) {
                var da = getDiscountPercent(a);
                var db = getDiscountPercent(b);
                return order === 'asc' ? da - db : db - da;
            });
            break;
            
        case 'date':
            sorted.sort(function(a, b) {
                var da = new Date(a.createdAt || 0);
                var db = new Date(b.createdAt || 0);
                return order === 'asc' ? da - db : db - da;
            });
            break;
            
        case 'rating':
            sorted.sort(function(a, b) {
                var ra = a.rating || 0;
                var rb = b.rating || 0;
                return order === 'asc' ? ra - rb : rb - ra;
            });
            break;
            
        default:
            break;
    }
    
    return sorted;
}

// ==================== PRODUCT STATISTICS ====================

/**
 * Get price range of products
 * @param {Array} products - Array of products
 * @returns {Object} { min: number, max: number }
 */
function getPriceRange(products) {
    if (!products || !products.length) return { min: 0, max: 0 };
    
    var min = Infinity;
    var max = -Infinity;
    
    for (var i = 0; i < products.length; i++) {
        var price = getEffectivePrice(products[i]);
        if (price < min) min = price;
        if (price > max) max = price;
    }
    
    return { min: min, max: max };
}

/**
 * Get products on sale
 * @param {Array} products - Array of products
 * @returns {Array} Products with active sales
 */
function getOnSaleProducts(products) {
    if (!products || !products.length) return [];
    
    return products.filter(function(p) {
        return hasValidSale(p);
    });
}

/**
 * Get featured products
 * @param {Array} products - Array of products
 * @returns {Array} Featured products
 */
function getFeaturedProducts(products) {
    if (!products || !products.length) return [];
    
    return products.filter(function(p) {
        return isFeatured(p);
    });
}

/**
 * Get max discount product
 * @param {Array} products - Array of products
 * @returns {Object|null} Product with highest discount
 */
function getMaxDiscountProduct(products) {
    if (!products || !products.length) return null;
    
    var maxDiscount = 0;
    var maxProduct = null;
    
    for (var i = 0; i < products.length; i++) {
        var discount = getDiscountPercent(products[i]);
        if (discount > maxDiscount) {
            maxDiscount = discount;
            maxProduct = products[i];
        }
    }
    
    return maxProduct;
}

// ==================== PRODUCT COMPARISON ====================

/**
 * Compare two products for equality
 * @param {Object} productA
 * @param {Object} productB
 * @returns {boolean}
 */
function areProductsEqual(productA, productB) {
    if (!productA || !productB) return false;
    return productA.id === productB.id || productA.sku === productB.sku;
}

/**
 * Find product by ID or SKU
 * @param {Array} products - Array of products
 * @param {string} id - Product ID or SKU
 * @returns {Object|null}
 */
function findProduct(products, id) {
    if (!products || !id) return null;
    
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id || products[i].sku === id) {
            return products[i];
        }
    }
    return null;
}

// ==================== FORMATTING ====================

/**
 * Format product name for URL slug
 * @param {string} name - Product name
 * @returns {string} URL-friendly slug
 */
function slugify(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
}

/**
 * Get product image or placeholder
 * @param {Object} product - Product object
 * @param {number} index - Image index (default 0)
 * @returns {string} Image URL
 */
function getProductImage(product, index) {
    index = index || 0;
    if (product && product.images && product.images[index]) {
        return product.images[index];
    }
    return 'https://via.placeholder.com/400x500?text=No+Image';
}