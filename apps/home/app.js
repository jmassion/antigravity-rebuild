// AntiGravity portfolio — reads catalog.json and renders the gallery + detail overlay.

const state = {
  projects: [],
  meta: {},
  category: 'all',
  status: 'all',
  query: '',
  view: localStorage.getItem('ag-view') || 'grid',
};

const DEPTH = {
  1: { dots: '●', label: 'Quick look' },
  2: { dots: '●●', label: 'Explorable' },
  3: { dots: '●●●', label: 'Deep dive' },
};

function depthBadge(p) {
  const d = DEPTH[p.depth] || DEPTH[1];
  return `<span class="depth-label"><span class="depth d${p.depth || 1}">${d.dots}</span>${d.label}</span>`;
}

const $ = (sel) => document.querySelector(sel);

const STATUS_LABELS = { live: 'Live', wip: 'In progress', concept: 'Concept', 'code-only': 'Code only' };

// Deterministic gradient for cards without thumbnails.
function gradientFor(slug) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360;
  const h2 = (h + 70) % 360;
  return `linear-gradient(135deg, hsl(${h} 45% 22%), hsl(${h2} 60% 38%))`;
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

async function load() {
  const res = await fetch('catalog.json');
  const data = await res.json();
  state.projects = data.projects;
  state.meta = data.meta;
  renderChips();
  renderStats();
  render();
  $('#year').textContent = new Date().getFullYear();
  $('#footer-count').textContent = state.projects.length;
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}

function renderStats() {
  const live = state.projects.filter((p) => p.status === 'live').length;
  const embeddable = state.projects.filter((p) => p.embed.type !== 'none').length;
  $('#topbar-stats').innerHTML = `
    <div class="stat"><b>${state.projects.length}</b><span>projects</span></div>
    <div class="stat"><b>${live}</b><span>live</span></div>
    <div class="stat"><b>${embeddable}</b><span>launchable</span></div>
    <div class="stat"><b>${state.meta.categories.length}</b><span>categories</span></div>`;
}

function renderChips() {
  const counts = {};
  for (const p of state.projects) counts[p.category] = (counts[p.category] || 0) + 1;
  const cats = ['all', ...state.meta.categories.filter((c) => counts[c])];
  $('#category-chips').innerHTML = cats
    .map(
      (c) =>
        `<button class="chip ${c === state.category ? 'active' : ''}" data-cat="${c}">
          ${c === 'all' ? 'All' : c}${c === 'all' ? '' : `<span class="count">${counts[c]}</span>`}
        </button>`
    )
    .join('');
  const statuses = ['all', 'live', 'wip', 'concept', 'code-only'];
  $('#status-chips').innerHTML = statuses
    .map(
      (s) =>
        `<button class="chip ${s === state.status ? 'active' : ''}" data-status="${s}">
          ${s === 'all' ? 'Any status' : STATUS_LABELS[s]}
        </button>`
    )
    .join('');
}

function filtered() {
  const q = state.query.toLowerCase();
  return state.projects.filter((p) => {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (state.status !== 'all' && p.status !== state.status) return false;
    if (!q) return true;
    const hay = [p.name, p.tagline, p.description, p.category, ...(p.tech || [])].join(' ').toLowerCase();
    return q.split(/\s+/).every((term) => hay.includes(term));
  });
}

function cardHTML(p) {
  const media = p.thumbnail
    ? `<img src="${p.thumbnail}" alt="${p.name} screenshot" loading="lazy"
         onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'fallback',textContent:'${initials(p.name)}'}))">`
    : `<div class="fallback">${initials(p.name)}</div>`;
  return `
  <article class="card" data-slug="${p.slug}" tabindex="0" role="button" aria-label="${p.name}">
    <div class="card-media" style="background:${gradientFor(p.slug)}">
      ${media}
      <span class="card-status status-${p.status}">${STATUS_LABELS[p.status]}</span>
    </div>
    <div class="card-body">
      <span class="card-cat">${p.category} · ${depthBadge(p)}</span>
      <h3>${p.name}</h3>
      <p class="tagline">${p.tagline}</p>
      <div class="card-tech">${(p.tech || []).slice(0, 4).map((t) => `<span class="tech-chip">${t}</span>`).join('')}</div>
    </div>
  </article>`;
}

function rowHTML(p) {
  const thumb = p.thumbnail
    ? `<img class="row-thumb" src="${p.thumbnail}" alt="" loading="lazy"
         onerror="this.style.background='${gradientFor(p.slug)}';this.src='data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='">`
    : `<div class="row-thumb" style="background:${gradientFor(p.slug)}"></div>`;
  return `
  <div class="row-item" data-slug="${p.slug}" tabindex="0" role="button" aria-label="${p.name}">
    ${thumb}
    <div class="row-name"><b>${p.name}</b><span>${p.category}</span></div>
    <div class="row-tag">${p.tagline}</div>
    ${depthBadge(p)}
    <div class="row-meta"><span class="card-status status-${p.status}" style="position:static">${STATUS_LABELS[p.status]}</span></div>
  </div>`;
}

function render() {
  const items = filtered();
  $('#empty-state').hidden = items.length > 0;
  const gallery = $('#gallery');
  gallery.className = 'gallery' + (state.view === 'list' ? ' view-list' : state.view === 'compact' ? ' view-compact' : '');
  const item = state.view === 'list' ? rowHTML : cardHTML;
  if (state.category === 'all' && !state.query && state.status === 'all') {
    // Grouped view by category
    gallery.innerHTML = state.meta.categories
      .map((cat) => {
        const group = items.filter((p) => p.category === cat);
        if (!group.length) return '';
        return `<h3 class="cat-header">${cat}</h3>` + group.map(item).join('');
      })
      .join('');
  } else {
    gallery.innerHTML = items.map(item).join('');
  }
  document.querySelectorAll('#view-switch button').forEach((b) =>
    b.classList.toggle('active', b.dataset.view === state.view)
  );
}

