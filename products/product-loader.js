/* ============================================
   js/products/product-loader.js
   Product Loading & Filtering Functionality
   
   Handles:
   - Load products from JSON or API
   - Filter by category, price, badge, sale
   - Sort products (price, name, discount)
   - Render product cards with badges
   - Pagination / load more
   - Search functionality
   - Empty states and error handling
   
   Used by: all-products.html, category pages
   ============================================ */

// ==================== PRODUCT DATA ====================

var allProducts = [];           // All loaded products
var filteredProducts = [];     // Products after filtering
var currentPage = 1;           // Current pagination page
var productsPerPage = 12;      // Products per page
var activeFilters = {};        // Active filter settings
var activeSort = 'default';    // Current sort option

// ==================== LOAD PRODUCTS ====================

/**
 * Load all products from data source
 * Priority: API (if backend active) > JSON file
 * @param {Function} callback - Called when products are loaded
 */
function loadAllProducts(callback) {
    // Check if core script's getAllProducts is available
    if (typeof getAllProducts === 'function') {
        getAllProducts(function(products) {
            // Filter out mega sale objects
            allProducts = products.filter(function(p) {
                return p.type !== 'mega_sale';
            });
            filteredProducts = allProducts.slice();
            if (callback) callback(allProducts);
        });
    } else {
        // Fallback: direct fetch
        var jsonPath = 'data/products.json';
        var path = window.location.pathname;
        if (path.indexOf('/men/') !== -1 || path.indexOf('/women/') !== -1 || 
            path.indexOf('/accessories/') !== -1 || path.indexOf('/sales/') !== -1) {
            jsonPath = '../data/products.json';
        }
        
        fetch(jsonPath)
            .then(function(r) { return r.json(); })
            .then(function(products) {
                allProducts = products.filter(function(p) {
                    return p.type !== 'mega_sale';
                });
                filteredProducts = allProducts.slice();
                if (callback) callback(allProducts);
            })
            .catch(function() {
                if (callback) callback([]);
            });
    }
}

// ==================== FILTER FUNCTIONS ====================

/**
 * Apply all active filters to products
 * @returns {Array} Filtered products
 */
function applyAllFilters() {
    var results = allProducts.slice();
    
    // Filter by category
    if (activeFilters.category && activeFilters.category !== 'all') {
        results = results.filter(function(p) {
            return p.category && p.category.toLowerCase() === activeFilters.category.toLowerCase();
        });
    }
    
    // Filter by subcategory (name match)
    if (activeFilters.subcategory && activeFilters.subcategory !== 'all') {
        results = results.filter(function(p) {
            return p.name && p.name.toLowerCase().indexOf(activeFilters.subcategory.toLowerCase()) !== -1;
        });
    }
    
    // Filter by price range
    if (activeFilters.priceRange && activeFilters.priceRange !== 'all') {
        results = filterByPriceRange(results, activeFilters.priceRange);
    }
    
    // Filter by badge
    if (activeFilters.badges && activeFilters.badges.length > 0) {
        results = results.filter(function(p) {
            return p.badge && activeFilters.badges.indexOf(p.badge) !== -1;
        });
    }
    
    // Filter on sale only
    if (activeFilters.onSale) {
        results = results.filter(function(p) {
            return p.salePrice !== null && p.salePrice !== undefined && p.salePrice < p.price;
        });
    }
    
    // Filter by search query
    if (activeFilters.search) {
        var query = activeFilters.search.toLowerCase();
        results = results.filter(function(p) {
            var nameMatch = p.name && p.name.toLowerCase().indexOf(query) !== -1;
            var catMatch = p.category && p.category.toLowerCase().indexOf(query) !== -1;
            return nameMatch || catMatch;
        });
    }
    
    filteredProducts = results;
    return results;
}

/**
 * Filter products by price range
 * @param {Array} products - Products to filter
 * @param {string} range - Price range key (0-500, 500-1000, etc.)
 * @returns {Array} Filtered products
 */
function filterByPriceRange(products, range) {
    return products.filter(function(p) {
        var price = (p.salePrice !== null && p.salePrice < p.price) ? p.salePrice : p.price;
        
        switch(range) {
            case '0-500': return price < 500;
            case '500-1000': return price >= 500 && price < 1000;
            case '1000-2000': return price >= 1000 && price < 2000;
            case '2000-5000': return price >= 2000 && price < 5000;
            case '5000+': return price >= 5000;
            default: return true;
        }
    });
}

/**
 * Set a filter value
 * @param {string} key - Filter key (category, priceRange, badges, etc.)
 * @param {*} value - Filter value
 */
function setFilter(key, value) {
    activeFilters[key] = value;
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    activeFilters = {};
    filteredProducts = allProducts.slice();
    currentPage = 1;
    activeSort = 'default';
}

// ==================== SORT FUNCTIONS ====================

/**
 * Sort products by given option
 * @param {string} sortOption - Sort key (price-asc, price-desc, name-asc, name-desc, discount-desc)
 * @returns {Array} Sorted products
 */
