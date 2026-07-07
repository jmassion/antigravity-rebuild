/* ═══════════════════════════════════════════════════════
   SANITY WIKI — Browser Application
   AntiGravity • 2026
   ═══════════════════════════════════════════════════════ */

// ── Configuration ─────────────────────────────────────
const BASE_PATH = '';  // relative — works from any host
let CONFIG = null;
let ALL_PAGES = [];    // { path, title, content, links }
let BACKLINKS = {};    // { targetPath: [{ from, context }] }
let SEARCH_INDEX = []; // flattened searchable entries

// ── Known pages manifest (all .md files in the wiki) ──
const PAGE_MANIFEST = [
  '00-getting-started/README.md',
  '00-getting-started/01-prerequisites.md',
  '00-getting-started/02-github-setup.md',
  '00-getting-started/03-vercel-setup.md',
  '00-getting-started/04-folder-structure.md',
  '00-getting-started/05-conventions.md',
  '01-framework/README.md',
  '01-framework/core-objects.md',
  '01-framework/schema-design.md',
  '01-framework/backlink-system.md',
  '02-agents/README.md',
  '02-agents/agent-registry.md',
  '02-agents/orchestration.md',
  '03-skills/README.md',
  '04-styles/README.md',
  '04-styles/liquid-glass.md',
  '04-styles/color-palette.md',
  '04-styles/typography.md',
  '04-styles/3d-visualization.md',
  '05-rules/README.md',
  '05-rules/global-rules.md',
  '05-rules/code-rules.md',
  '05-rules/content-rules.md',
  '06-brand/README.md',
  '07-publishing/README.md',
  '08-crm/README.md',
  '09-core-objects/README.md',
  '10-changelog/README.md',
  '11-planning/README.md',
  '11-planning/sanity-studio.md',
  '11-planning/sanity-mcp.md',
  '11-planning/playcanvas-3d-ui.md',
  '03-skills/sanity-skills.md',
  '11-planning/command-center.md',
  '11-planning/roadmap.md',
  '12-chat-logs/README.md',
  '12-chat-logs/2026-04-10_wiki-setup.md',
  '_orchestration/README.md',
  '09-core-objects/worlds-themes.md',
  '09-core-objects/materials-objects.md',
  '09-core-objects/characters-teams.md',
  '09-core-objects/companies-orgs.md',
  '09-core-objects/time-tasks-projects.md',
  '09-core-objects/infrastructure.md',
  '09-core-objects/connectors-integrations.md',
  '09-core-objects/tags-taxonomy.md',
  '02-agents/rules/global-rules.md',
  '03-skills/skill-template.md',
  '06-brand/brand-identity.md',
  '07-publishing/channels.md',
  '07-publishing/workflows.md',
  '08-crm/contacts.md',
  '08-crm/organizations.md',
  '10-changelog/2026-04-10.md'
];

// ── Initialize ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupTheme();
  setupSidebarToggle();
  setupSearchShortcut();

  // Load config
  try {
    const resp = await fetch('_config.json');
    CONFIG = await resp.json();
  } catch (e) {
    console.warn('Could not load _config.json, using defaults');
    CONFIG = { title: 'Sanity Wiki', sections: [] };
  }

  // Load all pages for backlinks and search
  await loadAllPages();

  // Build sidebar from config using loaded pages
  buildSidebar();

  // Setup right drawer toggle
  setupContextDrawerToggle();

  // Compute backlinks
  computeBacklinks();

  // Build search index
  buildSearchIndex();
  setupSearch();

  // Handle routing
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // Load orchestration status
  loadOrchestrationStatus();
}

