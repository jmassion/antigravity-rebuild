/* ============================================
   AntiGravity Docs — HolodeckOS Edition
   Main JavaScript — Navigation, Animations
   ============================================ */

// ---- Scroll Reveal ----
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

// ---- Navbar Scroll Effect ----
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
}, { passive: true });

// ---- Mobile Nav Toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const spans = navToggle.querySelectorAll('span');
        if (navLinks.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
}

// ---- Active Nav Link on Scroll ----
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, {
    threshold: 0.3,
    rootMargin: '-80px 0px 0px 0px'
});

sections.forEach(section => {
    navObserver.observe(section);
});

// ---- Smooth Scroll ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ---- Sparkle Cursor Trail (subtle) ----
let sparkleTimeout;
document.addEventListener('mousemove', (e) => {
    if (sparkleTimeout) return;
    sparkleTimeout = setTimeout(() => {
        sparkleTimeout = null;
    }, 100);

    if (Math.random() > 0.7) return; // Only 30% chance

    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    width: 4px;
    height: 4px;
    background: ${Math.random() > 0.5 ? '#00f5d4' : '#b388ff'};
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.8;
    box-shadow: 0 0 6px currentColor;
    transition: all 1s ease;
  `;
    document.body.appendChild(sparkle);

    requestAnimationFrame(() => {
        sparkle.style.opacity = '0';
        sparkle.style.transform = `translateY(-20px) scale(0)`;
    });

    setTimeout(() => sparkle.remove(), 1000);
});

// ---- Doc Page Template (for sub-pages) ----
// This function is used by individual doc pages to set up their layout
window.setupDocPage = function (config) {
    // Back button functionality
    const backBtn = document.querySelector('.doc-back');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            if (document.referrer && document.referrer.includes('index.html')) {
                e.preventDefault();
                history.back();
            }
        });
    }
};

console.log('🐸 HolodeckOS — AntiGravity Docs loaded successfully!');
