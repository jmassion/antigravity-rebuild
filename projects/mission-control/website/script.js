// ============================================
// Mission Control — Marketing Website Scripts
// ============================================

// Scroll reveal observer
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Particle generator
    const hero = document.querySelector('.hero-bg');
    if (hero) {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = (40 + Math.random() * 60) + '%';
            p.style.animationDelay = Math.random() * 6 + 's';
            p.style.animationDuration = (4 + Math.random() * 4) + 's';
            if (Math.random() > 0.5) p.style.background = 'var(--accent-magenta)';
            if (Math.random() > 0.8) p.style.width = p.style.height = '4px';
            hero.appendChild(p);
        }
    }

    // Animated counter
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = target / 40;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
        }, 40);
    });

    // Nav scroll effect
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.style.borderBottomColor = 'rgba(0,240,255,0.1)';
            nav.style.background = 'rgba(6,8,26,0.92)';
        } else {
            nav.style.borderBottomColor = 'var(--glass-border)';
            nav.style.background = 'rgba(6,8,26,0.75)';
        }
    });

    // Savings calculator
    const calcSlider = document.getElementById('sub-count');
    const savingsEl = document.getElementById('savings-value');
    if (calcSlider && savingsEl) {
        const avgCost = 22; // avg subscription cost
        calcSlider.addEventListener('input', () => {
            const val = parseInt(calcSlider.value);
            document.getElementById('sub-display').textContent = val;
            const saved = val * avgCost;
            savingsEl.textContent = '$' + saved.toLocaleString();
        });
    }
});