// ── Theme ─────────────────────────────────────────────
function setupTheme() {
  const saved = localStorage.getItem('wiki-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('wiki-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle i');
  icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// ── Sidebar ───────────────────────────────────────────
function setupSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const isMobile = window.innerWidth <= 900;

  if (isMobile) {
    sidebar.classList.add('collapsed');
  }

  toggle.addEventListener('click', () => {
    if (isMobile) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });

  // Close mobile sidebar on navigation
  document.addEventListener('click', (e) => {
    if (isMobile && sidebar.classList.contains('mobile-open')) {
      if (!sidebar.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
      }
    }
  });
}

function setupContextDrawerToggle() {
  const drawer = document.getElementById('context-drawer');
  const toggle = document.getElementById('context-toggle');
  const layout = document.querySelector('.layout');
  
  if (!drawer || !toggle) return;

  const isMobile = window.innerWidth <= 900;

  toggle.addEventListener('click', () => {
    if (isMobile) {
      drawer.classList.toggle('mobile-open');
    } else {
      drawer.classList.toggle('collapsed');
      layout.classList.toggle('context-open');
    }
  });

  // Close mobile drawer on outer click
  document.addEventListener('click', (e) => {
    if (isMobile && drawer.classList.contains('mobile-open')) {
      if (!drawer.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        drawer.classList.remove('mobile-open');
      }
    }
  });
}

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!CONFIG || !CONFIG.sections) return;

  let html = '';
  for (const section of CONFIG.sections) {
    // Find pages for this section
    const pages = ALL_PAGES.filter(p => p.path.startsWith(section.id + '/') && !p.path.endsWith('README.md'));
    
    let subHtml = '';
    if (pages.length > 0) {
      for (const p of pages) {
        subHtml += `<a class="nav-subitem" data-path="${p.path}" onclick="navigateToFile('${p.path}')">${formatLabel(p.path.replace(section.id + '/', '').replace('.md', ''))}</a>`;
      }
    }

    const isExpanded = window.location.hash.includes(section.id) ? 'expanded' : '';

    html += `
      <div class="nav-item ${isExpanded}" data-section="${section.id}" onclick="toggleSidebarSection('${section.id}')">
        <span class="nav-icon">${section.icon}</span>
        <span class="nav-label">${section.label}</span>
        ${pages.length > 0 ? '<i class="fa-solid fa-chevron-right nav-chevron"></i>' : ''}
      </div>
      <div class="nav-subitems" id="sub-${section.id}">
        ${subHtml}
      </div>
    `;
  }
  nav.innerHTML = html;
}

window.toggleSidebarSection = function(sectionId) {
  const item = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (item) {
    item.classList.toggle('expanded');
    // If exploring, we can navigate to README if clicked, but let's just toggle depth for now.
  }
}

// ── Page Loading ──────────────────────────────────────
async function loadAllPages() {
  const promises = PAGE_MANIFEST.map(async (filePath) => {
    try {
      const resp = await fetch(filePath);
      if (!resp.ok) return null;
      const content = await resp.text();
      const title = extractTitle(content) || filePath;
      const links = extractWikiLinks(content);
      return { path: filePath, title, content, links };
    } catch (e) {
      return null;
    }
  });

  const results = await Promise.all(promises);
  ALL_PAGES = results.filter(Boolean);
}

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)/m);
  if (match) {
    // Strip emoji prefix
    return match[1].replace(/^[\u{1F000}-\u{1FFFF}]\s*/u, '').trim();
  }
  return null;
}

function extractWikiLinks(content) {
  const regex = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g;
  const links = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

// ── Backlinks ─────────────────────────────────────────
function computeBacklinks() {
  BACKLINKS = {};

  for (const page of ALL_PAGES) {
    for (const link of page.links) {
      // Normalize link target to a file path
      const targetPath = resolveWikiLink(link);

      if (!BACKLINKS[targetPath]) {
        BACKLINKS[targetPath] = [];
      }

      // Find context around the link
      const linkRegex = new RegExp(`\\[\\[${escapeRegex(link)}(?:\\|[^\\]]+)?\\]\\]`);
      const lineMatch = page.content.split('\n').find(line => linkRegex.test(line));
      const context = lineMatch ? lineMatch.trim().substring(0, 120) : '';

      BACKLINKS[targetPath].push({
        from: page.path,
        fromTitle: page.title,
        context
      });
    }
  }
}

function resolveWikiLink(link) {
  // [[section]] → section/README.md
  // [[section/page]] → section/page.md
  if (link.includes('/')) {
    // Check if it's already a path to a file
    const candidate = link + '.md';
    if (PAGE_MANIFEST.includes(candidate)) return candidate;
    // Maybe it's a section with README
    const readmeCandidate = link + '/README.md';
    if (PAGE_MANIFEST.includes(readmeCandidate)) return readmeCandidate;
    return candidate;
  } else {
    // Section name → section/README.md
    const readmeCandidate = link + '/README.md';
    if (PAGE_MANIFEST.includes(readmeCandidate)) return readmeCandidate;
    return readmeCandidate;
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Search ────────────────────────────────────────────
function buildSearchIndex() {
  SEARCH_INDEX = ALL_PAGES.map(page => ({
    path: page.path,
    title: page.title,
    excerpt: page.content.substring(0, 300).replace(/[#\[\]|*_`]/g, ''),
    searchable: (page.title + ' ' + page.content).toLowerCase()
  }));
}

function setupSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const overlay = document.getElementById('search-overlay');

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      results.classList.remove('visible');
      overlay.classList.remove('visible');
      return;
    }

    const matches = SEARCH_INDEX.filter(item =>
      item.searchable.includes(query)
    ).slice(0, 8);

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-result-item"><span class="result-title" style="color:var(--text-muted)">No results found</span></div>';
    } else {
      results.innerHTML = matches.map(m => `
        <div class="search-result-item" onclick="navigateToFile('${m.path}')">
          <div class="result-title">${highlightMatch(m.title, query)}</div>
          <div class="result-path">${m.path}</div>
        </div>
      `).join('');
    }

    results.classList.add('visible');
    overlay.classList.add('visible');
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      results.classList.remove('visible');
      overlay.classList.remove('visible');
    }, 200);
  });

  overlay.addEventListener('click', () => {
    results.classList.remove('visible');
    overlay.classList.remove('visible');
    input.value = '';
  });
}

