/* ============================================
   js/products/product-details.js
   Product Detail Page Functionality
   Handles: Loading product by ID, rendering details,
   SKU display, Quantity controls, Add to cart,
   Related products, Error handling
   ============================================ */

// ==================== PRODUCT DATA ====================

var currentProduct = null;  // Currently displayed product
var quantity = 1;           // Selected quantity

/**
 * Get product ID from URL query parameter
 * Example: product-details.html?id=1
 * @returns {string|null} Product ID or null
 */
function getProductIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Load product details by ID from data/products.json
 * Searches all products and renders if found
 */
function loadProductDetails() {
    var productId = getProductIdFromUrl();
    
    // No ID provided in URL - show error state
    if (!productId) {
        showError();
        return;
    }

    // Try using core script's getAllProducts function
    if (typeof getAllProducts === 'function') {
        getAllProducts(function(products) {
            var found = findProductById(products, productId);
            if (found) {
                renderProductDetails(found);
                loadRelatedProducts(found, products);
            } else {
                showError();
            }
        });
    } else {
        // Fallback: direct fetch from JSON file
        fetch('data/products.json')
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to load');
                return response.json();
            })
            .then(function(products) {
                var found = findProductById(products, productId);
                if (found) {
                    renderProductDetails(found);
                    loadRelatedProducts(found, products);
                } else {
                    showError();
                }
            })
            .catch(function() {
                showError();
            });
    }
}

/**
 * Find a product by ID or SKU in an array
 * @param {Array} products - Array of product objects
 * @param {string} id - Product ID or SKU to find
 * @returns {Object|null} Found product or null
 */
function findProductById(products, id) {
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id || products[i].sku === id) {
            return products[i];
        }
    }
    return null;
}

/**
 * Render product details on the page
 * Updates: breadcrumb, SKU, name, category, price, image, badges, description
 * @param {Object} product - The product object to display
 */
