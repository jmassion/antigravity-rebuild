/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  AIR REBUILD — Main Application                              ║
 * ║  Three.js 3D Logo + GSAP Scroll + 4-Theme System             ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 *  All content is driven by CONTENT (from content.config.js)
 *  To swap the logo: change CONTENT.brand.logoText or provide logoModelUrl
 */

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────
  let currentTheme = "sunrise";
  let mouseX = 0, mouseY = 0;
  let scrollY = 0;

  // ══════════════════════════════════════════════════════════════
  // 1. INJECT CONTENT FROM CONFIG
  // ══════════════════════════════════════════════════════════════

  function injectContent() {
    const C = CONTENT;

    // Meta
    document.title = `${C.brand.name} | ${C.brand.tagline}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = C.brand.metaDescription;

    // Nav
    document.getElementById("nav-logo").textContent = C.brand.name;
    document.getElementById("nav-cta").innerHTML = `<span>${C.nav.ctaText}</span>`;
    document.getElementById("nav-cta").href = C.nav.ctaUrl;

    // Loader
    document.getElementById("loader-text").textContent = C.brand.name;

    // Hero
    document.getElementById("hero-heading").innerHTML = `
      ${C.hero.headingLine1}
      <span class="hero-heading-italic">${C.hero.headingLine2}</span>
    `;
    document.getElementById("hero-cta").textContent = C.hero.ctaText;
    document.getElementById("hero-cta").href = C.hero.ctaUrl;

    // Social Proof
    const headline = C.socialProof.headline.replace(/\*(.*?)\*/g, '<em>$1</em>');
    document.getElementById("social-headline").innerHTML = headline;

    const logoWall = document.getElementById("logo-wall");
    logoWall.innerHTML = C.socialProof.clients.map(c =>
      `<span class="logo-wall-item">${c}</span>`
    ).join("");

    // Big Typography Sections
    const bigContainer = document.getElementById("big-sections");
    if (C.bigSections.length > 0) {
      const s = C.bigSections[0];
      bigContainer.innerHTML = `
        <h2 class="big-title" id="big-title-0">${s.title}</h2>
        <p class="big-subtitle">${s.subtitle}</p>
      `;
    }

    // Pillars
    const pillarsContainer = document.getElementById("pillars-container");
    pillarsContainer.innerHTML = C.pillars.map((p, i) => `
      <section class="pillar" id="pillar-${i}">
        <h2 class="pillar-title" id="pillar-title-${i}">${p.title}</h2>
        <p class="pillar-description">${p.description}</p>
      </section>
    `).join("");

    // Features
    const grid = document.getElementById("features-grid");
    grid.innerHTML = C.features.map((f, i) => `
      <div class="feature-card" id="feature-${i}">
        <span class="feature-icon">${f.icon}</span>
        <h3 class="feature-title">${f.title}</h3>
        <p class="feature-description">${f.description}</p>
      </div>
    `).join("");

    // AI Section
    document.getElementById("ai-heading").textContent = C.aiSection.heading;
    document.getElementById("ai-subheading").textContent = C.aiSection.subheading;
    document.getElementById("ai-description").textContent = C.aiSection.description;
    document.getElementById("ai-cta").textContent = C.aiSection.ctaText;
    document.getElementById("ai-cta").href = C.aiSection.ctaUrl;

    // CTA Section
    document.getElementById("cta-heading").textContent = C.ctaSection.heading;
    document.getElementById("cta-description").textContent = C.ctaSection.description;
    document.getElementById("cta-btn").textContent = C.ctaSection.ctaText;
    document.getElementById("cta-btn").href = C.ctaSection.ctaUrl;

    // Footer
    const footerLinks = document.getElementById("footer-links");
    footerLinks.innerHTML = C.footer.links.map(l =>
      `<a href="${l.url}" class="footer-link">${l.label}</a>`
    ).join("");
    document.getElementById("footer-copyright").textContent = C.footer.copyright;

    // Menu
    const menuItems = document.getElementById("menu-items");
    menuItems.innerHTML = C.nav.menuItems.map(m => `
      <a href="${m.url}" class="menu-item">
        ${m.label}
        ${m.hasDropdown ? '<span class="menu-item-arrow">›</span>' : ''}
      </a>
    `).join("");

    // Theme Switcher
    const switcher = document.getElementById("theme-switcher");
    switcher.innerHTML = Object.entries(C.themes).map(([key, t]) =>
      `<button class="theme-btn${key === currentTheme ? ' active' : ''}"
              data-theme="${key}" title="${t.label}">${t.icon}</button>`
    ).join("");
  }

  // ══════════════════════════════════════════════════════════════
  // 2. THEME SYSTEM
  // ══════════════════════════════════════════════════════════════

  function applyTheme(themeName) {
    const theme = CONTENT.themes[themeName];
    if (!theme) return;

    currentTheme = themeName;
    const root = document.documentElement;

    root.style.setProperty("--sky", theme.sky);
    root.style.setProperty("--text-primary", theme.textPrimary);
    root.style.setProperty("--text-secondary", theme.textSecondary);
    root.style.setProperty("--nav-bg", theme.navBg);
    root.style.setProperty("--card-bg", theme.cardBg);
    root.style.setProperty("--accent", theme.accent);

    document.getElementById("sky-bg").style.background = theme.sky;

    // Update button colors in CTA
    const isDark = themeName === "moon" || themeName === "sunset";
    document.querySelectorAll(".nav-cta, .hero-cta, .ai-cta, .cta-btn").forEach(btn => {
      btn.style.background = theme.textPrimary;
      btn.style.color = isDark ? "#0f0a1e" : "#1a1145";
    });

    // Update active theme button
    document.querySelectorAll(".theme-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.theme === themeName);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // 3. THREE.JS 3D LOGO
  // ══════════════════════════════════════════════════════════════

  let scene, camera, renderer, logoGroup, clouds = [];

  function init3D() {
    const canvas = document.getElementById("three-canvas");
    const cfg = CONTENT.scene3d;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xc4b5fd, 0.5);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    // Logo Group
    logoGroup = new THREE.Group();
    scene.add(logoGroup);

    // Build the 3D text logo
    createGlassLogo();

    // Floating clouds
    createClouds(cfg.cloudCount);

    // Start render loop
    animate();
  }

  function createGlassLogo() {
    const cfg = CONTENT.scene3d;
    const text = CONTENT.brand.logoText;

    // Create text using extruded geometry from a canvas texture approach
    // For proper glass text, we'll create individual letter shapes
    // using torus knots and arranged as a stylized "Air" wordmark

    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(cfg.logoColor),
      transparent: true,
      opacity: cfg.logoOpacity,
      roughness: cfg.logoRoughness,
      metalness: cfg.logoMetalness,
      transmission: 0.9,
      thickness: 0.5,
      envMapIntensity: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    });

    // Create a stylized "tubular" wordmark using toroidal letter forms
    // "A" - Triangle shape
    const aPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = (t < 0.5) ? t * 2 - 0.5 : (1 - t) * 2 - 0.5;
      const y = (t < 0.5) ? t * 2.5 : (1 - t) * 2.5;
      aPoints.push(new THREE.Vector3(x * 0.8, y - 0.6, 0));
    }
    const aCurve = new THREE.CatmullRomCurve3(aPoints, false);
    const aGeom = new THREE.TubeGeometry(aCurve, 40, 0.12, 12, false);
    const aMesh = new THREE.Mesh(aGeom, glassMaterial);
    aMesh.position.x = -2.2;

    // "i" - Vertical line + dot
    const iPoints = [
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(0, 0.5, 0),
    ];
    const iCurve = new THREE.CatmullRomCurve3(iPoints, false);
    const iGeom = new THREE.TubeGeometry(iCurve, 20, 0.12, 12, false);
    const iMesh = new THREE.Mesh(iGeom, glassMaterial);
    iMesh.position.x = -0.6;

    // "i" dot
    const iDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      glassMaterial
    );
    iDot.position.set(-0.6, 0.9, 0);

    // "r" - Script r curve
    const rPoints = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      let x, y;
      if (t < 0.4) {
        // Vertical stem
        x = 0;
        y = t / 0.4 * 1.2 - 0.6;
      } else {
        // Curve over
        const ct = (t - 0.4) / 0.6;
        x = Math.sin(ct * Math.PI * 0.7) * 0.5;
        y = 0.6 + Math.sin(ct * Math.PI) * 0.35;
      }
      rPoints.push(new THREE.Vector3(x, y, 0));
    }
    const rCurve = new THREE.CatmullRomCurve3(rPoints, false);
    const rGeom = new THREE.TubeGeometry(rCurve, 40, 0.12, 12, false);
    const rMesh = new THREE.Mesh(rGeom, glassMaterial);
    rMesh.position.x = 0.4;

    // Add to group
    logoGroup.add(aMesh);
    logoGroup.add(iMesh);
    logoGroup.add(iDot);
    logoGroup.add(rMesh);

    // Add a decorative script underline swoosh
    const swooshPoints = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = (t - 0.5) * 5;
      const y = Math.sin(t * Math.PI) * 0.3 - 1.0;
      swooshPoints.push(new THREE.Vector3(x, y, 0));
    }
    const swooshCurve = new THREE.CatmullRomCurve3(swooshPoints, false);
    const swooshGeom = new THREE.TubeGeometry(swooshCurve, 50, 0.06, 8, false);
    const swooshMesh = new THREE.Mesh(swooshGeom, glassMaterial.clone());
    swooshMesh.material.opacity = 0.2;
    logoGroup.add(swooshMesh);

    // Scale
    logoGroup.scale.multiplyScalar(cfg.logoScale);

    // Center
    logoGroup.position.y = 0.2;
  }

  function createClouds(count) {
    const cfg = CONTENT.scene3d;

    const cloudMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: cfg.cloudOpacity,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < count; i++) {
      const cloudGroup = new THREE.Group();

      // Each cloud is multiple overlapping spheres
      const puffCount = 3 + Math.floor(Math.random() * 4);
      for (let j = 0; j < puffCount; j++) {
        const radius = 0.3 + Math.random() * 0.5;
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 12, 12),
          cloudMaterial.clone()
        );
        puff.position.set(
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4
        );
        puff.material.opacity = cfg.cloudOpacity * (0.5 + Math.random() * 0.5);
        cloudGroup.add(puff);
      }

      // Random position
      cloudGroup.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        -5 + Math.random() * -10
      );

      cloudGroup.scale.multiplyScalar(0.6 + Math.random() * 0.8);

      // Store velocity
      cloudGroup.userData = {
        baseY: cloudGroup.position.y,
        speed: 0.005 + Math.random() * 0.01,
        wobble: Math.random() * Math.PI * 2,
      };

      scene.add(cloudGroup);
      clouds.push(cloudGroup);
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    const cfg = CONTENT.scene3d;
    const time = Date.now() * 0.001;

    // Logo rotation & parallax
    if (logoGroup) {
      // Auto-rotation
      logoGroup.rotation.y += cfg.rotationSpeed;

      // Mouse parallax
      const targetRotX = mouseY * cfg.parallaxIntensity;
      const targetRotZ = -mouseX * cfg.parallaxIntensity * 0.3;
      logoGroup.rotation.x += (targetRotX - logoGroup.rotation.x) * 0.05;
      logoGroup.rotation.z += (targetRotZ - logoGroup.rotation.z) * 0.05;

      // Scroll-based rotation
      const scrollRot = scrollY * 0.001 * cfg.scrollRotationIntensity;
      logoGroup.rotation.y += scrollRot * 0.01;

      // Subtle floating
      logoGroup.position.y = 0.2 + Math.sin(time * 0.5) * 0.15;
    }

    // Animate clouds
    clouds.forEach(cloud => {
      cloud.position.y = cloud.userData.baseY + Math.sin(time * cloud.userData.speed * 10 + cloud.userData.wobble) * 0.3;
      cloud.position.x += cloud.userData.speed * 0.1;

      // Wrap around
      if (cloud.position.x > 15) cloud.position.x = -15;
    });

    // Fade logo based on scroll
    if (logoGroup) {
      const fadeStart = window.innerHeight * 0.3;
      const fadeEnd = window.innerHeight * 1.2;
      const opacity = 1 - Math.max(0, Math.min(1, (scrollY - fadeStart) / (fadeEnd - fadeStart)));
      logoGroup.children.forEach(child => {
        if (child.material) child.material.opacity = opacity * CONTENT.scene3d.logoOpacity;
      });
    }

    renderer.render(scene, camera);
  }

  // ══════════════════════════════════════════════════════════════
  // 4. GSAP SCROLL ANIMATIONS
  // ══════════════════════════════════════════════════════════════

  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Generic data-reveal elements
    document.querySelectorAll("[data-reveal]").forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => el.classList.add("revealed"),
      });
    });

    // Big typography fade-in
    document.querySelectorAll(".big-title").forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        onEnter: () => el.classList.add("visible"),
      });
    });

    // Pillar titles
    document.querySelectorAll(".pillar-title").forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 75%",
        onEnter: () => el.classList.add("visible"),
      });
    });

    // Feature cards stagger
    document.querySelectorAll(".feature-card").forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 88%",
        onEnter: () => {
          setTimeout(() => card.classList.add("visible"), i * 80);
        },
      });
    });

    // Parallax for clouds (CSS ones) based on scroll
    gsap.to(".cloud", {
      y: () => -100,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // 5. CSS CLOUDS (decorative)
  // ══════════════════════════════════════════════════════════════

  function createCSSClouds() {
    const container = document.body;
    for (let i = 0; i < 6; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud";
      const size = 100 + Math.random() * 200;
      cloud.innerHTML = `<div class="cloud-shape"></div>`;
      cloud.style.cssText = `
        --cloud-size: ${size}px;
        --cloud-opacity: ${0.3 + Math.random() * 0.4};
        --cloud-drift-y: ${-20 + Math.random() * 40}px;
        --cloud-drift-x: ${-30 + Math.random() * 60}px;
        top: ${10 + Math.random() * 70}%;
        left: ${Math.random() * 90}%;
        animation-delay: ${Math.random() * 20}s;
        animation-duration: ${15 + Math.random() * 15}s;
      `;
      container.appendChild(cloud);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // 6. EVENT LISTENERS
  // ══════════════════════════════════════════════════════════════

  function initEvents() {
    // Mouse tracking for parallax
    document.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Scroll tracking
    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
    }, { passive: true });

    // Resize
    window.addEventListener("resize", () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });

    // Menu toggle
    document.getElementById("menu-open").addEventListener("click", () => {
      document.getElementById("menu-overlay").classList.add("active");
    });

    document.getElementById("menu-close").addEventListener("click", () => {
      document.getElementById("menu-overlay").classList.remove("active");
    });

    // Close menu on link click
    document.querySelectorAll(".menu-item").forEach(item => {
      item.addEventListener("click", () => {
        document.getElementById("menu-overlay").classList.remove("active");
      });
    });

    // Theme switcher
    document.getElementById("theme-switcher").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-theme]");
      if (btn) {
        applyTheme(btn.dataset.theme);
      }
    });

    // Announcement dismiss
    document.getElementById("announcement-close").addEventListener("click", () => {
      document.getElementById("announcement").classList.add("dismissed");
    });
  }

  // ══════════════════════════════════════════════════════════════
  // 7. BOOT
  // ══════════════════════════════════════════════════════════════

  function boot() {
    // Inject content from config
    injectContent();

    // Apply default theme
    applyTheme(currentTheme);

    // Init 3D scene
    init3D();

    // CSS clouds
    createCSSClouds();

    // Events
    initEvents();

    // Hide loader
    setTimeout(() => {
      document.getElementById("loader").classList.add("hidden");

      // Init scroll animations after loader is hidden
      setTimeout(() => {
        initScrollAnimations();
      }, 300);
    }, 1500);
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
