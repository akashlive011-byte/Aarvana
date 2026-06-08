/* ============================================
   js/core/script.js - Core JavaScript
   Handles: Sidebar, Dropdowns (+/- toggle), Hero Slider,
   Mega Sale Loader, Countdown Timer, Search Modal with Live Results,
   Toast Notifications, Cart, Featured Products (4 max),
   Category Products, Product Detail Path Detection
   ============================================ */

// ==================== SIDEBAR FUNCTIONS ====================

function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        closeSidebar();
    }
}

function closeSidebar() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.add('hidden');
    document.body.style.overflow = '';
    closeAllDropdowns();
}

window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) closeSidebar();
});

// ==================== DROPDOWN FUNCTIONS (+/- TOGGLE) ====================

function toggleDropdown(dropdownId) {
    var dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    var icon = document.getElementById(dropdownId + 'Icon');
    var isHidden = dropdown.classList.contains('hidden');
    closeAllDropdowns();
    if (isHidden) {
        dropdown.classList.remove('hidden');
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.transition = 'all 0.3s ease';
        requestAnimationFrame(function() {
            dropdown.style.opacity = '1';
            dropdown.style.transform = 'translateY(0)';
        });
        if (icon) { icon.classList.remove('fa-plus'); icon.classList.add('fa-minus'); }
    }
}

function closeAllDropdowns() {
    ['menDropdown', 'womenDropdown', 'accessoriesDropdown'].forEach(function(id) {
        var dropdown = document.getElementById(id);
        var icon = document.getElementById(id + 'Icon');
        if (dropdown) { dropdown.classList.add('hidden'); dropdown.style.opacity = ''; dropdown.style.transform = ''; }
        if (icon) { icon.classList.remove('fa-minus'); icon.classList.add('fa-plus'); }
    });
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('[onclick*="toggleDropdown"]') && !e.target.closest('.dropdown-menu')) closeAllDropdowns();
});

// ==================== HERO SLIDER ====================

var currentSlide = 0, totalSlides = 2, sliderInterval, isTransitioning = false;

function goToSlide(index) {
    if (isTransitioning || index === currentSlide) return;
    isTransitioning = true;
    var slides = document.querySelectorAll('.hero-slide'), dots = document.querySelectorAll('.dot-indicator');
    if (!slides.length) return;
    slides[currentSlide].classList.add('opacity-0'); slides[currentSlide].classList.remove('opacity-100');
    dots[currentSlide].classList.remove('active'); dots[currentSlide].style.width = ''; dots[currentSlide].style.borderRadius = '';
    currentSlide = index;
    slides[currentSlide].classList.remove('opacity-0'); slides[currentSlide].classList.add('opacity-100');
    dots[currentSlide].classList.add('active'); dots[currentSlide].style.width = '24px'; dots[currentSlide].style.borderRadius = '12px';
    setTimeout(function() { isTransitioning = false; }, 700);
    resetAutoplay();
}

function nextSlide() { goToSlide((currentSlide + 1) % totalSlides); }
function prevSlide() { goToSlide((currentSlide - 1 + totalSlides) % totalSlides); }
function resetAutoplay() { clearInterval(sliderInterval); sliderInterval = setInterval(nextSlide, 5000); }

function initSlider() {
    var dots = document.querySelectorAll('.dot-indicator');
    if (dots.length) { dots[0].classList.add('active'); dots[0].style.width = '24px'; dots[0].style.borderRadius = '12px'; }
    resetAutoplay();
    var slider = document.getElementById('heroSlider');
    if (slider) {
        slider.addEventListener('mouseenter', function() { clearInterval(sliderInterval); });
        slider.addEventListener('mouseleave', function() { resetAutoplay(); });
        var tx = 0;
        slider.addEventListener('touchstart', function(e) { tx = e.changedTouches[0].screenX; }, { passive: true });
        slider.addEventListener('touchend', function(e) { var d = tx - e.changedTouches[0].screenX; if (d > 50) nextSlide(); if (d < -50) prevSlide(); }, { passive: true });
    }
}

document.addEventListener('DOMContentLoaded', initSlider);

// ==================== MEGA SALE DYNAMIC LOADER ====================

