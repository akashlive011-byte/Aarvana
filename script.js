// script.js
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const body = document.body;
const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");
const cartCounter = document.getElementById("cart-counter");
const menuBtns = document.querySelectorAll(".menu-btn");
const submenus = document.querySelectorAll(".submenu");

// Cart state
let cartCount = 0;
let currentlyOpenMenu = null;

function toggleMenu() {
    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("opacity-0");
    overlay.classList.toggle("opacity-100");
    overlay.classList.toggle("pointer-events-none");
    body.classList.toggle("overflow-hidden");
}

// Add to Cart function
function addToCart() {
    cartCount++;
    updateCartDisplay();
    
    // Add animation feedback
    cartCounter.classList.add('visible');
    setTimeout(() => {
        if (cartCount > 0) {
            cartCounter.classList.add('visible');
        }
    }, 300);
}

// Update cart counter display
function updateCartDisplay() {
    if (cartCount > 0) {
        cartCounter.textContent = cartCount;
        cartCounter.classList.remove('hidden');
        cartCounter.classList.add('visible');
    } else {
        cartCounter.classList.add('hidden');
        cartCounter.classList.remove('visible');
    }
}

// Accordion functionality - open one, close others
menuBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const menuId = btn.getAttribute("data-menu");
        const submenu = document.getElementById(menuId);
        const icon = btn.querySelector(".menu-icon");
        
        // If clicking the same button that's already open, close it
        if (currentlyOpenMenu === menuId) {
            submenu.classList.remove("open");
            if (icon) icon.textContent = "+";
            btn.classList.remove("active");
            currentlyOpenMenu = null;
            return;
        }
        
        // Close all other open submenus
        submenus.forEach(sub => {
            if (sub.id !== menuId) {
                sub.classList.remove("open");
            }
        });
        
        // Reset all icons and active states
        menuBtns.forEach(otherBtn => {
            if (otherBtn !== btn) {
                const otherIcon = otherBtn.querySelector(".menu-icon");
                if (otherIcon) otherIcon.textContent = "+";
                otherBtn.classList.remove("active");
            }
        });
        
        // Open the clicked submenu
        submenu.classList.add("open");
        if (icon) icon.textContent = "—";
        btn.classList.add("active");
        currentlyOpenMenu = menuId;
    });
});

// Close sidebar when clicking overlay
overlay.addEventListener("click", toggleMenu);

// Intersection Observer for active section highlighting
const observerOptions = { root: null, threshold: 0.4 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
                link.classList.remove("active-section");
                if (link.getAttribute("data-section") === id) {
                    link.classList.add("active-section");
                }
            });
        }
    });
}, observerOptions);

sections.forEach((section) => observer.observe(section));

// Close sidebar when a nav-link is clicked (mobile friendly)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (!sidebar.classList.contains("-translate-x-full")) {
            toggleMenu();
        }
    });
});

// Ensure sidebar closes if window is resized beyond mobile breakpoint
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && !sidebar.classList.contains("-translate-x-full")) {
        toggleMenu();
    }
});

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
});

// Close submenus when sidebar is closed
const sidebarObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.classList.contains("-translate-x-full")) {
            // Close all submenus when sidebar closes
            submenus.forEach(sub => sub.classList.remove("open"));
            menuBtns.forEach(btn => {
                const icon = btn.querySelector(".menu-icon");
                if (icon) icon.textContent = "+";
                btn.classList.remove("active");
            });
            currentlyOpenMenu = null;
        }
    });
});

sidebarObserver.observe(sidebar, { attributes: true, attributeFilter: ['class'] });