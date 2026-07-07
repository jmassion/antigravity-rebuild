/* ============================================
   NoahOS Wiki — JavaScript Controller
   Navigation, iframe reference panel, search
   ============================================ */

(function () {
    'use strict';

    // ── State ───────────────────────────
    let currentSlug = null;
    let refPanelOpen = false;

    // ── DOM refs ────────────────────────
    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById('sidebarNav');
    const mainContent = document.getElementById('mainContent');
    const refPanel = document.getElementById('refPanel');
    const refToggle = document.getElementById('refToggle');
    const refPanelBody = document.getElementById('refPanelBody');
    const searchInput = document.getElementById('searchInput');
    const importCount = document.getElementById('importCount');
    const sidebarToggle = document.getElementById('sidebarToggle');

    // ── Build Sidebar ───────────────────
    function buildSidebar() {
        let html = '';
        WIKI_DATA.categories.forEach(cat => {
            const pages = WIKI_DATA.pages.filter(p => p.category === cat.id);
            html += `<div class="sidebar-category">
        <div class="category-label" data-cat="${cat.id}">
          <span>${cat.label}</span>
          <span class="chevron">▼</span>
        </div>
        <ul class="sidebar-links" id="cat-${cat.id}">`;
            pages.forEach(p => {
                html += `<li class="sidebar-link" data-slug="${p.slug}">
          <span class="link-icon">${p.icon}</span>
          <span>${p.title}</span>
          ${p.imported ? '<span class="link-check">✓</span>' : '<span class="link-new">new</span>'}
        </li>`;
            });
            html += `</ul></div>`;
        });
        sidebarNav.innerHTML = html;

        // Category collapse
        document.querySelectorAll('.category-label').forEach(label => {
            label.addEventListener('click', () => {
                label.classList.toggle('collapsed');
                const list = document.getElementById('cat-' + label.dataset.cat);
                list.classList.toggle('collapsed');
                if (!list.classList.contains('collapsed')) {
                    list.style.maxHeight = list.scrollHeight + 'px';
                }
            });
        });

        // Set initial max-heights
        document.querySelectorAll('.sidebar-links').forEach(list => {
            list.style.maxHeight = list.scrollHeight + 'px';
        });

        // Page clicks
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', () => {
                navigateTo(link.dataset.slug);
                // Close mobile sidebar
                if (window.innerWidth <= 900) sidebar.classList.remove('open');
            });
        });
    }

    // ── Navigate ────────────────────────
    function navigateTo(slug) {
        const page = WIKI_DATA.pages.find(p => p.slug === slug);
        if (!page) return showWelcome();

        currentSlug = slug;
        window.location.hash = slug;

        // Update active sidebar
        document.querySelectorAll('.sidebar-link').forEach(l => {
            l.classList.toggle('active', l.dataset.slug === slug);
        });

        // Render main content
        const tagClass = page.tag.toLowerCase();
        const pageIdx = WIKI_DATA.pages.indexOf(page);
        const prev = pageIdx > 0 ? WIKI_DATA.pages[pageIdx - 1] : null;
        const next = pageIdx < WIKI_DATA.pages.length - 1 ? WIKI_DATA.pages[pageIdx + 1] : null;

        // Build image hero if page has image
        const imageHero = page.image
            ? `<div class="page-hero-image"><img src="assets/images/docs/${page.image}" alt="${page.title}" loading="lazy"></div>`
            : '';

        mainContent.innerHTML = `
      ${imageHero}
      <div class="page-header">
        <span class="page-tag ${tagClass}">${page.tag}</span>
        <h1 class="page-title"><span class="icon">${page.icon}</span>${page.title}</h1>
        <p class="page-description">${page.description}</p>
      </div>
      <div class="doc-content">${page.noahContent}</div>
      <div class="page-nav">
        ${prev ? `<a href="#${prev.slug}" onclick="event.preventDefault();" data-nav-slug="${prev.slug}">← ${prev.icon} ${prev.title}</a>` : '<span></span>'}
        ${next ? `<a href="#${next.slug}" onclick="event.preventDefault();" data-nav-slug="${next.slug}">${next.icon} ${next.title} →</a>` : '<span></span>'}
      </div>`;

        // Nav links
        mainContent.querySelectorAll('[data-nav-slug]').forEach(a => {
            a.addEventListener('click', () => navigateTo(a.dataset.navSlug));
        });

        // Update reference panel with iframe
        updateRefPanel(page);

        // Scroll to top
        mainContent.scrollTop = 0;
        window.scrollTo(0, 0);
    }

    // ── Reference Panel (fetch) ────────
    function updateRefPanel(page) {
        if (page) {
            refPanelBody.innerHTML = '<div style="padding: 2rem; color: var(--text-muted); text-align: center;">Loading original docs...</div>';

            fetch(`pages/${page.slug}.html`)
                .then(res => {
                    if (!res.ok) throw new Error('Not found');
                    return res.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const mainContent = doc.querySelector('.doc-page .container');

                    if (mainContent) {
                        // Fix relative image paths
                        const images = mainContent.querySelectorAll('img');
                        images.forEach(img => {
                            const src = img.getAttribute('src');
                            if (src && src.startsWith('../')) {
                                img.setAttribute('src', src.substring(3));
                            }
                        });

                        // Remove unnecessary navigation elements from the side panel content
                        const navs = mainContent.querySelectorAll('.doc-back, .doc-nav');
                        navs.forEach(nav => nav.remove());

                        refPanelBody.innerHTML = mainContent.innerHTML;
                    } else {
                        refPanelBody.innerHTML = '<div style="padding: 2rem; color: var(--text-muted); text-align: center;">Original docs layout not found.</div>';
                    }
                })
                .catch(err => {
                    refPanelBody.innerHTML = `<div style="padding: 2rem; color: var(--text-muted); text-align: center;">
                        <p>Original docs are offline.</p>
                        <p><a href="${page.docsUrl}" target="_blank" style="color: var(--cyan-glow);">Try external link ↗</a></p>
                    </div>`;
                });
        } else {
            refPanelBody.innerHTML = '<p style="color: var(--text-muted); text-align:center; padding:2rem;">Select a page to see the original AntiGravity documentation here.</p>';
        }
    }

    // ── Welcome State ───────────────────
    function showWelcome() {
        currentSlug = null;
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

        const imported = WIKI_DATA.pages.filter(p => p.imported).length;
        const total = WIKI_DATA.pages.length;
        const corePages = WIKI_DATA.pages.filter(p => p.category === 'core' || p.category === 'agent').slice(0, 6);
        const quickHtml = corePages.map(p =>
            `<a class="quick-card" href="#${p.slug}" onclick="event.preventDefault();" data-nav-slug="${p.slug}">
        <div class="qc-icon">${p.icon}</div>
        <h4>${p.title}</h4>
        <p>${p.tag}</p>
      </a>`
        ).join('');

        mainContent.innerHTML = `
      <div class="welcome-state">
        <div class="welcome-emoji">🐸</div>
        <h2>Noah's <span class="gradient">HolodeckOS</span> Wiki</h2>
        <p>Your personalized AntiGravity training manual — ${imported} of ${total} pages have Lumi's custom content. All ${total} pages have live reference panels linked to the official AntiGravity docs.</p>
        <div class="quick-start">${quickHtml}</div>
        <div class="stats-bar">
          <div class="stat"><span class="stat-number">${total}</span><span class="stat-label">Total Pages</span></div>
          <div class="stat"><span class="stat-number">${imported}</span><span class="stat-label">Full Content</span></div>
          <div class="stat"><span class="stat-number">${total - imported}</span><span class="stat-label">Reference Only</span></div>
          <div class="stat"><span class="stat-number">${WIKI_DATA.categories.length}</span><span class="stat-label">Categories</span></div>
        </div>
      </div>`;

        mainContent.querySelectorAll('[data-nav-slug]').forEach(a => {
            a.addEventListener('click', () => navigateTo(a.dataset.navSlug));
        });

        refPanelBody.innerHTML = '<p style="color: var(--text-muted); text-align:center; padding:2rem;">Select a page to see the original AntiGravity documentation here.</p>';
    }

    // ── Reference Panel ─────────────────
    refToggle.addEventListener('click', () => {
        refPanelOpen = !refPanelOpen;
        refPanel.classList.toggle('open', refPanelOpen);
        refToggle.classList.toggle('open', refPanelOpen);
        refToggle.textContent = refPanelOpen ? 'Close ✕' : '📄 Original Docs';
    });

    // ── Search ──────────────────────────
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('.sidebar-link').forEach(link => {
            const slug = link.dataset.slug;
            const page = WIKI_DATA.pages.find(p => p.slug === slug);
            const match = !q || page.title.toLowerCase().includes(q) || page.description.toLowerCase().includes(q) || page.tag.toLowerCase().includes(q);
            link.style.display = match ? '' : 'none';
        });
        // Show categories that have visible children
        document.querySelectorAll('.sidebar-category').forEach(cat => {
            const visible = cat.querySelectorAll('.sidebar-link:not([style*="display: none"])');
            cat.style.display = visible.length ? '' : 'none';
        });
    });

    // ── Mobile Sidebar Toggle ───────────
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    const closeSidebar = document.getElementById('closeSidebar');
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // ── Import Count ────────────────────
    function updateImportCount() {
        const imported = WIKI_DATA.pages.filter(p => p.imported).length;
        const total = WIKI_DATA.pages.length;
        importCount.textContent = `${imported}/${total} Imported`;
    }

    // ── Init ────────────────────────────
    buildSidebar();
    updateImportCount();

    // Route from hash
    const hash = window.location.hash.slice(1);
    if (hash && WIKI_DATA.pages.find(p => p.slug === hash)) {
        navigateTo(hash);
    } else {
        showWelcome();
    }

    // Hash change
    window.addEventListener('hashchange', () => {
        const slug = window.location.hash.slice(1);
        if (slug && WIKI_DATA.pages.find(p => p.slug === slug)) {
            navigateTo(slug);
        } else {
            showWelcome();
        }
    });

})();
