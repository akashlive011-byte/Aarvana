/* ============================================
   js/checkout/checkout.js - Checkout Functionality
   
   Handles:
   - Bangladesh location data (Division > District > Upazila)
   - Delivery charges by division (admin configurable)
   - Payment methods: bKash, Rocket, Nagad (full payment)
   - Cash on Delivery with advance via bKash/Rocket/Nagad
   - COD advance amount and note (admin configurable)
   - Payment numbers (admin configurable)
   - Delivery instructions (optional textarea)
   - Order summary with subtotal, delivery charges, COD advance, total
   - Form validation with field warnings and styled error box
   - Order placement → redirects to order-confirmation.html
   
   Data Source:
   - NOW: data/config.json (shared file for all users)
   - FUTURE: Google Sheets API (when admin panel activates)
   ============================================ */

// ==================== ADMIN CONFIGURABLE SETTINGS ====================

var COD_ADVANCE = 200;
var codNoteText = 'To confirm your COD order, pay {amount} TK advance via bKash/Rocket/Nagad below. This amount will be adjusted from your total.';
var paymentNumbers = { bkash: '01XXXXXXXXX', rocket: '01XXXXXXXXX', nagad: '01XXXXXXXXX' };
var shippingCharges = {};

// ==================== GLOBAL VARIABLES ====================

var bangladeshData = {};
var currentShipping = 0;
var checkoutSubtotal = 0;

// ==================== LOAD SETTINGS ====================

/**
 * Load settings from correct source based on mode
 * NOW: data/config.json (shared file for all users)
 * FUTURE: Google Sheets API (when admin panel activates)
 */
function loadConfigSettings() {
    if (typeof isBackendActive === 'function' && isBackendActive()) {
        loadSettingsFromAPI();
    } else {
        loadSettingsFromJSON();
    }
}

/**
 * MODE 1: Load settings from data/config.json (current)
 */
function loadSettingsFromJSON() {
    fetch('../../data/config.json')
        .then(function(r) { return r.json(); })
        .then(function(config) { applySettings(config); })
        .catch(function() { applyDefaultSettings(); });
}

/**
 * MODE 2: Load settings from Google Sheets API (future)
 */
function loadSettingsFromAPI() {
    apiGetSettings()
        .then(function(config) { applySettings(config); })
        .catch(function() { loadSettingsFromJSON(); });
}

/**
 * Apply loaded settings to all page displays
 */
function applySettings(config) {
    if (config.codAdvance) COD_ADVANCE = config.codAdvance;
    if (config.codNote) codNoteText = config.codNote;
    if (config.paymentNumbers) paymentNumbers = config.paymentNumbers;
    if (config.deliveryCharges) shippingCharges = config.deliveryCharges;
    updateCodAdvanceDisplay();
    updatePaymentNumberDisplay();
}

/**
 * Default settings fallback
 */
function applyDefaultSettings() {
    shippingCharges = {"Dhaka":60,"Chattogram":120,"Rajshahi":120,"Khulna":120,"Barishal":130,"Sylhet":130,"Rangpur":150,"Mymensingh":120};
    updateCodAdvanceDisplay();
    updatePaymentNumberDisplay();
}

// ==================== ADMIN PANEL FUNCTIONS (localStorage) ====================

function adminUpdateCodAdvance(amount) { COD_ADVANCE = parseInt(amount) || 200; localStorage.setItem('aarvana_cod_advance', COD_ADVANCE); updateCodAdvanceDisplay(); updateTotals(); }
function adminUpdateCodNote(note) { codNoteText = note; localStorage.setItem('aarvana_cod_note', note); updateCodAdvanceDisplay(); }
function adminUpdatePaymentNumbers(nums) { paymentNumbers = nums; localStorage.setItem('aarvana_payment_numbers', JSON.stringify(nums)); updatePaymentNumberDisplay(); }
function adminUpdateShippingCharges(charges) { shippingCharges = charges; localStorage.setItem('aarvana_shipping_charges', JSON.stringify(charges)); }

// ==================== DISPLAY UPDATES ====================

function updateCodAdvanceDisplay() {
    var noteEl = document.getElementById('codNoteText');
    if (noteEl) { noteEl.innerHTML = codNoteText.replace('{amount}', '<span class="font-bold" id="codAdvanceAmountNote">' + COD_ADVANCE + ' TK</span>'); }
    var chkEl = document.getElementById('chkCodAdvance'); if (chkEl) chkEl.textContent = '-৳' + COD_ADVANCE.toFixed(2);
}

