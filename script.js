const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const body = document.body;

const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");

/* TOGGLE SIDEBAR */
function toggleMenu() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
    body.classList.toggle("overflow-hidden");
}

overlay.addEventListener("click", toggleMenu);

/* ACCORDION MENU */
document.querySelectorAll(".menu-btn").forEach(btn => {
    
    btn.addEventListener("click", () => {
        
        const submenu = btn.nextElementSibling;
        const span = btn.querySelector("span");
        
        const isOpen = submenu.classList.contains("open");
        
        document.querySelectorAll(".submenu").forEach(m => {
            m.classList.remove("open");
        });
        
        document.querySelectorAll(".menu-btn span").forEach(s => {
            s.textContent = "+";
        });
        
        if (!isOpen) {
            submenu.classList.add("open");
            if (span) span.textContent = "—";
        }
        
    });
    
});

/* SCROLL ACTIVE LINK */
const observer = new IntersectionObserver((entries) => {
    
    entries.forEach(entry => {
        
        if (entry.isIntersecting) {
            
            const id = entry.target.getAttribute("id");
            
            navLinks.forEach(link => {
                
                link.classList.remove("active-section");
                
                if (link.dataset.section === id) {
                    link.classList.add("active-section");
                }
                
            });
            
        }
        
    });
    
}, { threshold: 0.4 });

sections.forEach(sec => observer.observe(sec));

/* CLOSE SIDEBAR ON LINK CLICK */
navLinks.forEach(link => {
    
    link.addEventListener("click", () => {
        
        if (sidebar.classList.contains("open")) {
            toggleMenu();
        }
        
    });
    
});