function setupSearchShortcut() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
    if (e.key === 'Escape') {
      document.getElementById('search-results').classList.remove('visible');
      document.getElementById('search-overlay').classList.remove('visible');
      document.getElementById('search-input').blur();
      document.getElementById('search-input').value = '';
    }
  });
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return text.substring(0, idx) +
    '<mark style="background:var(--accent-glow);color:var(--text-primary);padding:0 2px;border-radius:2px">' +
    text.substring(idx, idx + query.length) +
    '</mark>' +
    text.substring(idx + query.length);
}

// ── Routing ───────────────────────────────────────────
function handleRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');

  if (!hash) {
    // Default to getting started
    navigateTo('00-getting-started');
    return;
  }

  // Parse hash → file path
  let filePath = hash;
  if (!filePath.endsWith('.md')) {
    // Check if it's a section (→ README.md)
    const readmePath = filePath + '/README.md';
    if (PAGE_MANIFEST.includes(readmePath)) {
      filePath = readmePath;
    } else {
      filePath = filePath + '.md';
    }
  }

  loadPage(filePath);
}

function navigateTo(sectionId) {
  window.location.hash = '#/' + sectionId;
}

window.navigateTo = navigateTo;

function navigateToFile(filePath) {
  // Strip .md and README.md for cleaner URLs
  let hash = filePath;
  if (hash.endsWith('/README.md')) {
    hash = hash.replace('/README.md', '');
  } else if (hash.endsWith('.md')) {
    hash = hash.replace('.md', '');
  }
  window.location.hash = '#/' + hash;

  // Close search
  document.getElementById('search-results').classList.remove('visible');
  document.getElementById('search-overlay').classList.remove('visible');
  document.getElementById('search-input').value = '';

  // Close mobile sidebar and context drawer
  document.getElementById('sidebar').classList.remove('mobile-open');
  const contextDrawer = document.getElementById('context-drawer');
  if (contextDrawer) contextDrawer.classList.remove('mobile-open');
}

window.navigateToFile = navigateToFile;

// ── Page Rendering ────────────────────────────────────
async function loadPage(filePath) {
  const loadingEl = document.getElementById('content-loading');
  const articleEl = document.getElementById('content-article');
  const bodyEl = document.getElementById('article-body');
  const headerEl = document.getElementById('article-header');
  const footerEl = document.getElementById('article-footer');
  const backlinksPanel = document.getElementById('backlinks-panel');

  // Show loading
  loadingEl.classList.remove('hidden');
  articleEl.classList.remove('visible');
  backlinksPanel.classList.remove('visible');

  // Find cached page or fetch
  let pageData = ALL_PAGES.find(p => p.path === filePath);

  if (!pageData) {
    try {
      const resp = await fetch(filePath);
      if (!resp.ok) throw new Error('Not found');
      const content = await resp.text();
      pageData = {
        path: filePath,
        title: extractTitle(content) || filePath,
        content,
        links: extractWikiLinks(content)
      };
    } catch (e) {
      bodyEl.innerHTML = `
        <h1>Page Not Found</h1>
        <p>Could not load <code>${filePath}</code></p>
        <p><a href="#/00-getting-started" class="wiki-link">← Back to Getting Started</a></p>
      `;
      loadingEl.classList.add('hidden');
      articleEl.classList.add('visible');
      return;
    }
  }

  // Render markdown
  const rendered = renderMarkdown(pageData.content);
  bodyEl.innerHTML = rendered;

  // Generate Table of Contents
  generateToC(pageData.content);

  // Header meta
  headerEl.innerHTML = `<div class="meta-path">${filePath}</div>`;
  
  // Footer
  footerEl.innerHTML = `
    <span>📄 ${filePath}</span>
    <a href="https://github.com/jmassion/sanity/blob/main/${filePath}" target="_blank" rel="noopener">
      <i class="fa-brands fa-github"></i> View on GitHub
    </a>
  `;

  // Update sidebar active state
  updateSidebarActive(filePath);

  // Update breadcrumbs
  updateBreadcrumbs(filePath);

  // Show backlinks
  showBacklinks(filePath);

  // Reveal
  loadingEl.classList.add('hidden');
  articleEl.classList.remove('visible');
  // Force reflow for animation
  void articleEl.offsetHeight;
  articleEl.classList.add('visible');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderMarkdown(content) {
  // Configure marked
  marked.setOptions({
    breaks: false,
    gfm: true,
    headerIds: true
  });

  // Pre-process wiki links
  let processed = content.replace(
    /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g,
    (match, target, displayText) => {
      const display = displayText || target;
      const linkPath = target.trim();
      // Build a navigable hash link
      let hash = linkPath;
      return `<a class="wiki-link" onclick="navigateToFile('${resolveWikiLink(hash)}')">${display}</a>`;
    }
  );

  return marked.parse(processed);
}

function updateSidebarActive(filePath) {
  // Extract section from path
  const section = filePath.split('/')[0];

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === section) {
      item.classList.add('active');
      item.classList.add('expanded'); // Auto expand the current section parent
    }
  });

  document.querySelectorAll('.nav-subitem').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.path === filePath) {
      item.classList.add('active');
    }
  });
}