function updatePaymentNumberDisplay() {
    var ids = ['bkashNumber','rocketNumber','nagadNumber','codBkashNumber','codRocketNumber','codNagadNumber'];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]); if (!el) continue;
        var id = ids[i].toLowerCase();
        if (id.indexOf('bkash') !== -1) el.textContent = paymentNumbers.bkash;
        if (id.indexOf('rocket') !== -1) el.textContent = paymentNumbers.rocket;
        if (id.indexOf('nagad') !== -1) el.textContent = paymentNumbers.nagad;
    }
}

// ==================== FIELD WARNINGS ====================

function clearFieldWarning(id) { var w = document.getElementById('warn-' + id); if (w) w.classList.remove('show'); }
function showFieldWarning(id) { var w = document.getElementById('warn-' + id); if (w) w.classList.add('show'); }

// ==================== BANGLADESH LOCATION DATA ====================

function loadBangladeshData() {
    fetch('../../data/bangladesh.json').then(function(r){return r.json()}).then(function(d){bangladeshData=d;populateDivisions()}).catch(function(){});
}

function populateDivisions() {
    var s = document.getElementById('division'); if (!s) return;
    s.innerHTML = '<option value="">Select Division</option>';
    var d = Object.keys(bangladeshData);
    for (var i = 0; i < d.length; i++) { var o = document.createElement('option'); o.value = d[i]; o.textContent = d[i]; s.appendChild(o); }
}

function updateDistricts() {
    var ds = document.getElementById('division'), dc = document.getElementById('district'), du = document.getElementById('upazila');
    if (!ds || !dc || !du) return;
    var div = ds.value;
    dc.innerHTML = '<option value="">Select District</option>'; du.innerHTML = '<option value="">Select Upazila/Thana</option>';
    if (!div || !bangladeshData[div] || !bangladeshData[div].districts) return;
    var dists = Object.keys(bangladeshData[div].districts);
    for (var i = 0; i < dists.length; i++) { var o = document.createElement('option'); o.value = dists[i]; o.textContent = dists[i]; dc.appendChild(o); }
    currentShipping = 0; updateShippingDisplay(); updateTotals();
}

function updateUpazilas() {
    var ds = document.getElementById('division'), dc = document.getElementById('district'), du = document.getElementById('upazila');
    if (!ds || !dc || !du) return;
    var div = ds.value, dist = dc.value;
    du.innerHTML = '<option value="">Select Upazila/Thana</option>';
    if (!div || !dist || !bangladeshData[div] || !bangladeshData[div].districts[dist]) return;
    var upz = bangladeshData[div].districts[dist];
    for (var i = 0; i < upz.length; i++) { var o = document.createElement('option'); o.value = upz[i]; o.textContent = upz[i]; du.appendChild(o); }
    currentShipping = 0; updateShippingDisplay(); updateTotals();
}

function updateShipping() {
    var ds = document.getElementById('division'), du = document.getElementById('upazila');
    if (!ds || !du) return;
    var div = ds.value, upz = du.value;
    currentShipping = (upz && shippingCharges[div]) ? shippingCharges[div] : 0;
    updateShippingDisplay(); updateTotals();
}

function updateShippingDisplay() {
    var el = document.getElementById('chkShipping'); if (!el) return;
    if (currentShipping === 0) { el.textContent = 'Select upazila'; el.className = 'font-semibold text-gray-400'; }
    else { el.textContent = '৳' + currentShipping; el.className = 'font-semibold text-gray-800'; }
}

// ==================== PAYMENT METHOD TOGGLES ====================

function toggleCodAdvanceMethod() {
    var m = document.querySelector('input[name="codAdvanceMethod"]:checked');
    document.getElementById('cod_trx_bkash').style.display = 'none';
    document.getElementById('cod_trx_rocket').style.display = 'none';
    document.getElementById('cod_trx_nagad').style.display = 'none';
    if (!m) return;
    if (m.value === 'bkash') document.getElementById('cod_trx_bkash').style.display = 'block';
    if (m.value === 'rocket') document.getElementById('cod_trx_rocket').style.display = 'block';
    if (m.value === 'nagad') document.getElementById('cod_trx_nagad').style.display = 'block';
}