function sortProducts(sortOption) {
    activeSort = sortOption;
    var products = filteredProducts.slice();
    
    switch(sortOption) {
        case 'price-asc':
            products.sort(function(a, b) {
                var pa = getEffectivePrice(a);
                var pb = getEffectivePrice(b);
                return pa - pb;
            });
            break;
            
        case 'price-desc':
            products.sort(function(a, b) {
                var pa = getEffectivePrice(a);
                var pb = getEffectivePrice(b);
                return pb - pa;
            });
            break;
            
        case 'name-asc':
            products.sort(function(a, b) {
                return (a.name || '').localeCompare(b.name || '');
            });
            break;
            
        case 'name-desc':
            products.sort(function(a, b) {
                return (b.name || '').localeCompare(a.name || '');
            });
            break;
            
        case 'discount-desc':
            products.sort(function(a, b) {
                var da = getDiscountPercent(a);
                var db = getDiscountPercent(b);
                return db - da;
            });
            break;
            
        case 'newest':
            products.sort(function(a, b) {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });
            break;
            
        default:
            break;
    }
    
    filteredProducts = products;
    return products;
}

/**
 * Get effective price (sale price if available, otherwise regular)
 * @param {Object} product
 * @returns {number}
 */
function getEffectivePrice(product) {
    return (product.salePrice !== null && product.salePrice !== undefined && product.salePrice < product.price) 
        ? product.salePrice 
        : product.price;
}

/**
 * Get discount percentage
 * @param {Object} product
 * @returns {number}
 */
function getDiscountPercent(product) {
    if (product.salePrice && product.salePrice < product.price) {
        return Math.round((1 - product.salePrice / product.price) * 100);
    }
    return 0;
}

// ==================== PAGINATION ====================

/**
 * Get products for current page
 * @returns {Array} Products for current page
 */
function getCurrentPageProducts() {
    var start = (currentPage - 1) * productsPerPage;
    var end = start + productsPerPage;
    return filteredProducts.slice(start, end);
}

/**
 * Get total number of pages
 * @returns {number}
 */
function getTotalPages() {
    return Math.ceil(filteredProducts.length / productsPerPage);
}

/**
 * Go to specific page
 * @param {number} page - Page number
 */
function goToPage(page) {
    var totalPages = getTotalPages();
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
}

/**
 * Load more products (infinite scroll)
 * @returns {Array} Next batch of products
 */
function loadMoreProducts() {
    if (currentPage >= getTotalPages()) return [];
    currentPage++;
    return getCurrentPageProducts();
}

// ==================== RENDER FUNCTIONS ====================

/**
 * Render product cards into a grid container
 * @param {Array} products - Products to render
 * @param {HTMLElement} grid - Grid container element
 * @param {number} limit - Max products to show (optional)
 */
