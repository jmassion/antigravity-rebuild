/* ═══════════════════════════════════════════════════════════════
   ALPHA UNICORN — Interactive JavaScript
   Scroll animations, particles, nav, counters, dropdowns
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Navigation ──────────────────────────────────────────
    const navbar = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    // Scroll state
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // Mobile toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile nav on link click
    if (navLinks) {
        navLinks.querySelectorAll('.nav-link:not(.nav-dropdown-trigger)').forEach(link => {
            link.addEventListener('click', () => {
                if (navToggle) navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ─── Dropdown Menus ──────────────────────────────────────
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-dropdown-trigger');
        const menu = dropdown.querySelector('.nav-dropdown-menu');

        if (!trigger || !menu) return;

        // Toggle on click
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Close other dropdowns
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('open');
                }
            });

            dropdown.classList.toggle('open');
        });

        // Hover for desktop
        let hoverTimeout;
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            dropdown.classList.add('open');
        });

        dropdown.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                dropdown.classList.remove('open');
            }, 200);
        });
    });

    // Close all dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            dropdowns.forEach(d => d.classList.remove('open'));
        }
    });

    // Prevent disabled links from navigating
    document.querySelectorAll('.disabled-link, .disabled-footer-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    // ─── Scroll Animations ───────────────────────────────────
    const animatedElements = document.querySelectorAll('[data-animate]');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => animationObserver.observe(el));

    // ─── Counter Animation ───────────────────────────────────
    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));

    function animateCounter(element, target) {
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(easeProgress * target);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    // ─── Hero Particles ──────────────────────────────────────
    const particlesContainer = document.getElementById('hero-particles');

    if (particlesContainer) {
        function createParticle() {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            const size = Math.random() * 4 + 1;
            const x = Math.random() * 100;
            const duration = Math.random() * 8 + 6;
            const delay = Math.random() * 4;

            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                bottom: -10px;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: ${Math.random() * 0.5 + 0.1};
            `;

            const colors = [
                'rgba(139, 92, 246, 0.4)',
                'rgba(59, 130, 246, 0.3)',
                'rgba(192, 132, 252, 0.35)',
                'rgba(168, 85, 247, 0.3)',
            ];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            particlesContainer.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (duration + delay) * 1000);
        }

        for (let i = 0; i < 30; i++) {
            createParticle();
        }
        setInterval(createParticle, 700);
    }

    // ─── Active Nav Link Highlight ───────────────────────────
    const sections = document.querySelectorAll('section[id]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.nav-link:not(.nav-dropdown-trigger)').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(section => sectionObserver.observe(section));

    // ─── Smooth Scroll for Anchor Links ──────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Skip disabled links
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const elementPosition = target.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── Contact Form Handler ────────────────────────────────
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            btn.innerHTML = `<span>Message Sent! ✨</span>`;
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
        });
    }

    // ─── Prefers Reduced Motion ──────────────────────────────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('visible');
        });
        if (particlesContainer) {
            particlesContainer.style.display = 'none';
        }
    }

});