function togglePaymentMethod() {
    var selectedRadio = document.querySelector('input[name="payment"]:checked');
    
    document.getElementById('trx_bkash').style.display = 'none';
    document.getElementById('trx_rocket').style.display = 'none';
    document.getElementById('trx_nagad').style.display = 'none';
    document.getElementById('cod_note').style.display = 'none';
    clearFieldWarning('payment');
    
    var allRadios = document.querySelectorAll('input[name="payment"]');
    for (var i = 0; i < allRadios.length; i++) {
        var label = allRadios[i].closest('label');
        if (label) {
            var cardDiv = label.querySelector('.flex.items-center');
            if (cardDiv) { cardDiv.classList.remove('bg-gray-50'); }
            var outerDot = label.querySelector('.w-5.h-5.rounded-full');
            if (outerDot) { var innerDot = outerDot.querySelector('div'); if (innerDot) { innerDot.classList.add('hidden'); } }
        }
    }
    
    if (!selectedRadio) { updateTotals(); return; }
    
    var pm = selectedRadio.value;
    if (pm === 'bkash') document.getElementById('trx_bkash').style.display = 'block';
    if (pm === 'rocket') document.getElementById('trx_rocket').style.display = 'block';
    if (pm === 'nagad') document.getElementById('trx_nagad').style.display = 'block';
    if (pm === 'cod') { document.getElementById('cod_note').style.display = 'block'; toggleCodAdvanceMethod(); }
    
    var selectedLabel = selectedRadio.closest('label');
    if (selectedLabel) {
        var cardDiv = selectedLabel.querySelector('.flex.items-center');
        if (cardDiv) { cardDiv.classList.add('bg-gray-50'); }
        var outerDot = selectedLabel.querySelector('.w-5.h-5.rounded-full');
        if (outerDot) { var innerDot = outerDot.querySelector('div'); if (innerDot) { innerDot.classList.remove('hidden'); } }
    }
    
    updateTotals();
}

// ==================== ORDER SUMMARY ====================

function loadCheckoutSummary() {
    var cart = JSON.parse(localStorage.getItem('aarvana_cart') || '[]');
    if (cart.length === 0) { window.location.href = '../cart/cart.html'; return; }
    var c = document.getElementById('checkoutItems'); checkoutSubtotal = 0;
    if (c) { var h = ''; for (var i = 0; i < cart.length; i++) { var item = cart[i], it = item.price * item.quantity; checkoutSubtotal += it; h += '<div class="flex justify-between items-center"><div class="flex items-center gap-3"><img src="'+(item.image||'https://via.placeholder.com/48')+'" alt="'+item.name+'" class="w-10 h-10 rounded-lg object-cover"><div><p class="text-sm font-medium text-gray-800">'+item.name+'</p><p class="text-xs text-gray-400">Qty: '+item.quantity+'</p></div></div><span class="text-sm font-semibold text-gray-800">৳'+it.toFixed(2)+'</span></div>'; } c.innerHTML = h; }
    updateTotals();
}

function updateTotals() {
    var method = document.querySelector('input[name="payment"]:checked');
    var isCOD = method && method.value === 'cod';
    var codAdvance = isCOD ? COD_ADVANCE : 0;
    var total = checkoutSubtotal + currentShipping - codAdvance;
    document.getElementById('chkSubtotal').textContent = '৳' + checkoutSubtotal.toFixed(2);
    var codRow = document.getElementById('codAdvanceRow');
    if (isCOD) { codRow.classList.remove('hidden'); document.getElementById('chkCodAdvance').textContent = '-৳' + codAdvance.toFixed(2); }
    else { codRow.classList.add('hidden'); }
    document.getElementById('chkTotal').textContent = '৳' + total.toFixed(2);
}

// ==================== PLACE ORDER ====================

