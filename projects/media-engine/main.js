/* ============================================
   MEDIA ENGINE — Main JavaScript
   ============================================ */

// ---- Scroll-triggered animations ----
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  animationObserver.observe(el);
});

// ---- Navbar scroll effect ----
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
}, { passive: true });

// ---- Smooth scroll for nav links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const target = document.querySelector(targetId);
    if (target) {
      const navHeight = nav.offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
      
      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    }
  });
});

// ---- FAQ Accordion ----
document.querySelectorAll('.faq__question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all others
    document.querySelectorAll('.faq__item').forEach(faqItem => {
      faqItem.classList.remove('active');
    });
    
    // Toggle current
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// ---- Savings Calculator ----
function updateSavings() {
  const tools = document.querySelectorAll('#savingsTools input[type="checkbox"]');
  let totalToolCost = 0;
  
  tools.forEach(checkbox => {
    if (checkbox.checked) {
      const toolEl = checkbox.closest('.savings__tool');
      const price = parseInt(toolEl.dataset.price, 10);
      totalToolCost += price;
      toolEl.classList.add('active');
    } else {
      const toolEl = checkbox.closest('.savings__tool');
      toolEl.classList.remove('active');
    }
  });
  
  const mediaEngineCost = 49; // Engine plan
  const savings = Math.max(0, totalToolCost - mediaEngineCost);
  const yearlySavings = savings * 12;
  
  const amountEl = document.getElementById('savingsAmount');
  const yearlyEl = document.getElementById('savingsYearly');
  
  if (amountEl) {
    amountEl.textContent = `$${savings}/mo`;
    amountEl.style.color = savings > 0 ? 'var(--accent-mint)' : 'var(--text-muted)';
  }
  
  if (yearlyEl) {
    yearlyEl.textContent = `$${yearlySavings.toLocaleString()}`;
  }
}

// Initialize savings calculator
document.querySelectorAll('#savingsTools input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', updateSavings);
});
updateSavings();

// ---- Mobile menu toggle ----
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.querySelector('.nav__links');

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '100%';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(6, 9, 26, 0.95)';
    navLinks.style.padding = '1rem 2rem';
    navLinks.style.backdropFilter = 'blur(20px)';
    navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
  });
}

// ---- Counter animation for stats ----
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    
    if (Number.isInteger(target)) {
      element.textContent = Math.floor(current).toLocaleString();
    } else {
      element.textContent = current.toFixed(1);
    }
  }, 16);
}

// ---- Parallax effect for hero glow ----
document.addEventListener('mousemove', (e) => {
  const glows = document.querySelectorAll('.hero__bg-glow');
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  
  glows.forEach((glow, i) => {
    const factor = i === 0 ? 1 : -1;
    glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});

// ---- Typing effect for badge ----
const badges = ['✨ Replace 8+ Tools With One Engine', '🚀 Create a Week of Content in Minutes', '🎯 100% Brand-Aligned Content', '📈 3x More Engagement on Average'];
let currentBadge = 0;
const badgeElement = document.querySelector('.hero__badge .badge');

if (badgeElement) {
  setInterval(() => {
    currentBadge = (currentBadge + 1) % badges.length;
    badgeElement.style.opacity = '0';
    badgeElement.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      badgeElement.textContent = badges[currentBadge];
      badgeElement.style.opacity = '1';
      badgeElement.style.transform = 'translateY(0)';
    }, 300);
  }, 4000);
  
  // Add transition to badge
  badgeElement.style.transition = 'all 0.3s ease';
}

console.log('⚡ Media Engine loaded');