var MEGA_SALE_STORAGE_KEY = 'aarvana_mega_sale_offers', MEGA_SALE_ACTIVE_KEY = 'aarvana_mega_sale_active';

function getDefaultMegaSaleOffer() {
    return {
        id: 'default_mega_001', type: 'mega_sale',
        title: 'UP TO <span class="text-yellow-300">50%</span> OFF',
        subtitle: 'Everything Must Go!', discount: 50,
        badge: 'FLASH SALE', badgeBg: 'bg-white', badgeText: 'text-red-600',
        description: "Don't miss out on the biggest sale of the season. Limited stock available.",
        ctaText: 'SHOP SALE', ctaLink: 'sales/sales.html',
        ctaBg: 'bg-white', ctaTextColor: 'text-red-600', ctaHoverBg: 'hover:bg-gray-100',
        bgGradient: 'from-red-600 via-rose-700 to-pink-800', countdownDays: 3,
        isActive: true, startDate: null, endDate: null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
}

function getAllMegaSaleOffers() {
    try { var s = localStorage.getItem(MEGA_SALE_STORAGE_KEY); return s ? JSON.parse(s) : [getDefaultMegaSaleOffer()]; }
    catch(e) { return [getDefaultMegaSaleOffer()]; }
}

function saveMegaSaleOffers(o) { try { localStorage.setItem(MEGA_SALE_STORAGE_KEY, JSON.stringify(o)); } catch(e) {} }

function getActiveMegaSaleOffer() {
    var o = getAllMegaSaleOffers(), a = null;
    for (var i = 0; i < o.length; i++) {
        if (!o[i].isActive) continue;
        if (o[i].startDate && new Date(o[i].startDate) > new Date()) continue;
        if (o[i].endDate && new Date(o[i].endDate) < new Date()) continue;
        a = o[i]; break;
    }
    if (!a && o.length > 0) { a = o[0]; a.isActive = true; }
    if (!a) { a = getDefaultMegaSaleOffer(); saveMegaSaleOffers([a]); }
    return a;
}

function renderMegaSale(offer) {
    var section = document.getElementById('megaSaleSection');
    var content = document.getElementById('megaSaleContent');
    var decorations = document.getElementById('megaSaleDecorations');
    if (!section || !content) return;
    
    section.className = 'relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-br ' + (offer.bgGradient || 'from-red-600 via-rose-700 to-pink-800');
    
    if (decorations) {
        decorations.innerHTML = '<div class="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full opacity-5"></div>' +
            '<div class="absolute -bottom-32 -right-32 w-96 h-96 bg-white rounded-full opacity-5"></div>' +
            '<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white rounded-full opacity-5"></div>';
    }
    
    var badgeHtml = offer.badge ?
        '<div class="inline-flex items-center ' + (offer.badgeBg || 'bg-white') + ' ' + (offer.badgeText || 'text-red-600') + ' text-xs sm:text-sm font-bold px-4 sm:px-5 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 animate-pulse">' +
        '<span class="w-2 h-2 rounded-full mr-2" style="background-color:currentColor"></span> ' + offer.badge + '</div>' : '';
    
    content.innerHTML = '<div class="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">' +
        '<div class="text-center lg:text-left flex-1">' + badgeHtml +
        '<h2 class="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white mb-3 leading-none">' + (offer.title || 'UP TO <span class="text-yellow-300">50%</span> OFF') + '</h2>' +
        '<p class="text-xl sm:text-2xl text-white/80 mb-2 font-light">' + (offer.subtitle || '') + '</p>' +
        (offer.description ? '<p class="text-white/60 text-sm sm:text-base mb-6 max-w-md mx-auto lg:mx-0">' + offer.description + '</p>' : '') +
        '<a href="' + (offer.ctaLink || 'sales/sales.html') + '" class="inline-flex items-center ' + (offer.ctaBg || 'bg-white') + ' ' + (offer.ctaTextColor || 'text-red-600') + ' font-bold px-8 sm:px-10 py-3 sm:py-4 rounded-full ' + (offer.ctaHoverBg || 'hover:bg-gray-100') + ' transition-all transform hover:scale-105 text-sm sm:text-lg shadow-2xl">' +
        (offer.ctaText || 'SHOP SALE') + ' <i class="fas fa-arrow-right ml-2"></i></a></div>' +
        '<div class="flex-1 w-full max-w-md"><div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white border-opacity-20">' +
        '<p class="text-white text-center text-sm sm:text-base font-semibold mb-4 sm:mb-6 tracking-wider uppercase">Sale Ends In</p>' +
        '<div id="countdownTimer" class="flex justify-center space-x-3 sm:space-x-4">' +
        '<div class="flex flex-col items-center"><div class="bg-white rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg"><span id="countdownDays" class="text-2xl sm:text-3xl lg:text-4xl font-black text-red-600">00</span></div><span class="text-white/70 text-[10px] sm:text-xs mt-2 uppercase tracking-wider">Days</span></div>' +
        '<span class="text-white text-2xl sm:text-3xl font-bold self-start mt-3">:</span>' +
        '<div class="flex flex-col items-center"><div class="bg-white rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg"><span id="countdownHours" class="text-2xl sm:text-3xl lg:text-4xl font-black text-red-600">00</span></div><span class="text-white/70 text-[10px] sm:text-xs mt-2 uppercase tracking-wider">Hours</span></div>' +
        '<span class="text-white text-2xl sm:text-3xl font-bold self-start mt-3">:</span>' +
        '<div class="flex flex-col items-center"><div class="bg-white rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg"><span id="countdownMinutes" class="text-2xl sm:text-3xl lg:text-4xl font-black text-red-600">00</span></div><span class="text-white/70 text-[10px] sm:text-xs mt-2 uppercase tracking-wider">Mins</span></div>' +
        '<span class="text-white text-2xl sm:text-3xl font-bold self-start mt-3">:</span>' +
        '<div class="flex flex-col items-center"><div class="bg-white rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg"><span id="countdownSeconds" class="text-2xl sm:text-3xl lg:text-4xl font-black text-red-600">00</span></div><span class="text-white/70 text-[10px] sm:text-xs mt-2 uppercase tracking-wider">Secs</span></div>' +
        '</div></div></div></div>';
    
    section.classList.remove('hidden');
    startCountdown(offer.countdownDays || 3);
    localStorage.setItem(MEGA_SALE_ACTIVE_KEY, JSON.stringify(offer));
}

function initMegaSale() { var o = getActiveMegaSaleOffer(); if (o) renderMegaSale(o); }

function adminGetAllOffers() { return getAllMegaSaleOffers(); }
function adminAddOffer(d) { var o = getAllMegaSaleOffers(), n = { id: 'mega_' + Date.now(), type: 'mega_sale', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; Object.assign(n, d); o.push(n); saveMegaSaleOffers(o); return n; }
function adminUpdateOffer(id, d) { var o = getAllMegaSaleOffers(); for (var i = 0; i < o.length; i++) { if (o[i].id === id) { o[i] = Object.assign({}, o[i], d, { updatedAt: new Date().toISOString() }); saveMegaSaleOffers(o); return o[i]; } } return null; }
function adminDeleteOffer(id) { var o = getAllMegaSaleOffers(); o = o.filter(function(x) { return x.id !== id; }); saveMegaSaleOffers(o); }
function adminToggleOffer(id) { var o = getAllMegaSaleOffers(); for (var i = 0; i < o.length; i++) { if (o[i].id === id) { o[i].isActive = !o[i].isActive; o[i].updatedAt = new Date().toISOString(); saveMegaSaleOffers(o); return o[i]; } } return null; }
function adminSetActiveOffer(id) { var o = getAllMegaSaleOffers(); o.forEach(function(x) { x.isActive = (x.id === id); x.updatedAt = new Date().toISOString(); }); saveMegaSaleOffers(o); }

// ==================== COUNTDOWN TIMER ====================

var countdownInterval = null;

function startCountdown(days) {
    if (countdownInterval) clearInterval(countdownInterval);
    var endDate = new Date(); endDate.setDate(endDate.getDate() + (days || 3));
    function u() {
        var diff = endDate - new Date();
        var de = document.getElementById('countdownDays'), he = document.getElementById('countdownHours'),
            me = document.getElementById('countdownMinutes'), se = document.getElementById('countdownSeconds');
        if (!de || !he || !me || !se) { clearInterval(countdownInterval); return; }
        if (diff <= 0) { de.textContent = '00'; he.textContent = '00'; me.textContent = '00'; se.textContent = '00'; clearInterval(countdownInterval); return; }
        de.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
        he.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        me.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        se.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    }
    u(); countdownInterval = setInterval(u, 1000);
}

// ==================== SEARCH MODAL WITH LIVE RESULTS ====================

var allProductsCache = [];

function loadProductsCache(callback) {
    if (allProductsCache.length > 0) { if (callback) callback(allProductsCache); return; }
    getAllProducts(function(products) { allProductsCache = products; if (callback) callback(allProductsCache); });
}

function searchProducts(query) {
    if (!query || query.trim() === '') return [];
    var searchTerm = query.toLowerCase().trim();
    return allProductsCache.filter(function(product) {
        var nameMatch = product.name && product.name.toLowerCase().indexOf(searchTerm) !== -1;
        var categoryMatch = product.category && product.category.toLowerCase().indexOf(searchTerm) !== -1;
        return nameMatch || categoryMatch;
    });
}

function openSearchModal() {
    var modal = document.getElementById('searchModal');
    if (!modal) return;
    loadProductsCache();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    var resultsDiv = document.getElementById('searchResults');
    if (resultsDiv) { resultsDiv.innerHTML = '<p class="text-gray-400 text-center py-6 sm:py-8 text-sm">Start typing to search products...</p>'; }
    setTimeout(function() { var input = document.getElementById('modalSearchInput'); if (input) { input.value = ''; input.focus(); } }, 100);
}

function closeSearchModal() {
    var modal = document.getElementById('searchModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function displaySearchResults(results, query) {
    var resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    if (!query || query.trim() === '') { resultsDiv.innerHTML = '<p class="text-gray-400 text-center py-6 sm:py-8 text-sm">Start typing to search products...</p>'; return; }
    if (results.length === 0) { resultsDiv.innerHTML = '<div class="text-center py-8"><i class="fas fa-search text-3xl text-gray-300 mb-3"></i><p class="text-gray-400 text-sm">No products found for "' + query + '"</p></div>'; return; }
    var html = '<div class="space-y-2">';
    for (var i = 0; i < results.length; i++) {
        var p = results[i];
        var imageUrl = p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/100x100?text=No+Image';
        var detailPath = getProductDetailPath();
        html += '<a href="' + detailPath + '?id=' + p.id + '" class="flex items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">' +
            '<img src="' + imageUrl + '" alt="' + p.name + '" class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0">' +
            '<div class="flex-1 min-w-0"><p class="text-xs text-gray-400 uppercase tracking-wider">' + (p.category || '') + '</p>' +
            '<h4 class="text-sm sm:text-base font-semibold text-gray-800 truncate">' + p.name + '</h4></div>' +
            '<i class="fas fa-chevron-right text-gray-300 text-sm flex-shrink-0"></i></a>';
    }
    html += '</div>'; resultsDiv.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() { var sm = document.getElementById('searchModal'); if (sm) sm.addEventListener('click', function(e) { if (e.target === sm) closeSearchModal(); }); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeSearchModal(); closeSidebar(); } if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearchModal(); } });
document.addEventListener('DOMContentLoaded', function() {
    var mi = document.getElementById('modalSearchInput'); if (mi) { mi.addEventListener('input', function() { var q = this.value, r = searchProducts(q); displaySearchResults(r, q); }); mi.addEventListener('keypress', function(e) { if (e.key === 'Enter' && this.value.trim()) window.location.href = 'all-products.html?search=' + encodeURIComponent(this.value.trim()); }); }
    var ss = document.getElementById('sidebarSearch'); if (ss) ss.addEventListener('keypress', function(e) { if (e.key === 'Enter' && this.value.trim()) window.location.href = 'all-products.html?search=' + encodeURIComponent(this.value.trim()); });
});

// ==================== BACK TO TOP ====================

window.addEventListener('scroll', function() { var b = document.getElementById('backToTop'); if (!b) return; if (window.scrollY > 500) { b.style.opacity = '1'; b.style.visibility = 'visible'; } else { b.style.opacity = '0'; b.style.visibility = 'hidden'; } });

// ==================== TOAST ====================

function showToast(m, t) { t = t || 'success'; var c = document.getElementById('toastContainer'); if (!c) return; var cl = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-blue-500' }, ic = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' }; var toast = document.createElement('div'); toast.className = 'toast ' + (cl[t] || cl.success) + ' text-white px-5 py-3 rounded-lg shadow-lg flex items-center space-x-2 min-w-[280px] text-sm pointer-events-auto'; toast.innerHTML = '<i class="fas ' + (ic[t] || ic.success) + '"></i><span class="font-medium flex-1">' + m + '</span><button onclick="this.parentElement.remove()" class="text-white opacity-70 hover:opacity-100 ml-2"><i class="fas fa-times text-xs"></i></button>'; c.appendChild(toast); setTimeout(function() { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all 0.3s'; setTimeout(function() { toast.remove(); }, 300); }, 4000); }

// ==================== CART ====================

function addToCart(id, name, price, image) { var cart = JSON.parse(localStorage.getItem('aarvana_cart') || '[]'), ex = null; for (var i = 0; i < cart.length; i++) { if (cart[i].id === id) { ex = cart[i]; break; } } if (ex) { ex.quantity += 1; } else { cart.push({ id: id, name: name, price: price, image: image, quantity: 1 }); } localStorage.setItem('aarvana_cart', JSON.stringify(cart)); updateCartCount(); showToast(name + ' added to cart!', 'success'); }
function updateCartCount() { var cart = JSON.parse(localStorage.getItem('aarvana_cart') || '[]'), count = 0; for (var i = 0; i < cart.length; i++) { count += cart[i].quantity; } var badge = document.getElementById('cartCountBadge'); if (!badge) return; if (count > 0) { badge.textContent = count > 99 ? '99+' : count; badge.classList.remove('hidden'); } else { badge.classList.add('hidden'); } }

// ==================== PATH HELPERS ====================

/**
 * Get correct path for data/products.json based on current page location
 */
function getJsonPath() {
    var path = window.location.pathname;
    if (path.indexOf('/men/') !== -1 || 
        path.indexOf('/women/') !== -1 || 
        path.indexOf('/accessories/') !== -1 || 
        path.indexOf('/sales/') !== -1) {
        return '../data/products.json';
    }
    return 'data/products.json';
}

/**
 * Get correct path for product-details.html based on current page location
 * Category pages (men/, women/, accessories/, sales/) link to ../product-details.html
 * Root pages link to product-details.html
 */
function getProductDetailPath() {
    var path = window.location.pathname;
    if (path.indexOf('/men/') !== -1 || 
        path.indexOf('/women/') !== -1 || 
        path.indexOf('/accessories/') !== -1 || 
        path.indexOf('/sales/') !== -1) {
        return '../product-details.html';
    }
    return 'product-details.html';
}

// ==================== PRODUCTS - FROM JSON FILE ====================

function getAllProducts(callback) {
    fetch(getJsonPath())
        .then(function(response) { if (response.ok) return response.json(); return []; })
        .then(function(products) { callback(products); })
        .catch(function() { callback([]); });
}

// ==================== FEATURED PRODUCTS ====================

function loadFeaturedProducts() {
    var grid = document.getElementById('featuredProductsGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full flex justify-center py-12"><div class="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-gray-800"></div></div>';
    getAllProducts(function(products) { var featured = products.filter(function(p) { return p.isFeatured === true; }); if (featured.length > 4) { featured = featured.slice(0, 4); } if (featured.length > 0) { renderProductCards(featured, grid); } else { showEmptyState(grid, 'No featured products available'); } });
}

function loadCategoryProducts(category) {
    var grid = document.getElementById('categoryProductsGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full flex justify-center py-12"><div class="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-gray-800"></div></div>';
    getAllProducts(function(products) { var cat = products.filter(function(p) { return p.category && p.category.toLowerCase() === category.toLowerCase(); }); if (cat.length > 0) { renderProductCards(cat, grid); } else { showEmptyState(grid, 'No products found'); } });
}

function showEmptyState(grid, message) { grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-box-open text-5xl text-gray-300 mb-4"></i><p class="text-gray-400 text-sm">' + message + '</p></div>'; }

function renderProductCards(products, grid) {
    var html = '';
    var detailPath = getProductDetailPath();
    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var hasValidSale = (p.salePrice !== null && p.salePrice !== undefined && p.salePrice < p.price);
        var discount = hasValidSale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
        var priceHtml = hasValidSale ? '<span class="text-sm sm:text-lg font-bold text-red-600">$' + p.salePrice.toFixed(2) + '</span><span class="text-[10px] sm:text-sm text-gray-400 line-through ml-1.5">$' + p.price.toFixed(2) + '</span>' : '<span class="text-sm sm:text-lg font-bold text-gray-800">$' + p.price.toFixed(2) + '</span>';
        var safeName = p.name.replace(/'/g, "\\'");
        var imageUrl = p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400x500?text=No+Image';
        var discountBadge = (hasValidSale && discount > 0) ? '<span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">-' + discount + '%</span>' : '';
        var customBadge = ''; if (p.badge) { var bc = { 'New': 'bg-green-500', 'Sale': 'bg-red-500', 'Premium': 'bg-aarvana-gold', 'Trending': 'bg-purple-500', 'Hot': 'bg-orange-500', 'Limited': 'bg-pink-500' }; customBadge = '<span class="absolute top-2 right-2 ' + (bc[p.badge] || 'bg-gray-800') + ' text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">' + p.badge.toUpperCase() + '</span>'; }
        html += '<div class="bg-white rounded-xl sm:rounded-2xl overflow-hidden product-card-hover transition-all duration-300 group">' +
            '<a href="' + detailPath + '?id=' + p.id + '" class="block relative overflow-hidden aspect-[3/4]">' +
                '<img src="' + imageUrl + '" alt="' + p.name + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">' +
                discountBadge + customBadge +
                '<button onclick="event.preventDefault();addToCart(\'' + p.id + '\',\'' + safeName + '\',' + (hasValidSale ? p.salePrice : p.price) + ',\'' + imageUrl + '\')" class="absolute bottom-2 right-2 bg-white text-gray-900 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:bg-gray-900 hover:text-white" aria-label="Add to cart"><i class="fas fa-shopping-bag text-xs sm:text-sm"></i></button>' +
            '</a>' +
            '<div class="p-3 sm:p-4">' +
                '<p class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mb-0.5">' + (p.category || '') + '</p>' +
                '<h3 class="font-medium sm:font-semibold text-gray-800 text-sm sm:text-base mb-1.5 truncate"><a href="' + detailPath + '?id=' + p.id + '" class="hover:text-gray-600 transition-colors">' + p.name + '</a></h3>' +
                '<div class="flex items-center justify-between"><div>' + priceHtml + '</div></div>' +
            '</div></div>';
    }
    grid.innerHTML = html;
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    initMegaSale();
    loadFeaturedProducts();
    updateCartCount();
    console.log('🛍️ Aarvana - Premium Fashion Store');
    console.log('✅ All systems loaded successfully');
});
















// ========== DEVELOPMENT WARNING POPUP ==========
(function() {
    // Check if warning was already dismissed this session
    if (sessionStorage.getItem('devWarningDismissed') === 'true') return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'devWarningOverlay';
    overlay.innerHTML = `
        <div class="dev-warning-modal">
            <div class="warn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#161616" stroke-width="1.5" width="56" height="56">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="#161616" stroke-width="2.5" stroke-linecap="round"/>
                    <circle cx="12" cy="16.5" r="0.7" fill="#161616" stroke="none"/>
                </svg>
            </div>
            <h3>⚠️ Warning</h3>
            <p class="subtitle">Website Is Under Development</p>
            <div class="divider"></div>
            <p class="msg"><strong>This site is not ready for use.</strong><br>Proceeding may result in errors, data loss, or unexpected behavior.</p>
            <ul class="alert-list">
                <li><span class="icon-x">✕</span> Features are unstable or incomplete</li>
                <li><span class="icon-x">✕</span> Data may not be saved or persisted</li>
                <li><span class="icon-x">✕</span> Design and functionality subject to change</li>
            </ul>
            <div class="blink-row">
                <span class="blink-dot"></span>
                <span>Active Development</span>
            </div>
            <button class="btn-danger" id="devWarningDismiss">I Understand the Risk</button>
            <p class="footer-tag">aarvana —</p>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #devWarningOverlay {
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(0,0,0,0.82); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            animation: devFadeIn 0.25s ease-out;
        }
        @keyframes devFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .dev-warning-modal {
            background: #161616; border: 2px solid rgba(239,68,68,0.35);
            border-radius: 14px; padding: 2rem 1.8rem; max-width: 430px; width: 92%;
            text-align: center; position: relative;
            box-shadow: 0 0 60px rgba(239,68,68,0.35), 0 30px 60px rgba(0,0,0,0.7);
            animation: devSlamIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275);
            font-family: 'Inter','Segoe UI',system-ui,sans-serif; color: #e5e5e5;
        }
        @keyframes devSlamIn {
            0% { opacity:0; transform:scale(0.7) translateY(-40px); }
            60% { transform:scale(1.04) translateY(4px); }
            100% { opacity:1; transform:scale(1) translateY(0); }
        }
        .dev-warning-modal::before {
            content:''; position:absolute; top:0; left:0; right:0; height:4px;
            background: repeating-linear-gradient(90deg,#ef4444,#ef4444 12px,#1a1a1a 12px,#1a1a1a 24px);
            border-radius:14px 14px 0 0; animation: devStripeSlide 1s linear infinite;
        }
        @keyframes devStripeSlide { from { background-position:0 0; } to { background-position:24px 0; } }
        .dev-warning-modal .warn-icon { display:inline-block; margin-top:0.5rem; margin-bottom:1rem; }
        .dev-warning-modal h3 { font-size:1.3rem; font-weight:800; color:#ef4444; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.3rem; }
        .dev-warning-modal .subtitle { font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#f87171; margin-bottom:0.8rem; }
        .dev-warning-modal .divider { width:45px; height:2px; background:#ef4444; margin:0 auto 0.9rem; opacity:0.5; border-radius:2px; }
        .dev-warning-modal .msg { color:#bbb; font-size:0.85rem; line-height:1.65; margin-bottom:1.2rem; }
        .dev-warning-modal .msg strong { color:#fca5a5; }
        .dev-warning-modal .alert-list { text-align:left; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.18); border-radius:10px; padding:0.8rem 1rem; margin-bottom:1.2rem; list-style:none; }
        .dev-warning-modal .alert-list li { display:flex; align-items:flex-start; gap:0.5rem; font-size:0.76rem; color:#ccc; padding:0.3rem 0; border-bottom:1px solid rgba(255,255,255,0.04); }
        .dev-warning-modal .alert-list li:last-child { border-bottom:none; }
        .dev-warning-modal .icon-x { color:#ef4444; font-weight:700; flex-shrink:0; }
        .dev-warning-modal .blink-row { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-bottom:1.2rem; }
        .dev-warning-modal .blink-dot { width:9px; height:9px; background:#ef4444; border-radius:50%; animation:devBlink 0.8s step-end infinite; box-shadow:0 0 12px rgba(239,68,68,0.35); }
        @keyframes devBlink { 0%,100%{opacity:1;} 50%{opacity:0.15;} }
        .dev-warning-modal .blink-row span { font-size:0.8rem; font-weight:700; color:#f87171; text-transform:uppercase; letter-spacing:0.06em; }
        .dev-warning-modal .btn-danger { display:inline-block; background:transparent; border:2px solid rgba(239,68,68,0.5); color:#f87171; padding:0.55rem 1.8rem; border-radius:25px; cursor:pointer; font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; transition:all 0.2s; }
        .dev-warning-modal .btn-danger:hover { background:rgba(239,68,68,0.12); border-color:#ef4444; box-shadow:0 0 25px rgba(239,68,68,0.35); color:#fca5a5; }
        .dev-warning-modal .footer-tag { font-size:0.65rem; color:#555; margin-top:1rem; letter-spacing:0.06em; text-transform:uppercase; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    // Dismiss handler
    const dismissBtn = overlay.querySelector('#devWarningDismiss');
    dismissBtn.addEventListener('click', () => {
        sessionStorage.setItem('devWarningDismissed', 'true');
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => overlay.remove(), 200);
    });
    
    // Escape key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            sessionStorage.setItem('devWarningDismissed', 'true');
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.2s ease';
            setTimeout(() => overlay.remove(), 200);
            document.removeEventListener('keydown', escHandler);
        }
    });
    
    console.warn('⚠️ WARNING | aarvana — Site under active development.');
})();