function renderProductDetails(product) {
    currentProduct = product;
    
    // Hide loading spinner, show product content
    var loading = document.getElementById('productLoading');
    var content = document.getElementById('productContent');
    if (loading) loading.classList.add('hidden');
    if (content) content.classList.remove('hidden');
    
    // ==================== PRODUCT NAME ====================
    var nameEl = document.getElementById('productName');
    if (nameEl) nameEl.textContent = product.name;
    
    // ==================== SKU DISPLAY ====================
    var skuEl = document.getElementById('productSKU');
    if (skuEl) {
        var skuValue = product.sku || product.id || 'N/A';
        skuEl.textContent = 'SKU: ' + skuValue;
    }
    
    // ==================== CATEGORY LABEL ====================
    var catEl = document.getElementById('productCategory');
    if (catEl) catEl.textContent = product.category || '';
    
    // ==================== BREADCRUMB ====================
    var breadcrumbEl = document.getElementById('breadcrumbCategory');
    if (breadcrumbEl && product.category) {
        var catLower = product.category.toLowerCase();
        if (catLower === 'men') {
            breadcrumbEl.innerHTML = '<a href="men/men.html" class="hover:text-gray-800">Men</a>' +
                '<i class="fas fa-chevron-right text-[10px] mx-2"></i>' +
                '<span class="text-gray-800 font-medium">' + product.name + '</span>';
        } else if (catLower === 'women') {
            breadcrumbEl.innerHTML = '<a href="women/women.html" class="hover:text-gray-800">Women</a>' +
                '<i class="fas fa-chevron-right text-[10px] mx-2"></i>' +
                '<span class="text-gray-800 font-medium">' + product.name + '</span>';
        } else if (catLower === 'accessories') {
            breadcrumbEl.innerHTML = '<a href="accessories/accessories.html" class="hover:text-gray-800">Accessories</a>' +
                '<i class="fas fa-chevron-right text-[10px] mx-2"></i>' +
                '<span class="text-gray-800 font-medium">' + product.name + '</span>';
        } else {
            breadcrumbEl.textContent = product.name;
        }
    }
    
    // ==================== MAIN PRODUCT IMAGE ====================
    var imageUrl = product.images && product.images[0] 
        ? product.images[0] 
        : 'https://via.placeholder.com/600x800?text=No+Image';
    var mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageUrl;
        mainImage.alt = product.name;
    }
    
    // ==================== PRICE DISPLAY LOGIC ====================
    // Only show sale price if salePrice is actually LOWER than regular price
    var hasValidSale = (product.salePrice !== null && 
                        product.salePrice !== undefined && 
                        product.salePrice < product.price);
    
    var salePriceEl = document.getElementById('salePrice');
    var originalPriceEl = document.getElementById('originalPrice');
    var regularPriceEl = document.getElementById('regularPrice');
    var discountBadgeEl = document.getElementById('discountBadge');
    
    if (hasValidSale) {
        // Show sale price in RED + original price with STRIKETHROUGH
        if (salePriceEl) {
            salePriceEl.textContent = '$' + product.salePrice.toFixed(2);
            salePriceEl.classList.remove('hidden');
        }
        if (originalPriceEl) {
            originalPriceEl.textContent = '$' + product.price.toFixed(2);
            originalPriceEl.classList.remove('hidden');
        }
        if (regularPriceEl) regularPriceEl.classList.add('hidden');
        
        // Show discount percentage badge on image
        if (discountBadgeEl) {
            var discount = Math.round((1 - product.salePrice / product.price) * 100);
            discountBadgeEl.textContent = '-' + discount + '%';
            discountBadgeEl.classList.remove('hidden');
        }
    } else {
        // Show ONLY regular price (no sale indicators)
        if (salePriceEl) salePriceEl.classList.add('hidden');
        if (originalPriceEl) originalPriceEl.classList.add('hidden');
        if (regularPriceEl) {
            regularPriceEl.textContent = '$' + product.price.toFixed(2);
            regularPriceEl.classList.remove('hidden');
        }
        if (discountBadgeEl) discountBadgeEl.classList.add('hidden');
    }
    
    // ==================== CUSTOM BADGE (New, Sale, Premium, etc.) ====================
    var customBadgeEl = document.getElementById('customBadge');
    if (customBadgeEl && product.badge) {
        var badgeColors = {
            'New': 'bg-green-500',
            'Sale': 'bg-red-500',
            'Premium': 'bg-aarvana-gold',
            'Trending': 'bg-purple-500',
            'Hot': 'bg-orange-500',
            'Limited': 'bg-pink-500'
        };
        var badgeColor = badgeColors[product.badge] || 'bg-gray-800';
        customBadgeEl.className = 'absolute top-4 right-4 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg ' + badgeColor;
        customBadgeEl.textContent = product.badge.toUpperCase();
        customBadgeEl.classList.remove('hidden');
    } else if (customBadgeEl) {
        customBadgeEl.classList.add('hidden');
    }
    
    // ==================== PRODUCT DESCRIPTION ====================
    var descEl = document.getElementById('productDescription');
    if (descEl) {
        descEl.textContent = product.description || 
            'Premium ' + product.name + ' from Aarvana. Crafted with the finest materials for exceptional quality and style.';
    }
}

// ==================== RELATED PRODUCTS ====================

/**
 * Load and display related products (same category, excluding current)
 * Limited to 4 products
 * @param {Object} product - Current product
 * @param {Array} allProducts - All available products
 */
