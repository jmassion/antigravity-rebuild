/**
 * Wispr Flow Alternative — Interactive Demo
 */

// Typewriter effect for the transcription demo
const DEMO_TEXT = "Let me describe what I'm imagining for the new dashboard. Picture a dark gradient background with floating glass cards, each showing real-time metrics. The header should have a subtle purple glow, maybe with the AI Autopilot logo pulsing gently...";

let charIndex = 0;
const textEl = document.getElementById('t1');
const imageGen = document.getElementById('imageGen');

function typeNextChar() {
    if (!textEl || charIndex >= DEMO_TEXT.length) {
        // Reset after a pause
        setTimeout(() => {
            charIndex = 0;
            if (textEl) textEl.textContent = '';
            if (imageGen) {
                imageGen.innerHTML = '<span>Images appear here as you speak about visual concepts...</span>';
                imageGen.classList.remove('active');
            }
            typeNextChar();
        }, 3000);
        return;
    }

    textEl.textContent += DEMO_TEXT[charIndex];
    charIndex++;

    // Trigger image gen area when visual keywords appear
    if (charIndex === 80 && imageGen) {
        imageGen.classList.add('active');
        imageGen.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">🎨</div>
        <div style="font-size:11px;color:#6366F1;font-weight:600;">Generating...</div>
        <div style="font-size:10px;color:#9CA3AF;margin-top:4px;">"dark gradient background with floating glass cards"</div>
      </div>`;
    }

    if (charIndex === 160 && imageGen) {
        imageGen.innerHTML = `
      <div style="text-align:center;">
        <div style="width:100%;height:80px;border-radius:8px;background:linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);margin-bottom:8px;display:flex;align-items:center;justify-content:center;">
          <div style="display:flex;gap:6px;">
            <div style="width:40px;height:28px;border-radius:4px;background:rgba(255,255,255,0.08);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.1);"></div>
            <div style="width:40px;height:28px;border-radius:4px;background:rgba(255,255,255,0.08);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.1);"></div>
            <div style="width:40px;height:28px;border-radius:4px;background:rgba(255,255,255,0.08);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.1);"></div>
          </div>
        </div>
        <div style="font-size:10px;color:#10B981;font-weight:600;">✓ Generated from speech</div>
      </div>`;
    }

    setTimeout(typeNextChar, 30 + Math.random() * 40);
}

// Start demo
setTimeout(typeNextChar, 1500);

// Nav scroll effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Intersection observer for cards
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.advantage-card, .comp-row').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    observer.observe(el);
});