function placeOrder() {
    var fn = document.getElementById('fullName').value.trim();
    var ph = document.getElementById('phone').value.trim();
    var em = document.getElementById('email').value.trim();
    var dv = document.getElementById('division').value;
    var dc = document.getElementById('district').value;
    var du = document.getElementById('upazila').value;
    var ad = document.getElementById('address').value.trim();
    var deliveryNote = document.getElementById('deliveryNote') ? document.getElementById('deliveryNote').value.trim() : '';
    
    var pmEl = document.querySelector('input[name="payment"]:checked');
    if (!pmEl) { showFieldWarning('payment'); showError('Please select a payment method'); return; }
    var pm = pmEl.value;
    
    if (!fn) { showFieldWarning('fullName'); showError('Please enter your full name'); return; }
    var phoneRegex = /^01[3-9]\d{8}$/;
    if (!ph) { showFieldWarning('phone'); showError('Please enter your phone number'); return; }
    if (!phoneRegex.test(ph.replace(/[\s\-\(\)]/g, ''))) { showFieldWarning('phone'); showError('Please enter a valid phone number (01XXXXXXXXX)'); return; }
    if (em) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showError('Please enter a valid email address'); return; } }
    if (!dv) { showError('Please select your division'); return; }
    if (!dc) { showError('Please select your district'); return; }
    if (!du) { showError('Please select your upazila/thana'); return; }
    if (!ad || ad.length < 5) { showFieldWarning('address'); showError('Please enter your full delivery address'); return; }
    
    var trxId = '', advanceMethod = '', advanceTrxId = '';
    if (pm === 'bkash') { trxId = document.querySelector('#trx_bkash input').value.trim(); if (!trxId) { showError('Please enter bKash Transaction ID'); return; } }
    if (pm === 'rocket') { trxId = document.querySelector('#trx_rocket input').value.trim(); if (!trxId) { showError('Please enter Rocket Transaction ID'); return; } }
    if (pm === 'nagad') { trxId = document.querySelector('#trx_nagad input').value.trim(); if (!trxId) { showError('Please enter Nagad Transaction ID'); return; } }
    if (pm === 'cod') {
        var advEl = document.querySelector('input[name="codAdvanceMethod"]:checked');
        if (!advEl) { showError('Please select an advance payment method for COD'); return; }
        advanceMethod = advEl.value;
        if (advanceMethod === 'bkash') { advanceTrxId = document.querySelector('#cod_trx_bkash input').value.trim(); if (!advanceTrxId) { showError('Please enter bKash Transaction ID for '+COD_ADVANCE+' TK advance'); return; } }
        if (advanceMethod === 'rocket') { advanceTrxId = document.querySelector('#cod_trx_rocket input').value.trim(); if (!advanceTrxId) { showError('Please enter Rocket Transaction ID for '+COD_ADVANCE+' TK advance'); return; } }
        if (advanceMethod === 'nagad') { advanceTrxId = document.querySelector('#cod_trx_nagad input').value.trim(); if (!advanceTrxId) { showError('Please enter Nagad Transaction ID for '+COD_ADVANCE+' TK advance'); return; } }
    }
    
    var orderNumber = 'AAR-' + Date.now().toString(36).toUpperCase();
    var cart = JSON.parse(localStorage.getItem('aarvana_cart') || '[]');
    var isCOD = pm === 'cod';
    var codAdvance = isCOD ? COD_ADVANCE : 0;
    var total = checkoutSubtotal + currentShipping - codAdvance;
    
    var order = {
        orderNumber: orderNumber,
        customer: { name: fn, phone: ph, email: em, division: dv, district: dc, upazila: du, address: ad },
        payment: { method: pm, transactionId: trxId, advanceMethod: advanceMethod, advanceTrxId: advanceTrxId, codAdvance: codAdvance },
        deliveryNote: deliveryNote,
        items: cart, subtotal: checkoutSubtotal, shipping: currentShipping, total: total,
        status: 'Confirmed', date: new Date().toISOString()
    };
    
    // Save order to localStorage
    var orders = JSON.parse(localStorage.getItem('aarvana_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('aarvana_orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.setItem('aarvana_cart', '[]');
    updateCartCount();
    
    // Redirect to order confirmation page with order number
    window.location.href = '../../order-confirmation.html?order=' + orderNumber;
}

function showError(m) {
    var box = document.getElementById('orderError'), msg = document.getElementById('orderErrorMessage');
    if (box && msg) { msg.textContent = m; box.classList.remove('hidden'); clearTimeout(window._e); window._e = setTimeout(function() { box.classList.add('hidden'); }, 5000); }
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', function() {
    loadConfigSettings();
    loadBangladeshData();
    loadCheckoutSummary();
    updateCartCount();
    updateTotals();
});