function loadRelatedProducts(product, allProducts) {
    var grid = document.getElementById('relatedProductsGrid');
    if (!grid) return;
    
    // Filter: same category, different ID/SKU, limit to 4
    var related = allProducts.filter(function(p) {
        return p.category === product.category && p.id !== product.id && p.sku !== product.sku;
    }).slice(0, 4);
    
    // No related products found
    if (related.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-400 text-sm py-8">No related products found</p>';
        return;
    }
    
    // Use core script's renderProductCards if available
    if (typeof renderProductCards === 'function') {
        renderProductCards(related, grid);
        return;
    }
    
    // Fallback: render related product cards manually
    var html = '';
    for (var i = 0; i < related.length; i++) {
        var p = related[i];
        var hasSale = (p.salePrice !== null && p.salePrice !== undefined && p.salePrice < p.price);
        var discount = hasSale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
        
        // Price HTML
        var priceHtml = hasSale 
            ? '<span class="text-sm font-bold text-red-600">$' + p.salePrice.toFixed(2) + '</span>' +
              '<span class="text-xs text-gray-400 line-through ml-1.5">$' + p.price.toFixed(2) + '</span>'
            : '<span class="text-sm font-bold text-gray-800">$' + p.price.toFixed(2) + '</span>';
        
        var img = p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400x500?text=No+Image';
        var safeName = p.name.replace(/'/g, "\\'");
        
        html += '<a href="product-details.html?id=' + p.id + '" class="related-card bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 group">' +
            '<div class="relative overflow-hidden aspect-[3/4]">' +
                '<img src="' + img + '" alt="' + p.name + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">' +
                (discount > 0 ? '<span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-' + discount + '%</span>' : '') +
            '</div>' +
            '<div class="p-3">' +
                '<p class="text-[10px] text-gray-400 uppercase tracking-wider">' + (p.category || '') + '</p>' +
                '<h3 class="text-sm font-semibold text-gray-800 truncate">' + p.name + '</h3>' +
                '<div class="mt-1">' + priceHtml + '</div>' +
            '</div>' +
        '</a>';
    }
    grid.innerHTML = html;
}

// ==================== ERROR HANDLING ====================

/**
 * Show error state when product is not found
 */
function showError() {
    var loading = document.getElementById('productLoading');
    var content = document.getElementById('productContent');
    var error = document.getElementById('productError');
    
    if (loading) loading.classList.add('hidden');
    if (content) content.classList.add('hidden');
    if (error) error.classList.remove('hidden');
}

// ==================== QUANTITY CONTROLS ====================

/**
 * Increase quantity by 1 (max 10)
 */
function increaseQty() {
    var input = document.getElementById('quantityInput');
    if (!input) return;
    
    var val = parseInt(input.value) || 1;
    if (val < 10) {
        val++;
        input.value = val;
        quantity = val;
    }
}

/**
 * Decrease quantity by 1 (min 1)
 */
function decreaseQty() {
    var input = document.getElementById('quantityInput');
    if (!input) return;
    
    var val = parseInt(input.value) || 1;
    if (val > 1) {
        val--;
        input.value = val;
        quantity = val;
    }
}

/**
 * Validate manual quantity input
 * Ensures value is between 1 and 10
 */
function validateQty() {
    var input = document.getElementById('quantityInput');
    if (!input) return;
    
    var val = parseInt(input.value);
    
    if (isNaN(val) || val < 1) {
        input.value = 1;
        quantity = 1;
    } else if (val > 10) {
        input.value = 10;
        quantity = 10;
    } else {
        quantity = val;
    }
}

// ==================== ADD TO CART ====================

/**
 * Add current product to shopping cart
 * Uses quantity selected by user
 * Shows ONE toast notification for the total quantity
 */
function addToCartFromDetail(silent) {
    if (!currentProduct) return;
    
    // Determine correct price (sale price if valid, otherwise regular)
    var hasValidSale = (currentProduct.salePrice !== null &&
        currentProduct.salePrice !== undefined &&
        currentProduct.salePrice < currentProduct.price);
    var price = hasValidSale ? currentProduct.salePrice : currentProduct.price;
    
    // Get product image
    var imageUrl = currentProduct.images && currentProduct.images[0] ?
        currentProduct.images[0] :
        'https://via.placeholder.com/400x500?text=No+Image';
    
    // Add to cart with full quantity at once (single cart entry with quantity)
    if (typeof addToCartWithQuantity === 'function') {
        addToCartWithQuantity(currentProduct.id, currentProduct.name, price, imageUrl, quantity);
    } else if (typeof addToCart === 'function') {
        // Fallback: add once with quantity property
        var cart = JSON.parse(localStorage.getItem('aarvana_cart') || '[]');
        var ex = null;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === currentProduct.id) { ex = cart[i]; break; }
        }
        if (ex) {
            ex.quantity += quantity;
        } else {
            cart.push({ id: currentProduct.id, name: currentProduct.name, price: price, image: imageUrl, quantity: quantity });
        }
        localStorage.setItem('aarvana_cart', JSON.stringify(cart));
        updateCartCount();
    }
    
    // Show ONE toast notification (only if not silent)
    if (!silent) {
        if (typeof showToast === 'function') {
            showToast(currentProduct.name + ' (x' + quantity + ') added to cart!', 'success');
        }
    }
    
    // Reset quantity to 1
    quantity = 1;
    var input = document.getElementById('quantityInput');
    if (input) input.value = 1;
}

// ==================== BUY NOW ====================

/**
 * Add to cart silently and redirect to checkout page
 * No double notification - just redirects
 */
function buyNow() {
    // Add to cart silently (no toast)
    addToCartFromDetail(true);
    
    // Short delay to allow cart to update, then redirect
    setTimeout(function() {
        window.location.href = 'js/checkout/checkout.html';
    }, 300);
}
// ==================== INITIALIZATION ====================

/**
 * Initialize product detail page on DOM ready
 */
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();  // Load product by URL ID or SKU
    updateCartCount();     // Update cart badge in header
});