/* ── Detail overlay ─────────────────────── */

function embedURL(p) {
  if (p.embed.type === 'local') return encodeURI(p.embed.path);
  if (p.embed.type === 'remote') return p.embed.url;
  return null;
}

function openDetail(p) {
  $('#detail-name').textContent = p.name;
  $('#detail-tagline').innerHTML = `${p.tagline} &nbsp; ${depthBadge(p)}`;
  $('#detail-desc').textContent = p.description;
  $('#detail-source').textContent = p.source;
  $('#detail-highlights').innerHTML = (p.highlights || []).map((h) => `<li>${h}</li>`).join('');
  const explore = p.explore || [];
  $('#explore-block').hidden = !explore.length;
  $('#detail-explore').innerHTML = explore.map((e) => `<li>${e}</li>`).join('');
  $('#detail-tech').innerHTML = (p.tech || []).map((t) => `<span class="tech-chip">${t}</span>`).join('');

  const variants = p.variants || [];
  $('#detail-variants-block').hidden = !variants.length;
  $('#detail-variants').innerHTML = variants
    .map((v) => `<a class="tech-chip" href="${encodeURI(v.path)}" target="_blank" rel="noopener">${v.label} ↗</a>`)
    .join('');

  const links = p.links || [];
  $('#detail-links-block').hidden = !links.length;
  $('#detail-links').innerHTML = links
    .map((l) => `<a class="tech-chip" href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`)
    .join('');

  const url = embedURL(p);
  $('#detail-actions').innerHTML = url
    ? `<a class="btn btn-primary" href="${url}" target="_blank" rel="noopener">Open full app ↗</a>`
    : `<span class="tech-chip">Source-only project</span>`;

  const media = $('#detail-media');
  const shot = p.thumbnail
    ? `<img class="shot" src="${p.thumbnail}" alt="${p.name} screenshot"
        onerror="this.style.display='none'">`
    : '';
  media.style.background = gradientFor(p.slug);
  media.innerHTML = url
    ? `${shot || '<div style="height:200px"></div>'}
       <div class="preview-bar"><button class="btn btn-primary" id="load-preview">▶ Load live preview</button></div>`
    : `${shot || '<div style="height:140px"></div>'}`;

  const loadBtn = $('#load-preview');
  if (loadBtn)
    loadBtn.addEventListener('click', () => {
      media.innerHTML = `<iframe src="${url}" title="${p.name} live preview" loading="eager"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>`;
    });

  $('#overlay').hidden = false;
  document.body.style.overflow = 'hidden';
  if (location.hash !== `#p/${p.slug}`) history.replaceState(null, '', `#p/${p.slug}`);
}

function closeDetail() {
  $('#overlay').hidden = true;
  $('#detail-media').innerHTML = ''; // kill any running iframe
  document.body.style.overflow = '';
  if (location.hash) history.replaceState(null, '', location.pathname);
}

function openFromHash() {
  const m = location.hash.match(/^#p\/(.+)$/);
  if (!m) return;
  const p = state.projects.find((x) => x.slug === decodeURIComponent(m[1]));
  if (p) openDetail(p);
}

/* ── Events ─────────────────────────────── */

document.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip[data-cat], .chip[data-status]');
  if (chip) {
    if (chip.dataset.cat) state.category = chip.dataset.cat;
    if (chip.dataset.status) state.status = chip.dataset.status;
    renderChips();
    render();
    return;
  }
  const card = e.target.closest('.card[data-slug], .row-item[data-slug]');
  if (card) {
    const p = state.projects.find((x) => x.slug === card.dataset.slug);
    if (p) openDetail(p);
    return;
  }
  const vbtn = e.target.closest('#view-switch button');
  if (vbtn) {
    state.view = vbtn.dataset.view;
    localStorage.setItem('ag-view', state.view);
    render();
    return;
  }
  if (e.target.closest('[data-close]')) closeDetail();
  if (e.target.closest('[data-close-about]')) $('#about-overlay').hidden = true;
});

/* ── Nav ────────────────────────────────── */
$('#nav-about').addEventListener('click', () => {
  const live = state.projects.filter((p) => p.status === 'live').length;
  const deep = state.projects.filter((p) => p.depth === 3).length;
  $('#about-stats').innerHTML = `
    <div class="stat"><b>${state.projects.length}</b><span>projects</span></div>
    <div class="stat"><b>${live}</b><span>live</span></div>
    <div class="stat"><b>${deep}</b><span>deep dives</span></div>
    <div class="stat"><b>1</b><span>origin, zero servers</span></div>`;
  $('#about-overlay').hidden = false;
});

$('#nav-random').addEventListener('click', () => {
  const pool = state.projects.filter((p) => p.embed.type !== 'none');
  openDetail(pool[Math.floor(Math.random() * pool.length)]);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#about-overlay').hidden) { $('#about-overlay').hidden = true; return; }
  if (e.key === 'Escape' && !$('#overlay').hidden) closeDetail();
  if (e.key === '/' && document.activeElement !== $('#search')) {
    e.preventDefault();
    $('#search').focus();
  }
});

document.addEventListener('keypress', (e) => {
  const card = e.target.closest?.('.card[data-slug], .row-item[data-slug]');
  if (card && (e.key === 'Enter' || e.key === ' ')) card.click();
});

$('#search').addEventListener('input', (e) => {
  state.query = e.target.value.trim();
  render();
});

load();