function renderProductGrid(products, grid, limit) {
    if (!grid) return;
    
    var displayProducts = limit ? products.slice(0, limit) : products;
    
    // Use core script's renderProductCards if available
    if (typeof renderProductCards === 'function') {
        renderProductCards(displayProducts, grid);
        return;
    }
    
    // Fallback rendering
    var detailPath = typeof getProductDetailPath === 'function' ? getProductDetailPath() : 'product-details.html';
    var html = '';
    
    for (var i = 0; i < displayProducts.length; i++) {
        var p = displayProducts[i];
        var hasValidSale = (p.salePrice !== null && p.salePrice !== undefined && p.salePrice < p.price);
        var discount = hasValidSale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
        
        var priceHtml = hasValidSale 
            ? '<span class="text-sm sm:text-lg font-bold text-red-600">$' + p.salePrice.toFixed(2) + '</span>' +
              '<span class="text-[10px] sm:text-sm text-gray-400 line-through ml-1.5">$' + p.price.toFixed(2) + '</span>'
            : '<span class="text-sm sm:text-lg font-bold text-gray-800">$' + p.price.toFixed(2) + '</span>';
        
        var safeName = (p.name || '').replace(/'/g, "\\'");
        var imageUrl = p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400x500?text=No+Image';
        
        var discountBadge = (hasValidSale && discount > 0) 
            ? '<span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">-' + discount + '%</span>' 
            : '';
        
        var customBadge = '';
        if (p.badge) {
            var bc = { 'New': 'bg-green-500', 'Sale': 'bg-red-500', 'Premium': 'bg-aarvana-gold', 'Trending': 'bg-purple-500', 'Hot': 'bg-orange-500', 'Limited': 'bg-pink-500' };
            customBadge = '<span class="absolute top-2 right-2 ' + (bc[p.badge] || 'bg-gray-800') + ' text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">' + p.badge.toUpperCase() + '</span>';
        }
        
        html += '<div class="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group">' +
            '<a href="' + detailPath + '?id=' + p.id + '" class="block relative overflow-hidden aspect-[3/4]">' +
                '<img src="' + imageUrl + '" alt="' + p.name + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">' +
                discountBadge + customBadge +
            '</a>' +
            '<div class="p-3 sm:p-4">' +
                '<p class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mb-0.5">' + (p.category || '') + '</p>' +
                '<h3 class="font-medium sm:font-semibold text-gray-800 text-sm sm:text-base mb-1.5 truncate">' +
                    '<a href="' + detailPath + '?id=' + p.id + '" class="hover:text-gray-600 transition-colors">' + p.name + '</a>' +
                '</h3>' +
                '<div class="flex items-center justify-between"><div>' + priceHtml + '</div></div>' +
            '</div>' +
        '</div>';
    }
    
    grid.innerHTML = html;
}

/**
 * Render pagination controls
 * @param {HTMLElement} container - Pagination container
 * @param {Function} onPageChange - Callback when page changes
 */
function renderPagination(container, onPageChange) {
    if (!container) return;
    
    var totalPages = getTotalPages();
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    var html = '<div class="flex items-center justify-center gap-2">';
    
    // Previous button
    html += '<button onclick="' + (currentPage > 1 ? 'goToPage(' + (currentPage - 1) + ');' + (onPageChange ? onPageChange + '()' : '') : '') + '" ' +
        'class="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 ' + (currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-800 hover:text-gray-800') + '">' +
        '<i class="fas fa-chevron-left text-xs"></i></button>';
    
    // Page numbers
    for (var i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += '<span class="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">' + i + '</span>';
        } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += '<button onclick="goToPage(' + i + ');' + (onPageChange ? onPageChange + '()' : '') + '" ' +
                'class="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-sm text-gray-600 hover:border-gray-800 hover:text-gray-800">' + i + '</button>';
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span class="text-gray-400">...</span>';
        }
    }
    
    // Next button
    html += '<button onclick="' + (currentPage < totalPages ? 'goToPage(' + (currentPage + 1) + ');' + (onPageChange ? onPageChange + '()' : '') : '') + '" ' +
        'class="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 ' + (currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-800 hover:text-gray-800') + '">' +
        '<i class="fas fa-chevron-right text-xs"></i></button>';
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Update results count display
 * @param {HTMLElement} element - Count display element
 */
function updateResultsCount(element) {
    if (!element) return;
    var total = filteredProducts.length;
    var showing = getCurrentPageProducts().length;
    element.textContent = 'Showing ' + showing + ' of ' + total + ' product' + (total !== 1 ? 's' : '');
}

// ==================== SEARCH ====================

/**
 * Search products by query
 * @param {string} query - Search query
 * @returns {Array} Matching products
 */
function searchProducts(query) {
    if (!query || query.trim() === '') {
        filteredProducts = allProducts.slice();
        return filteredProducts;
    }
    
    activeFilters.search = query.trim();
    return applyAllFilters();
}

// ==================== EMPTY STATE ====================

/**
 * Show empty state in grid
 * @param {HTMLElement} grid - Grid container
 * @param {string} message - Empty state message
 */
function showEmptyState(grid, message) {
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full text-center py-12">' +
        '<i class="fas fa-box-open text-5xl text-gray-300 mb-4"></i>' +
        '<p class="text-gray-400 text-sm">' + (message || 'No products found') + '</p>' +
    '</div>';
}

/**
 * Show loading state in grid
 * @param {HTMLElement} grid - Grid container
 */
function showLoadingState(grid) {
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full flex justify-center py-12">' +
        '<div class="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-gray-800"></div>' +
    '</div>';
}

// ==================== INITIALIZATION ====================

/**
 * Initialize product loader
 * @param {Object} options - Configuration options
 * @param {string} options.category - Filter by category
 * @param {string} options.gridId - Grid container ID
 * @param {string} options.countId - Results count element ID
 * @param {string} options.paginationId - Pagination container ID
 * @param {number} options.limit - Max products to show
 * @param {Function} options.onLoad - Callback after products load
 */
function initProductLoader(options) {
    options = options || {};
    
    var grid = options.gridId ? document.getElementById(options.gridId) : null;
    var countEl = options.countId ? document.getElementById(options.countId) : null;
    var paginationEl = options.paginationId ? document.getElementById(options.paginationId) : null;
    
    if (grid) showLoadingState(grid);
    
    loadAllProducts(function(products) {
        // Apply category filter if specified
        if (options.category) {
            setFilter('category', options.category);
            applyAllFilters();
        }
        
        // Apply sort if specified
        if (options.sort) {
            sortProducts(options.sort);
        }
        
        // Render products
        if (grid) {
            var displayProducts = options.limit ? filteredProducts.slice(0, options.limit) : getCurrentPageProducts();
            
            if (displayProducts.length > 0) {
                renderProductGrid(displayProducts, grid);
            } else {
                showEmptyState(grid, options.emptyMessage || 'No products found');
            }
        }
        
        // Update count
        if (countEl) updateResultsCount(countEl);
        
        // Render pagination
        if (paginationEl && !options.limit) {
            renderPagination(paginationEl, function() {
                if (grid) renderProductGrid(getCurrentPageProducts(), grid);
                if (countEl) updateResultsCount(countEl);
                window.scrollTo({ top: grid ? grid.offsetTop - 100 : 0, behavior: 'smooth' });
            });
        }
        
        // Callback
        if (options.onLoad) options.onLoad(products);
    });
}