function generateToC(content) {
  const panel = document.getElementById('toc-panel');
  const list = document.getElementById('toc-list');
  if (!panel || !list) return;

  const regex = /^(##|###)\s+(.+)/gm;
  const headings = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({ level: match[1].length, text: match[2].trim() });
  }

  if (headings.length === 0) {
    panel.classList.add('hidden');
    return;
  }

  list.innerHTML = headings.map(h => {
    // Generate valid slug same as marked.js fallback heuristics
    const slug = h.text.toLowerCase().replace(/[^\w]+/g, '-');
    const isNested = h.level === 3 ? 'nested' : '';
    return `<span class="toc-item ${isNested}" onclick="scrollToHeading('${slug}')">${h.text}</span>`;
  }).join('');

  panel.classList.remove('hidden');
}

window.scrollToHeading = function(slug) {
  const el = document.getElementById(slug);
  if (el) {
    const topBarHeight = 60;
    const y = el.getBoundingClientRect().top + window.scrollY - topBarHeight - 20;
    window.scrollTo({top: y, behavior: 'smooth'});
  }
  const drawer = document.getElementById('context-drawer');
  if (drawer && window.innerWidth <= 900) {
    drawer.classList.remove('mobile-open');
  }
}

function updateBreadcrumbs(filePath) {
  const bc = document.getElementById('breadcrumbs');
  const parts = filePath.replace('.md', '').replace('/README', '').split('/');

  let html = `<a href="#/00-getting-started">Home</a>`;

  for (let i = 0; i < parts.length; i++) {
    const path = parts.slice(0, i + 1).join('/');
    const label = formatLabel(parts[i]);
    html += `<span class="bc-sep"><i class="fa-solid fa-chevron-right"></i></span>`;

    if (i === parts.length - 1) {
      html += `<span class="bc-current">${label}</span>`;
    } else {
      html += `<a href="#/${path}">${label}</a>`;
    }
  }

  bc.innerHTML = html;
}

function formatLabel(slug) {
  return slug
    .replace(/^\d+-/, '') // Remove number prefix
    .replace(/-/g, ' ')   // Dashes to spaces
    .replace(/\b\w/g, c => c.toUpperCase()); // Title case
}

// ── Backlinks Display ─────────────────────────────────
function showBacklinks(filePath) {
  const panel = document.getElementById('backlinks-panel');
  const list = document.getElementById('backlinks-list');
  const count = document.getElementById('backlink-count');

  const links = BACKLINKS[filePath] || [];

  if (links.length === 0) {
    panel.classList.remove('visible');
    return;
  }

  count.textContent = links.length;

  list.innerHTML = links.map(bl => `
    <div class="backlink-item" onclick="navigateToFile('${bl.from}')">
      <i class="fa-solid fa-arrow-turn-up fa-rotate-90 bl-icon"></i>
      <span class="bl-path">${bl.fromTitle}</span>
    </div>
  `).join('');

  panel.classList.add('visible');
}

// ── Orchestration Status ──────────────────────────────
async function loadOrchestrationStatus() {
  try {
    const resp = await fetch('_orchestration/status.json');
    const data = await resp.json();
    const badge = document.getElementById('orchestration-badge');

    const agentCount = Object.keys(data.agents || {}).length;
    const activeAgents = Object.values(data.agents || {}).filter(a => a.status === 'active').length;

    badge.innerHTML = `
      <div class="status-dot" style="background: ${activeAgents > 0 ? 'var(--accent-secondary)' : 'var(--text-muted)'}"></div>
      <span>${activeAgents > 0 ? `${activeAgents} agent${activeAgents > 1 ? 's' : ''} active` : 'System idle'}</span>
    `;
  } catch (e) {
    // Silent fail
  }
}
