/* ═══════════════════════════════════════════════════════════════
   Air DAM Browser — Main Application Controller
   Full-featured with working video player, chapter timeline,
   transcript sync, and all interactive controls.
   ═══════════════════════════════════════════════════════════════ */

// ─── Utility: Format bytes to human readable ───
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// ─── Board Map (lookup by ID) ───
const boardMap = {};
for (const b of BOARDS) { boardMap[b.id] = b; }

// ─── State ───
const state = {
  currentBoardId: 'root',
  currentView: 'gallery',
  sortField: 'dateCreated',
  sortAsc: false,
  searchQuery: '',
  filteredAssets: [],
  showAllFields: false,
  currentDetailIndex: -1,
  expandedBoards: new Set(['root', 'lovart', 'higgsfield']),
  leftPanel: null, // 'chapters' | 'transcript' | 'chat' | null
  activeRpTab: 'info', // 'info' | 'provenance' | 'comments'
  tableColumns: [...TABLE_COLUMNS],
  kanbanGroupBy: 'toolName',
  rightPanelCollapsed: false,
  // Filter chips
  activeFilters: {}, // e.g. { type: 'video', source: 'Lovart' }
  favoritesMode: false,
  // Video playback state
  videoPlaying: false,
  videoCurrentTime: 0,
  videoDuration: 0,
  videoSpeed: 1,
  videoTimerInterval: null,
};

// ─── Persistence ───
function savePrefs() {
  try {
    localStorage.setItem('dam_prefs', JSON.stringify({
      currentView: state.currentView,
      sortField: state.sortField,
      sortAsc: state.sortAsc,
      kanbanGroupBy: state.kanbanGroupBy,
      tableColumns: state.tableColumns.map(c => ({ key: c.key, visible: c.visible })),
      expandedBoards: [...state.expandedBoards],
    }));
  } catch(e) {}
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem('dam_prefs');
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p.currentView) state.currentView = p.currentView;
    if (p.sortField) state.sortField = p.sortField;
    if (typeof p.sortAsc === 'boolean') state.sortAsc = p.sortAsc;
    if (p.kanbanGroupBy) state.kanbanGroupBy = p.kanbanGroupBy;
    if (p.tableColumns) {
      p.tableColumns.forEach(saved => {
        const col = state.tableColumns.find(c => c.key === saved.key);
        if (col) col.visible = saved.visible;
      });
    }
    if (p.expandedBoards) state.expandedBoards = new Set(p.expandedBoards);
  } catch(e) {}
}

// ─── Initialize ───
let domReady = false;
let appInitialized = false;
document.addEventListener('DOMContentLoaded', () => {
  domReady = true;
  console.log('DOM ready. Assets loaded:', ALL_ASSETS.length);
  if (ALL_ASSETS.length > 0) initApp();
});

function initApp() {
  if (!domReady || appInitialized) return;
  if (ALL_ASSETS.length === 0) { console.warn('initApp called with 0 assets'); return; }
  appInitialized = true;
  console.log('Initializing app with', ALL_ASSETS.length, 'assets');
  document.getElementById('loadingOverlay')?.remove();
  loadPrefs();
  renderSidebar();
  renderFilterChips();
  navigateToBoard('root');
  bindEvents();
  // Sync view toggle buttons with loaded pref
  document.querySelectorAll('.view-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === state.currentView);
  });
  // Sync sort label
  const sortItem = document.querySelector(`[data-sort="${state.sortField}"]`);
  if (sortItem) {
    document.getElementById('sortLabel').textContent = sortItem.textContent;
    document.querySelectorAll('#sortDropdown .dropdown-item').forEach(el => el.classList.remove('active'));
    sortItem.classList.add('active');
  }
}

// ═══════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════

// Pre-build board count cache so sidebar doesn't loop 16K assets per node
const boardCountCache = {};

function buildBoardCountCache() {
  // Direct counts
  Object.keys(boardCountCache).forEach(k => delete boardCountCache[k]);
  ALL_ASSETS.forEach(a => {
    a.boards.forEach(b => {
      boardCountCache[b.id] = (boardCountCache[b.id] || 0) + 1;
    });
  });
  // Roll up counts to parent boards
  for (const board of BOARDS) {
    if (!board.parentId) continue;
    // Will be summed in getBoardAssetCount
  }
}

function renderSidebar() {
  buildBoardCountCache();
  const tree = document.getElementById('boardTree');
  const roots = BOARDS.filter(b => !b.parentId);
  tree.innerHTML = roots.map(b => renderBoardNode(b)).join('');
}

function getBoardAssetCount(boardId) {
  const ids = [boardId, ...getDescendantBoardIds(boardId)];
  return ids.reduce((sum, id) => sum + (boardCountCache[id] || 0), 0);
}

function renderBoardNode(board) {
  const hasChildren = board.children && board.children.length > 0;
  const isExpanded = state.expandedBoards.has(board.id);
  const isActive = state.currentBoardId === board.id;
  const childBoards = hasChildren
    ? board.children.map(cid => BOARDS.find(b => b.id === cid)).filter(Boolean) : [];
  const count = getBoardAssetCount(board.id);

  return `
    <div class="board-node" data-board-id="${board.id}">
      <div class="board-row ${isActive ? 'active' : ''}" data-board-id="${board.id}">
        <div class="board-chevron ${hasChildren ? (isExpanded ? 'expanded' : '') : 'leaf'}"
             data-toggle-board="${board.id}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="board-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="3" width="11" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M4 3V2.5A1 1 0 015 1.5h4a1 1 0 011 1V3" stroke="currentColor" stroke-width="1.2"/>
          </svg>
        </div>
        <span class="board-label">${board.title}</span>
        <span class="board-count">${count}</span>
      </div>
      ${hasChildren ? `
        <div class="board-children ${isExpanded ? '' : 'collapsed'}">
          ${childBoards.map(c => renderBoardNode(c)).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// ═══════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════

function navigateToBoard(boardId) {
  state.currentBoardId = boardId;
  state.searchQuery = '';
  state.favoritesMode = false;
  document.getElementById('searchInput').value = '';
  document.getElementById('favoritesNav')?.classList.remove('active');
  document.querySelectorAll('.board-row').forEach(el => {
    el.classList.toggle('active', el.dataset.boardId === boardId);
  });
  renderBreadcrumbs();
  const board = boardMap[boardId];
  document.getElementById('boardTitle').textContent = board ? board.title : 'All Assets';
  document.getElementById('searchInput').placeholder = `Search ${board?.title || 'assets'}...`;
  filterAndRender();
}

function navigateToFavorites() {
  state.favoritesMode = true;
  state.currentBoardId = 'root';
  state.searchQuery = '';
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.board-row').forEach(el => el.classList.remove('active'));
  document.getElementById('favoritesNav')?.classList.add('active');
  document.getElementById('boardTitle').textContent = 'Favorites';
  document.getElementById('searchInput').placeholder = 'Search favorites...';
  const crumbs = document.getElementById('breadcrumbs');
  crumbs.innerHTML = '<span class="breadcrumb-current"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 3.9L7 10.2l-3.6 1.9.7-3.9L1.2 5.2l4-.6L7 1z" stroke="currentColor" stroke-width="1" stroke-linejoin="round" fill="currentColor" fill-opacity="0.3"/></svg> Favorites</span>';
  filterAndRender();
}

function renderBreadcrumbs() {
  const crumbs = getBoardPath(state.currentBoardId);
  const container = document.getElementById('breadcrumbs');
  container.innerHTML = crumbs.map((board, i) => {
    if (i === crumbs.length - 1) {
      return `<span class="breadcrumb-current">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M4 3V2.5A1 1 0 015 1.5h4a1 1 0 011 1V3" stroke="currentColor" stroke-width="1.2"/></svg>
        ${board.title}
      </span>`;
    }
    return `<span class="breadcrumb-item" data-board-id="${board.id}">${board.title}</span>
            <span class="breadcrumb-separator">/</span>`;
  }).join('');
}

function getBoardPath(boardId) {
  const path = [];
  let current = boardMap[boardId];
  while (current) {
    path.unshift(current);
    current = current.parentId ? boardMap[current.parentId] : null;
  }
  return path;
}

// ═══════════════════════════════════════════════════
//  FILTER & SORT
// ═══════════════════════════════════════════════════

function filterAndRender() {
  let assets = [...ALL_ASSETS];

  // Favorites filter
  if (state.favoritesMode) {
    assets = assets.filter(a => a.customFields.isFavourite === 'Yes');
  }

  // Board filter
  if (!state.favoritesMode && state.currentBoardId !== 'root') {
    const boardIds = getDescendantBoardIds(state.currentBoardId);
    boardIds.push(state.currentBoardId);
    assets = assets.filter(a => a.boards.some(b => boardIds.includes(b.id)));
  }

  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    assets = assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.extension.toLowerCase().includes(q) ||
      (a.customFields.source || '').toLowerCase().includes(q) ||
      (a.customFields.prompt || '').toLowerCase().includes(q) ||
      (a.customFields.toolName || '').toLowerCase().includes(q) ||
      (a.customFields.generationMethod || '').toLowerCase().includes(q) ||
      (a.customFields.projectName || '').toLowerCase().includes(q) ||
      (a.customFields.category || '').toLowerCase().includes(q) ||
      a.smartTags.some(t => t.toLowerCase().includes(q)) ||
      a.smartSummary.toLowerCase().includes(q)
    );
  }

  // Active filter chips
  for (const [field, value] of Object.entries(state.activeFilters)) {
    assets = assets.filter(a => {
      if (field === 'type') return a.type === value;
      return (a.customFields[field] || '') === value;
    });
  }

  // Sort
  assets.sort((a, b) => {
    let va, vb;
    switch (state.sortField) {
      case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
      case 'size': va = a.size; vb = b.size; break;
      case 'dateCreated': va = a.createdAt; vb = b.createdAt; break;
      case 'dateModified': va = a.modifiedAt; vb = b.modifiedAt; break;
      case 'resolution': va = a.resolution.width * a.resolution.height; vb = b.resolution.width * b.resolution.height; break;
      case 'type': va = a.type; vb = b.type; break;
      case 'extension': va = a.extension; vb = b.extension; break;
      case 'toolName': va = a.customFields.toolName || ''; vb = b.customFields.toolName || ''; break;
      case 'subAgent': va = a.customFields.subAgent || ''; vb = b.customFields.subAgent || ''; break;
      case 'artifactType': va = a.customFields.artifactType || ''; vb = b.customFields.artifactType || ''; break;
      default: va = a.modifiedAt; vb = b.modifiedAt;
    }
    if (va < vb) return state.sortAsc ? -1 : 1;
    if (va > vb) return state.sortAsc ? 1 : -1;
    return 0;
  });
  state.filteredAssets = assets;
  document.getElementById('assetCount').textContent = `${assets.length} ASSETS`;
  document.getElementById('statusInfo').textContent = `${assets.length} assets · ${formatBytes(assets.reduce((s, a) => s + a.size, 0))}`;

  // Empty state
  const emptyState = document.getElementById('emptyState');
  if (assets.length === 0) {
    emptyState.classList.remove('hidden');
    if (state.searchQuery) {
      document.getElementById('emptyStateTitle').textContent = `No results for "${state.searchQuery}"`;
      document.getElementById('emptyStateDesc').textContent = 'Try a different search term or clear your filters';
    } else if (state.favoritesMode) {
      document.getElementById('emptyStateTitle').textContent = 'No favorites yet';
      document.getElementById('emptyStateDesc').textContent = 'Star assets to add them to your favorites';
    } else if (Object.keys(state.activeFilters).length > 0) {
      document.getElementById('emptyStateTitle').textContent = 'No matching assets';
      document.getElementById('emptyStateDesc').textContent = 'Try removing some filters';
    } else {
      document.getElementById('emptyStateTitle').textContent = 'This board is empty';
      document.getElementById('emptyStateDesc').textContent = 'Upload assets or move them here from another board';
    }
  } else {
    emptyState.classList.add('hidden');
  }

  renderCurrentView();
  updateFilterChipsActive();
  savePrefs();
}

function getDescendantBoardIds(boardId) {
  const board = boardMap[boardId];
  if (!board || !board.children) return [];
  const ids = [];
  for (const childId of board.children) {
    ids.push(childId);
    ids.push(...getDescendantBoardIds(childId));
  }
  return ids;
}

// ═══════════════════════════════════════════════════
//  FILTER CHIPS
// ═══════════════════════════════════════════════════

function renderFilterChips() {
  const container = document.getElementById('filterChips');
  // Count assets by type
  const typeCounts = {};
  const sourceCounts = {};
  const toolCounts = {};
  ALL_ASSETS.forEach(a => {
    typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    const src = a.customFields.source;
    if (src) sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    const tool = a.customFields.toolName;
    if (tool) toolCounts[tool] = (toolCounts[tool] || 0) + 1;
  });

  const chips = [];
  // Type chips
  chips.push({ label: 'Type', divider: true });
  Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).forEach(([val, count]) => {
    chips.push({ field: 'type', value: val, label: val, count, color: PILL_COLORS[val] || '' });
  });
  // Source chips
  chips.push({ label: 'Source', divider: true });
  Object.entries(sourceCounts).sort((a,b) => b[1]-a[1]).forEach(([val, count]) => {
    chips.push({ field: 'source', value: val, label: val, count, color: PILL_COLORS[val] || '' });
  });
  // Tool chips (top 4)
  chips.push({ label: 'Tool', divider: true });
  Object.entries(toolCounts).sort((a,b) => b[1]-a[1]).slice(0, 4).forEach(([val, count]) => {
    chips.push({ field: 'toolName', value: val, label: val, count, color: PILL_COLORS[val] || '' });
  });

  container.innerHTML = chips.map(chip => {
    if (chip.divider) {
      return `<span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);padding:0 4px">${chip.label}</span>`;
    }
    const isActive = state.activeFilters[chip.field] === chip.value;
    return `<button class="filter-chip ${isActive ? 'active' : ''}" data-filter-field="${chip.field}" data-filter-value="${chip.value}">
      ${chip.label}
      <span class="chip-count">${chip.count}</span>
    </button>`;
  }).join('');

  // Bind chip clicks
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const field = chip.dataset.filterField;
      const value = chip.dataset.filterValue;
      if (state.activeFilters[field] === value) {
        delete state.activeFilters[field];
      } else {
        state.activeFilters[field] = value;
      }
      filterAndRender();
    });
  });
}

function updateFilterChipsActive() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    const field = chip.dataset.filterField;
    const value = chip.dataset.filterValue;
    chip.classList.toggle('active', state.activeFilters[field] === value);
  });
  const clearBtn = document.getElementById('filterClearBtn');
  if (clearBtn) {
    clearBtn.classList.toggle('hidden', Object.keys(state.activeFilters).length === 0);
  }
}

// ═══════════════════════════════════════════════════
//  VIEW RENDERING
// ═══════════════════════════════════════════════════

function renderCurrentView() {
  document.getElementById('galleryView').classList.toggle('hidden', state.currentView !== 'gallery');
  document.getElementById('tableView').classList.toggle('hidden', state.currentView !== 'table');
  document.getElementById('kanbanView').classList.toggle('hidden', state.currentView !== 'kanban');
  switch (state.currentView) {
    case 'gallery': renderGallery(); break;
    case 'table': renderTable(); break;
    case 'kanban': renderKanban(); break;
  }
}

// ─── Gallery (paginated infinite-scroll) ───
const PAGE_SIZE = 80;
let galleryPage = 0;
let galleryObserver = null;

function renderGallery() {
  // Reset pagination on a fresh render
  galleryPage = 0;
  const container = document.getElementById('galleryView');
  container.innerHTML = '';

  // Disconnect any previous scroll sentinel
  if (galleryObserver) { galleryObserver.disconnect(); galleryObserver = null; }

  appendGalleryPage(container);
}

function makeCardHTML(asset, i) {
  const categoryEmojis = { generated: '✨', researched: '🔍', reference: '📎' };
  const cat = asset.customFields.category;
  const src = asset.customFields.source;
  const prompt = asset.customFields.prompt;
  const isVideo = asset.type === 'video';
  return `
    <div class="gallery-card" data-asset-index="${i}" data-asset-id="${asset.id}">
      <img class="thumb" src="${asset.thumbnailUrl}" alt="${asset.name}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="thumb-fallback" style="display:none;align-items:center;justify-content:center;width:100%;height:100%;background:var(--bg-tertiary);font-size:28px">
        ${isVideo ? '🎬' : asset.type === 'audio' ? '🎵' : asset.type === '3d-model' ? '🧊' : '🖼️'}
      </div>
      <div class="card-overlay"></div>
      ${cat ? `<span class="card-category-badge ${cat}">${categoryEmojis[cat] || ''} ${cat}</span>` : ''}
      ${src ? `<span class="card-source-dot ${src.toLowerCase()}"></span>` : ''}
      ${isVideo && asset.durationFormatted ? `<span class="duration-badge">${asset.durationFormatted}</span>` : ''}
      ${asset.chapters?.length ? `<span class="chapters-badge"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="3" rx="1" fill="currentColor" opacity="0.6"/><rect x="1" y="5" width="10" height="3" rx="1" fill="currentColor" opacity="0.6"/><rect x="1" y="9" width="6" height="2" rx="1" fill="currentColor" opacity="0.6"/></svg></span>` : ''}
      ${prompt ? `<div class="card-prompt-preview">${prompt}</div>` : ''}
      <div class="card-name">${asset.name}</div>
    </div>
  `;
}

function appendGalleryPage(container) {
  const assets = state.filteredAssets;
  const start = galleryPage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, assets.length);
  if (start >= assets.length) return;

  // Remove old sentinel if present
  const oldSentinel = container.querySelector('.gallery-sentinel');
  if (oldSentinel) oldSentinel.remove();

  // Append next batch of cards
  const frag = document.createDocumentFragment();
  const temp = document.createElement('div');
  for (let i = start; i < end; i++) {
    temp.innerHTML = makeCardHTML(assets[i], i);
    frag.appendChild(temp.firstElementChild);
  }
  container.appendChild(frag);
  galleryPage++;

  // If there are more assets, attach a sentinel for the next page
  if (end < assets.length) {
    const sentinel = document.createElement('div');
    sentinel.className = 'gallery-sentinel';
    sentinel.style.cssText = 'width:100%;height:40px;grid-column:1/-1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:12px;';
    sentinel.textContent = `Showing ${end.toLocaleString()} of ${assets.length.toLocaleString()}`;
    container.appendChild(sentinel);

    if (galleryObserver) galleryObserver.disconnect();
    galleryObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        galleryObserver.disconnect();
        galleryObserver = null;
        appendGalleryPage(container);
      }
    }, { rootMargin: '200px' });
    galleryObserver.observe(sentinel);
  }
}

// ─── Table (capped at 500 rows — filter to see more) ───
const TABLE_PAGE_SIZE = 500;

function renderTable() {
  const container = document.getElementById('tableView');
  const visibleCols = state.tableColumns.filter(c => c.visible);
  const headerCells = visibleCols.map(col => {
    const sorted = state.sortField === col.key;
    return `<th class="${sorted ? 'sorted' : ''}" data-sort-col="${col.key}">${col.label}</th>`;
  }).join('');

  const allAssets = state.filteredAssets;
  const capped = allAssets.length > TABLE_PAGE_SIZE;
  const displayAssets = capped ? allAssets.slice(0, TABLE_PAGE_SIZE) : allAssets;

  const rows = displayAssets.map((asset, i) => {
    const cells = visibleCols.map(col => {
      switch (col.key) {
        case 'name':
          return `<td><div class="table-thumb-cell">
            <div class="table-thumb-wrap">
              <img class="table-thumb" src="${asset.thumbnailUrl}" alt="" loading="lazy">
              ${asset.durationFormatted ? `<span class="table-duration">${asset.durationFormatted}</span>` : ''}
            </div>
            <span class="table-name">${asset.name}</span>
          </div></td>`;
        case 'extension': return `<td>.${asset.extension}</td>`;
        case 'type': return `<td><span class="pill ${PILL_COLORS[asset.type] || ''}">${asset.type}</span></td>`;
        case 'size': return `<td>${asset.sizeFormatted}</td>`;
        case 'resolution': return `<td>${asset.resolution.width}×${asset.resolution.height}</td>`;
        case 'dateCreated': return `<td>${new Date(asset.createdAt).toLocaleDateString()}</td>`;
        case 'dateModified': return `<td>${new Date(asset.modifiedAt).toLocaleDateString()}</td>`;
        case 'duration': return `<td>${asset.durationFormatted || '—'}</td>`;
        case 'source': return `<td><span class="pill ${PILL_COLORS[asset.customFields.source] || ''}">${asset.customFields.source}</span></td>`;
        case 'toolName': return `<td><span class="pill ${PILL_COLORS[asset.customFields.toolName] || ''}">${asset.customFields.toolName || '—'}</span></td>`;
        case 'subAgent': return `<td><span class="pill ${PILL_COLORS[asset.customFields.subAgent] || ''}">${asset.customFields.subAgent || '—'}</span></td>`;
        case 'artifactType': return `<td>${asset.customFields.artifactType || '—'}</td>`;
        case 'generationMethod': return `<td><span class="pill ${PILL_COLORS[asset.customFields.generationMethod] || ''}">${asset.customFields.generationMethod || '—'}</span></td>`;
        case 'category': return `<td><span class="pill ${PILL_COLORS[asset.customFields.category] || ''}">${asset.customFields.category || '—'}</span></td>`;
        case 'projectName': return `<td>${asset.customFields.projectName || '—'}</td>`;
        case 'prompt': return `<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${asset.customFields.prompt || '—'}</td>`;
        case 'modelId': return `<td>${asset.customFields.modelId || '—'}</td>`;
        default: return `<td>—</td>`;
      }
    }).join('');
    return `<tr data-asset-index="${i}" data-asset-id="${asset.id}">${cells}</tr>`;
  }).join('');

  const capNote = capped
    ? `<tr><td colspan="${visibleCols.length}" style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px">
        Showing first ${TABLE_PAGE_SIZE.toLocaleString()} of ${allAssets.length.toLocaleString()} assets — use search or filters to narrow results
      </td></tr>`
    : '';

  container.innerHTML = `
    <table class="data-table">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${rows}${capNote}</tbody>
    </table>
  `;
}

// ─── Kanban ───
function renderKanban() {
  const container = document.getElementById('kanbanView');
  const groupField = state.kanbanGroupBy;
  const groups = {};
  state.filteredAssets.forEach((asset, i) => {
    const val = asset.customFields[groupField] || asset[groupField] || 'Other';
    if (!groups[val]) groups[val] = [];
    groups[val].push({ asset, index: i });
  });
  const pillColors = ['pill-blue','pill-purple','pill-orange','pill-green','pill-pink','pill-teal','pill-yellow','pill-red'];

  container.innerHTML = `
    <div class="kanban-toolbar">
      <button class="toolbar-btn" id="kanbanGroupBtn">
        Group by: <strong>${CUSTOM_FIELD_DEFS.find(d => d.key === groupField)?.name || groupField}</strong>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div style="display:flex;gap:16px;overflow-x:auto;flex:1">
    ${Object.entries(groups).map(([key, items], ci) => `
      <div class="kanban-column">
        <div class="kanban-column-header">
          <div class="kanban-column-title">
            <span class="pill ${PILL_COLORS[key] || pillColors[ci % pillColors.length]}">${key}</span>
          </div>
          <span class="kanban-column-count">${items.length}</span>
        </div>
        <div class="kanban-column-body">
          ${items.map(({ asset, index }) => `
            <div class="kanban-card" data-asset-index="${index}" data-asset-id="${asset.id}">
              <img class="thumb" src="${asset.thumbnailUrl}" alt="${asset.name}" loading="lazy">
              <div class="card-info">${asset.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
    </div>
  `;

  const groupBtn = document.getElementById('kanbanGroupBtn');
  if (groupBtn) {
    groupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById('kanbanGroupByDropdown');
      const rect = groupBtn.getBoundingClientRect();
      dropdown.style.top = rect.bottom + 4 + 'px';
      dropdown.style.left = rect.left + 'px';
      dropdown.classList.toggle('hidden');
    });
  }
}

// ═══════════════════════════════════════════════════
//  VIDEO PLAYER ENGINE (simulated timeline)
// ═══════════════════════════════════════════════════

function stopVideoPlayback() {
  state.videoPlaying = false;
  if (state.videoTimerInterval) {
    clearInterval(state.videoTimerInterval);
    state.videoTimerInterval = null;
  }
}

function seekVideo(time) {
  const asset = state.filteredAssets[state.currentDetailIndex];
  if (!asset || !asset.duration) return;
  state.videoCurrentTime = Math.max(0, Math.min(time, asset.duration));
  updateVideoUI(asset);
}

function toggleVideoPlayback() {
  const asset = state.filteredAssets[state.currentDetailIndex];
  if (!asset || !asset.duration) return;

  if (state.videoPlaying) {
    stopVideoPlayback();
    updatePlayButton(false);
  } else {
    if (state.videoCurrentTime >= asset.duration) state.videoCurrentTime = 0;
    state.videoPlaying = true;
    updatePlayButton(true);
    state.videoTimerInterval = setInterval(() => {
      state.videoCurrentTime += 0.1 * state.videoSpeed;
      if (state.videoCurrentTime >= asset.duration) {
        state.videoCurrentTime = asset.duration;
        stopVideoPlayback();
        updatePlayButton(false);
      }
      updateVideoUI(asset);
    }, 100);
  }
}

function updatePlayButton(playing) {
  const btn = document.querySelector('.mc-play-btn');
  if (!btn) return;
  btn.innerHTML = playing
    ? `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="4" y="3" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="10.5" y="3" width="3.5" height="12" rx="1" fill="currentColor"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 3.5l10 5.5-10 5.5V3.5z" fill="currentColor"/></svg>`;
}

function updateVideoUI(asset) {
  const t = state.videoCurrentTime;
  const d = asset.duration;
  const pct = (t / d) * 100;

  // Update scrubber fill
  const fill = document.querySelector('.mc-scrubber-fill');
  if (fill) fill.style.width = pct + '%';

  // Update scrubber handle
  const handle = document.getElementById('mcScrubberHandle');
  if (handle) handle.style.left = pct + '%';

  // Update current time display
  const timeEls = document.querySelectorAll('.mc-time');
  if (timeEls[0]) timeEls[0].textContent = formatDuration(t);

  // Update chapter markers highlight
  if (asset.chapters?.length) {
    document.querySelectorAll('.mc-chapter-marker').forEach(marker => {
      const start = parseFloat(marker.dataset.start);
      const end = parseFloat(marker.dataset.end);
      marker.classList.toggle('active', t >= start && t < end);
    });
  }

  // Update active chapter in left panel
  if (state.leftPanel === 'chapters') {
    document.querySelectorAll('.chapter-item').forEach(item => {
      const chTime = parseFloat(item.dataset.time);
      const chEnd = parseFloat(item.dataset.endTime || '9999');
      item.classList.toggle('active-chapter', t >= chTime && t < chEnd);
    });
  }

  // Update active transcript in left panel
  if (state.leftPanel === 'transcript') {
    let activeEntry = null;
    document.querySelectorAll('.transcript-entry').forEach(entry => {
      const eTime = parseFloat(entry.dataset.time);
      entry.classList.remove('active-transcript');
      if (eTime <= t) activeEntry = entry;
    });
    if (activeEntry) {
      activeEntry.classList.add('active-transcript');
      if (state.videoPlaying) {
        activeEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
}

// ═══════════════════════════════════════════════════
//  DETAIL MODAL
// ═══════════════════════════════════════════════════

function openDetail(assetIndex) {
  stopVideoPlayback();
  state.currentDetailIndex = assetIndex;
  state.videoCurrentTime = 0;
  state.videoSpeed = 1;
  const asset = state.filteredAssets[assetIndex];
  if (!asset) return;

  const modal = document.getElementById('detailModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  state.videoDuration = asset.duration || 0;

  renderDetailContent(asset);
  updateDetailNavButtons();
}

function closeDetail() {
  stopVideoPlayback();
  document.getElementById('detailModal').classList.add('hidden');
  document.body.style.overflow = '';
  state.leftPanel = null;
}

function renderDetailContent(asset) {
  // Breadcrumbs
  const path = getBoardPath(asset.boards[0]?.id || state.currentBoardId);
  document.getElementById('detailBreadcrumbs').innerHTML = [
    ...path.map(b => `<span class="breadcrumb-item">${b.title}</span><span class="breadcrumb-separator">/</span>`),
    `<span class="breadcrumb-current">${asset.name}</span>`
  ].join('');

  // Tag pills
  const pills = [];
  if (asset.customFields.toolName) pills.push({ text: asset.customFields.toolName, color: PILL_COLORS[asset.customFields.toolName] || 'pill-blue' });
  if (asset.customFields.subAgent) pills.push({ text: asset.customFields.subAgent, color: PILL_COLORS[asset.customFields.subAgent] || 'pill-purple' });
  if (asset.customFields.artifactType) pills.push({ text: asset.customFields.artifactType, color: PILL_COLORS[asset.customFields.artifactType] || 'pill-teal' });
  document.getElementById('detailTagPills').innerHTML = pills.map(p =>
    `<span class="tag-pill ${p.color}">${p.text}</span>`
  ).join('');

  // Toggle buttons visibility
  const isVideo = asset.type === 'video';
  document.getElementById('chaptersToggleBtn').style.display = isVideo && asset.chapters?.length ? '' : 'none';
  document.getElementById('transcriptToggleBtn').style.display = isVideo && asset.transcript?.length ? '' : 'none';
  // Chat toggle — only for Lovart assets with provenance data
  document.getElementById('chatToggleBtn').style.display = asset.provenance ? '' : 'none';

  // Media viewer
  const viewer = document.getElementById('mediaViewer');
  if (isVideo) {
    const videoSrc = asset.mediaUrl || asset.higgsfield?.rawUrl || '';
    viewer.innerHTML = `<div class="video-display">
      ${videoSrc ? `<video id="videoEl" preload="metadata" poster="${asset.thumbnailUrl}" style="width:100%;height:100%;object-fit:contain"><source src="${videoSrc}" type="video/mp4"></video>` : `<img src="${asset.thumbnailUrl}" class="video-poster" alt="${asset.name}">`}
      <div class="video-play-overlay" id="videoBigPlayBtn">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.5)" stroke="white" stroke-width="2"/>
          <path d="M26 20l20 12-20 12V20z" fill="white"/>
        </svg>
      </div>
      <div class="video-time-overlay" id="videoTimeOverlay">${asset.durationFormatted || ''} · ${asset.resolution.width}×${asset.resolution.height}</div>
    </div>`;
  } else if (asset.type === 'audio') {
    // Generate waveform bars
    const barCount = 60;
    const bars = Array.from({length: barCount}, () => Math.random() * 40 + 10);
    viewer.innerHTML = `<div class="audio-display">
      <div class="audio-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M18 12v24l-6-4H6V16h6l6-4z" fill="white"/><path d="M26 16c2 2 3 4.5 3 8s-1 6-3 8" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M31 12c3.5 3 5.5 7 5.5 12s-2 9-5.5 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
      </div>
      <div class="audio-name">${asset.name}</div>
      <div class="audio-waveform" id="audioWaveform">
        ${bars.map((h, i) => `<div class="wave-bar" style="height:${h}px" data-index="${i}"></div>`).join('')}
      </div>
    </div>`;
  } else {
    const imgSrc = asset.mediaUrl || asset.higgsfield?.rawUrl || asset.thumbnailUrl;
    viewer.innerHTML = `<div class="image-container" id="imageContainer">
      <img src="${imgSrc}" alt="${asset.name}" id="zoomableImage" style="transition:transform 0.2s ease">
    </div>
    <div class="zoom-controls">
      <button id="zoomOutBtn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <input type="range" class="zoom-slider" id="zoomSlider" min="25" max="300" value="100">
      <span id="zoomLabel" style="font-size:11px;color:var(--text-tertiary);min-width:35px;text-align:center">100%</span>
      <button id="zoomInBtn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3 7h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>`;
    // Bind image zoom after next tick
    setTimeout(bindImageZoom, 0);
  }

  // Media controls
  const controls = document.getElementById('mediaControls');
  const hasPlaybackControls = isVideo || asset.type === 'audio';
  if (hasPlaybackControls) {
    // Build chapter markers for the scrubber
    let chapterMarkers = '';
    if (asset.chapters?.length) {
      const chapterColors = ['#4d9eff','#a78bfa','#34d399','#fb923c','#f472b6','#2dd4bf','#fbbf24','#ef4444','#60a5fa','#c084fc'];
      chapterMarkers = asset.chapters.map((ch, ci) => {
        const left = (ch.startTime / asset.duration) * 100;
        const width = ((ch.endTime - ch.startTime) / asset.duration) * 100;
        return `<div class="mc-chapter-marker" data-start="${ch.startTime}" data-end="${ch.endTime}" data-title="${ch.title}"
                  style="left:${left}%;width:${width}%;background:${chapterColors[ci % chapterColors.length]}" 
                  title="${ch.number}. ${ch.title}"></div>`;
      }).join('');
    }

    controls.classList.remove('no-controls');
    controls.innerHTML = `
      <button class="mc-play-btn" id="mcPlayBtn">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 3.5l10 5.5-10 5.5V3.5z" fill="currentColor"/></svg>
      </button>
      <div class="mc-volume">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 6h2l3-3v10l-3-3H3V6z" fill="currentColor"/><path d="M11 5.5c.8.8 1.2 1.6 1.2 2.5s-.4 1.7-1.2 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
      </div>
      <button class="mc-speed" id="mcSpeedBtn">1×</button>
      <div class="mc-timeline">
        <span class="mc-time">0:00</span>
        <div class="mc-scrubber" id="mcScrubber">
          <div class="mc-scrubber-fill" style="width:0%"></div>
          ${chapterMarkers}
          <div class="mc-scrubber-handle" id="mcScrubberHandle"></div>
        </div>
        <span class="mc-time">${asset.durationFormatted}</span>
      </div>
      <div class="mc-actions">
        <button class="icon-btn" title="Fullscreen">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5V3a1 1 0 011-1h2M11 2h2a1 1 0 011 1v2M14 11v2a1 1 0 01-1 1h-2M5 14H3a1 1 0 01-1-1v-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        </button>
        <button class="mc-download-btn">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v7M7 9L4.5 6.5M7 9l2.5-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10v1.5a1 1 0 001 1h8a1 1 0 001-1V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          Download
        </button>
      </div>
    `;

    // Bind video controls
    setTimeout(bindVideoControls, 0);
  } else {
    controls.classList.remove('no-controls');
    controls.innerHTML = `
      <div class="mc-actions" style="margin-left:auto">
        <button class="mc-download-btn">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v7M7 9L4.5 6.5M7 9l2.5-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10v1.5a1 1 0 001 1h8a1 1 0 001-1V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          Download
        </button>
      </div>
    `;
  }

  // Right panel
  renderRightPanel(asset);

  // Reset left panel
  state.leftPanel = null;
  document.getElementById('detailLeftPanel').classList.add('hidden');

  // Right panel collapse state
  const rp = document.getElementById('detailRightPanel');
  rp.classList.toggle('collapsed', state.rightPanelCollapsed);
}

function bindVideoControls() {
  const asset = state.filteredAssets[state.currentDetailIndex];
  if (!asset) return;

  // Play button
  document.getElementById('mcPlayBtn')?.addEventListener('click', toggleVideoPlayback);

  // Big play overlay
  document.getElementById('videoBigPlayBtn')?.addEventListener('click', () => {
    toggleVideoPlayback();
    document.getElementById('videoBigPlayBtn').style.display = 'none';
  });

  // Speed button
  document.getElementById('mcSpeedBtn')?.addEventListener('click', () => {
    const speeds = [0.5, 1, 1.5, 2];
    const idx = speeds.indexOf(state.videoSpeed);
    state.videoSpeed = speeds[(idx + 1) % speeds.length];
    document.getElementById('mcSpeedBtn').textContent = state.videoSpeed + '×';
  });

  // Scrubber click to seek
  const scrubber = document.getElementById('mcScrubber');
  if (scrubber) {
    const seekFromEvent = (e) => {
      const rect = scrubber.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seekVideo(pct * asset.duration);
    };

    scrubber.addEventListener('mousedown', (e) => {
      seekFromEvent(e);
      const onMove = (e2) => seekFromEvent(e2);
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }
}

function bindImageZoom() {
  const img = document.getElementById('zoomableImage');
  const slider = document.getElementById('zoomSlider');
  const label = document.getElementById('zoomLabel');
  const zoomIn = document.getElementById('zoomInBtn');
  const zoomOut = document.getElementById('zoomOutBtn');
  if (!img || !slider) return;

  const applyZoom = (val) => {
    slider.value = val;
    img.style.transform = `scale(${val / 100})`;
    if (label) label.textContent = val + '%';
  };

  slider.addEventListener('input', () => applyZoom(parseInt(slider.value)));
  zoomIn?.addEventListener('click', () => applyZoom(Math.min(300, parseInt(slider.value) + 25)));
  zoomOut?.addEventListener('click', () => applyZoom(Math.max(25, parseInt(slider.value) - 25)));
}

function renderRightPanel(asset) {
  const content = document.getElementById('rightPanelContent');
  const tab = state.activeRpTab || 'info';

  if (tab === 'provenance') {
    renderProvenanceTab(content, asset);
    return;
  }
  if (tab === 'comments') {
    content.innerHTML = `
      <div class="rp-section">
        <div style="padding:24px;text-align:center;color:var(--text-tertiary)">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style="margin-bottom:8px"><path d="M4 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H12l-6 5V20H6a2 2 0 01-2-2V6z" stroke="currentColor" stroke-width="1.5"/></svg>
          <div style="font-size:13px;font-weight:500;color:var(--text-secondary)">No comments yet</div>
          <div style="font-size:11px;margin-top:4px">Comments will appear here when connected to Air.inc</div>
        </div>
      </div>`;
    return;
  }

  // Default: Info tab
  const metaParts = [
    `V${asset.versions[0]?.number || 1}`,
    asset.extension.toUpperCase(),
    asset.sizeFormatted,
    `${asset.resolution.width}×${asset.resolution.height}`,
  ];
  if (asset.durationFormatted) metaParts.push(asset.durationFormatted);

  const primaryFields = ['seed', 'thumbnailUrl', 'folderIds', 'coverUrl', 'artifactId'];
  const selectFields = ['toolName', 'subAgent', 'taskType', 'artifactType'];
  const extraFields = ['modelId', 'inferenceDuration', 'orientation', 'source', 'mediaType', 'projectName', 'threadTitle', 'prompt', 'generationMethod', 'category', 'isFavourite'];
  const allFieldsToShow = state.showAllFields ? [...primaryFields, ...selectFields, ...extraFields] : [...primaryFields.slice(0, 3), ...selectFields.slice(0, 2)];

  content.innerHTML = `
    <div class="rp-asset-name">${asset.name}</div>
    <div class="rp-file-meta">${metaParts.map(p => `<span>${p}</span>`).join('')}</div>

    <div class="rp-section">
      <div class="rp-section-header" data-section="boards">
        <span>Boards</span>
        <svg class="rp-section-chevron expanded" width="12" height="12" viewBox="0 0 12 12"><path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      </div>
      <div class="rp-section-body" data-section-body="boards">
        ${asset.boards.map(b => `<div class="board-chip"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2.5" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1"/></svg>${b.title}</div>`).join('')}
        <div class="view-all-link"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2v8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>View all ${asset.boards.length} assets &amp; files</div>
        <div class="add-to-board-btn"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>Add to board</div>
      </div>
    </div>

    <div class="rp-section">
      <div class="rp-section-header" data-section="customFields">
        <span>Custom fields</span>
        <svg class="rp-section-chevron expanded" width="12" height="12" viewBox="0 0 12 12"><path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      </div>
      <div class="rp-section-body" data-section-body="customFields">
        ${allFieldsToShow.map(key => {
          const def = CUSTOM_FIELD_DEFS.find(d => d.key === key);
          const val = asset.customFields[key];
          const isUrl = key.toLowerCase().includes('url') && val;
          const isSelect = def?.type === 'select';
          let valHtml;
          if (!val) valHtml = '<span class="rp-field-value none">None</span>';
          else if (isUrl) valHtml = `<span class="rp-field-value"><a href="${val}" target="_blank">${val}</a></span>`;
          else if (isSelect) valHtml = `<span class="rp-field-value"><span class="pill ${PILL_COLORS[val] || 'pill-blue'}">${val}</span></span>`;
          else valHtml = `<span class="rp-field-value">${val}</span>`;
          return `<div class="rp-field"><div class="rp-field-label">${def?.icon || 'T¡'} ${def?.name || key}</div>${valHtml}</div>`;
        }).join('')}
        <button class="show-all-fields-btn" id="showAllFieldsBtn">${state.showAllFields ? '▴ Show fewer fields' : '▾ Show All Fields'}</button>
      </div>
    </div>

    <div class="rp-section">
      <div class="rp-section-header" data-section="customMeta"><span>Custom metadata</span><svg class="rp-section-chevron" width="12" height="12" viewBox="0 0 12 12"><path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>
      <div class="rp-section-body collapsed" data-section-body="customMeta">
        <div class="rp-field"><div class="rp-field-label">Description</div><span class="rp-field-value ${asset.description ? '' : 'none'}">${asset.description || 'No description'}</span></div>
        <div class="rp-field"><div class="rp-field-label">Tags</div><div class="smart-tags">${asset.tags.length ? asset.tags.map(t => `<span class="smart-tag">${t}</span>`).join('') : '<span class="rp-field-value none">No tags</span>'}</div></div>
      </div>
    </div>

    <div class="rp-section">
      <div class="rp-section-header" data-section="smart"><span>Smart metadata</span><svg class="rp-section-chevron expanded" width="12" height="12" viewBox="0 0 12 12"><path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>
      <div class="rp-section-body" data-section-body="smart">
        <div class="rp-field"><div class="rp-field-label">Smart Summary</div><span class="rp-field-value">${asset.smartSummary}</span></div>
        <div class="rp-field"><div class="rp-field-label">Smart Tags</div><div class="smart-tags">${asset.smartTags.map(t => `<span class="smart-tag">${t}<span class="remove-tag"><svg width="8" height="8" viewBox="0 0 8 8"><path d="M2 2l4 4M6 2l-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></span></span>`).join('')}</div></div>
      </div>
    </div>

    <div class="rp-section">
      <div class="rp-section-header" data-section="fileInfo"><span>File info</span><svg class="rp-section-chevron" width="12" height="12" viewBox="0 0 12 12"><path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>
      <div class="rp-section-body collapsed" data-section-body="fileInfo">
        <div class="file-info-grid">
          <span class="file-info-label">Date Created</span><span class="file-info-value">${new Date(asset.createdAt).toLocaleString()}</span>
          <span class="file-info-label">Date Modified</span><span class="file-info-value">${new Date(asset.modifiedAt).toLocaleString()}</span>
          <span class="file-info-label">Date Uploaded</span><span class="file-info-value">${new Date(asset.uploadedAt).toLocaleString()}</span>
          <span class="file-info-label">Uploaded by</span><span class="file-info-value">${asset.uploadedBy}</span>
          <span class="file-info-label">Upload Source</span><span class="file-info-value">API</span>
        </div>
      </div>
    </div>

    <div class="rp-section">
      <div class="rp-section-header" data-section="advanced"><span>Advanced</span><svg class="rp-section-chevron" width="12" height="12" viewBox="0 0 12 12"><path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>
      <div class="rp-section-body collapsed" data-section-body="advanced">
        <div class="advanced-field"><div class="rp-field-label">API Asset ID</div><div class="rp-field-value" style="font-family:monospace;font-size:11px">${asset.apiAssetId}</div></div>
        <div class="advanced-field"><div class="rp-field-label">API Version ID</div><div class="rp-field-value" style="font-family:monospace;font-size:11px">${asset.apiVersionId}</div></div>
      </div>
    </div>
  `;

  document.getElementById('showAllFieldsBtn')?.addEventListener('click', () => {
    state.showAllFields = !state.showAllFields;
    renderRightPanel(asset);
  });
}

// ─── Provenance Tab ───
// Mirrors the Lovart Explorer's MessageBlock.jsx context panel.
function renderProvenanceTab(container, asset) {
  const cat = asset.customFields.category || 'unknown';
  const catEmojis = { generated: '✨', researched: '🔍', reference: '📎' };
  const prov = asset.provenance;
  const hf = asset.higgsfield;
  const source = asset.customFields.source;
  let html = '';

  // Category & Source
  html += `<div class="provenance-section">
    <div class="provenance-section-title"><span class="prov-icon">🏷️</span> Classification</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <span class="category-badge ${cat}">${catEmojis[cat] || ''} ${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
      <span class="pill ${PILL_COLORS[source] || 'pill-blue'}">${source}</span>
      ${asset.customFields.generationMethod ? `<span class="gen-method-pill">${asset.customFields.generationMethod}</span>` : ''}
    </div>
  </div>`;

  // Prompt
  if (asset.customFields.prompt) {
    html += `<div class="provenance-section">
      <div class="provenance-section-title"><span class="prov-icon">💬</span> Generation Prompt</div>
      <div class="prompt-block">
        <button class="prompt-copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.querySelector('.prompt-text').textContent)">Copy</button>
        <div class="prompt-text">${asset.customFields.prompt}</div>
      </div>
    </div>`;
  }

  // Assistant Message
  if (prov?.assistantMessage) {
    html += `<div class="provenance-section">
      <div class="provenance-section-title"><span class="prov-icon">🤖</span> AI Response</div>
      <div class="assistant-msg-block">${prov.assistantMessage}</div>
    </div>`;
  }

  // Search Findings
  if (prov?.searchFindings) {
    html += `<div class="provenance-section">
      <div class="provenance-section-title"><span class="prov-icon">🔎</span> Research Findings</div>
      <div class="search-findings-block">${prov.searchFindings}</div>
    </div>`;
  }

  // Chat Position
  if (prov) {
    const pct = ((prov.chatOrder / prov.totalChatSteps) * 100).toFixed(0);
    html += `<div class="provenance-section">
      <div class="provenance-section-title"><span class="prov-icon">📨</span> Chat Context</div>
      <div class="prov-meta-row"><span class="prov-meta-label">Project</span><span class="prov-meta-value">${asset.customFields.projectName || '—'}</span></div>
      <div class="prov-meta-row"><span class="prov-meta-label">Thread</span><span class="prov-meta-value">${asset.customFields.threadTitle || '—'}</span></div>
      <div class="chat-position">
        <span>Step ${prov.chatOrder} of ${prov.totalChatSteps}</span>
        <div class="chat-position-bar"><div class="chat-position-bar-fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;
  }

  // Reference Images
  if (prov?.referenceImages?.length) {
    html += `<div class="provenance-section">
      <div class="provenance-section-title"><span class="prov-icon">🖼️</span> Reference Images</div>
      <div class="ref-images-strip">
        ${prov.referenceImages.map(ref => `<div class="ref-image-item"><img src="${ref.url}" alt="${ref.label}" loading="lazy"><div class="ref-label">${ref.label}</div></div>`).join('')}
      </div>
    </div>`;
  }

  // Related Assets
  if (prov?.relatedAssetIds?.length) {
    const relatedAssets = prov.relatedAssetIds.map(id => ALL_ASSETS.find(a => a.id === id)).filter(Boolean);
    if (relatedAssets.length) {
      html += `<div class="provenance-section">
        <div class="provenance-section-title"><span class="prov-icon">🔗</span> Related Assets</div>
        <div class="related-assets-strip">
          ${relatedAssets.map(ra => `<div class="related-asset-card" data-related-id="${ra.id}"><img src="${ra.thumbnailUrl}" alt="${ra.name}" loading="lazy"><div class="related-name">${ra.name}</div></div>`).join('')}
        </div>
      </div>`;
    }
  }

  // Tool Arguments
  if (prov?.toolArguments) {
    const argsHtml = Object.entries(prov.toolArguments).map(([k, v]) => `<span class="arg-key">${k}</span>: <span class="arg-value">"${v}"</span>`).join(', ');
    html += `<div class="provenance-section">
      <div class="provenance-section-title"><span class="prov-icon">⚙️</span> Tool Arguments</div>
      <div class="tool-args-block">{ ${argsHtml} }</div>
    </div>`;
  }

  // Higgsfield Model
  if (hf) {
    html += `<div class="provenance-section">
      <div class="provenance-section-title"><span class="prov-icon">🎬</span> Higgsfield Model</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <span class="hf-model-badge">${hf.jobSetType}</span>
        ${hf.rawUrl ? `<div class="prov-meta-row"><span class="prov-meta-label">Raw URL</span><a href="${hf.rawUrl}" target="_blank" class="prov-meta-value mono" style="color:var(--accent-blue);text-decoration:none;overflow:hidden;text-overflow:ellipsis">${hf.rawUrl.split('/').pop()}</a></div>` : ''}
      </div>
    </div>`;
  }

  // Generation Details
  html += `<div class="provenance-section">
    <div class="provenance-section-title"><span class="prov-icon">🛠️</span> Generation Details</div>
    ${asset.customFields.toolName ? `<div class="prov-meta-row"><span class="prov-meta-label">Tool</span><span class="prov-meta-value"><span class="pill ${PILL_COLORS[asset.customFields.toolName] || 'pill-blue'}">${asset.customFields.toolName}</span></span></div>` : ''}
    ${asset.customFields.subAgent ? `<div class="prov-meta-row"><span class="prov-meta-label">Sub Agent</span><span class="prov-meta-value"><span class="pill ${PILL_COLORS[asset.customFields.subAgent] || 'pill-purple'}">${asset.customFields.subAgent}</span></span></div>` : ''}
    ${asset.customFields.modelId ? `<div class="prov-meta-row"><span class="prov-meta-label">Model</span><span class="prov-meta-value mono">${asset.customFields.modelId}</span></div>` : ''}
    ${asset.customFields.seed ? `<div class="prov-meta-row"><span class="prov-meta-label">Seed</span><span class="prov-meta-value mono">${asset.customFields.seed}</span></div>` : ''}
  </div>`;

  container.innerHTML = html;

  // Bind related asset clicks
  container.querySelectorAll('.related-asset-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = state.filteredAssets.findIndex(a => a.id === card.dataset.relatedId);
      if (idx >= 0) openDetail(idx);
    });
  });
}

function renderLeftPanel(type, asset) {
  const panel = document.getElementById('detailLeftPanel');
  const title = document.getElementById('leftPanelTitle');
  const content = document.getElementById('leftPanelContent');

  if (state.leftPanel === type) {
    state.leftPanel = null;
    panel.classList.add('hidden');
    return;
  }

  state.leftPanel = type;
  panel.classList.remove('hidden');

  if (type === 'chapters') {
    title.textContent = `${asset.chapters.length} Chapters`;
    content.innerHTML = asset.chapters.map(ch => `
      <div class="chapter-item" data-time="${ch.startTime}" data-end-time="${ch.endTime}">
        <img class="chapter-thumb" src="${ch.thumbnailUrl}" alt="" loading="lazy">
        <div class="chapter-info">
          <div class="chapter-title">${ch.number}. ${ch.title}</div>
          <div class="chapter-time">${ch.startFormatted} – ${ch.endFormatted} · ${ch.durationSec} sec</div>
          <div class="chapter-desc">${ch.description}</div>
        </div>
      </div>
    `).join('');
    content.querySelectorAll('.chapter-item').forEach(item => {
      item.addEventListener('click', () => {
        seekVideo(parseFloat(item.dataset.time));
        if (!state.videoPlaying) toggleVideoPlayback();
      });
    });
  } else if (type === 'transcript') {
    title.textContent = 'Transcript';
    content.innerHTML = asset.transcript.map(entry => `
      <div class="transcript-entry" data-time="${entry.timestamp}">
        <span class="transcript-time">${entry.timestampFormatted}</span>
        <span class="transcript-text">${entry.text}</span>
      </div>
    `).join('');
    content.querySelectorAll('.transcript-entry').forEach(entry => {
      entry.addEventListener('click', () => {
        seekVideo(parseFloat(entry.dataset.time));
        if (!state.videoPlaying) toggleVideoPlayback();
      });
    });
  } else if (type === 'chat') {
    // Chat Timeline — shows Lovart chat thread for this asset
    const prov = asset.provenance;
    if (!prov) {
      title.textContent = 'Chat';
      content.innerHTML = `<div class="chat-empty"><div class="chat-empty-icon">💬</div><div class="chat-empty-text">No chat data available for Higgsfield assets</div></div>`;
      return;
    }
    title.textContent = 'Chat Timeline';
    const prompt = asset.customFields.prompt || 'Generate an asset';
    const assistantMsg = prov.assistantMessage || 'Here is your result.';
    const toolName = asset.customFields.toolName || 'generate_image';
    const cat = asset.customFields.category;
    const catEmoji = cat === 'generated' ? '✨' : cat === 'researched' ? '🔍' : '📎';

    let chatHtml = '<div class="chat-timeline">';
    // User prompt
    chatHtml += `<div class="chat-action-group"><div class="chat-action-dot"></div><div class="chat-step-label">Step ${Math.max(1, prov.chatOrder - 1)}</div>
      <div class="chat-bubble user"><div class="chat-bubble-header"><span class="chat-bubble-role user">USER</span><span class="chat-bubble-time">${asset.customFields.projectName}</span></div>${prompt}</div></div>`;
    // Research
    if (prov.searchFindings) {
      chatHtml += `<div class="chat-action-group"><div class="chat-action-dot"></div><div class="chat-step-label">Research</div>
        <div class="chat-bubble tool-call"><div class="chat-bubble-header"><span class="chat-bubble-role tool">TOOL</span><span>search_image</span></div>${prov.searchFindings.substring(0, 120)}...</div></div>`;
    }
    // Generation (active)
    chatHtml += `<div class="chat-action-group"><div class="chat-action-dot active"></div><div class="chat-step-label">Step ${prov.chatOrder} — ${catEmoji} ${cat}</div>
      <div class="chat-bubble tool-call"><div class="chat-bubble-header"><span class="chat-bubble-role tool">TOOL</span><span>${toolName}</span></div>→ Generated this asset
        <div class="chat-generated-thumbs"><img src="${asset.thumbnailUrl}" alt="${asset.name}" class="current-asset" title="Current asset">
          ${(prov.relatedAssetIds || []).slice(0, 2).map(rid => { const ra = ALL_ASSETS.find(a => a.id === rid); return ra ? `<img src="${ra.thumbnailUrl}" alt="${ra.name}" title="${ra.name}" data-related-id="${ra.id}">` : ''; }).join('')}
        </div></div></div>`;
    // Assistant response
    chatHtml += `<div class="chat-action-group"><div class="chat-action-dot"></div><div class="chat-step-label">Step ${prov.chatOrder + 1}</div>
      <div class="chat-bubble assistant"><div class="chat-bubble-header"><span class="chat-bubble-role assistant">ASSISTANT</span></div>${assistantMsg}</div></div>`;
    chatHtml += '</div>';
    content.innerHTML = chatHtml;

    // Bind related asset clicks in chat
    content.querySelectorAll('.chat-generated-thumbs img[data-related-id]').forEach(img => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = state.filteredAssets.findIndex(a => a.id === img.dataset.relatedId);
        if (idx >= 0) openDetail(idx);
      });
    });
  }
}

function updateDetailNavButtons() {
  document.getElementById('detailPrevBtn').disabled = state.currentDetailIndex <= 0;
  document.getElementById('detailNextBtn').disabled = state.currentDetailIndex >= state.filteredAssets.length - 1;
}

// ═══════════════════════════════════════════════════
//  COLUMN SETTINGS
// ═══════════════════════════════════════════════════

function renderColumnSettings() {
  const container = document.getElementById('columnToggles');
  container.innerHTML = state.tableColumns.filter(c => !c.fixed).map(col => `
    <label class="column-toggle">
      <input type="checkbox" ${col.visible ? 'checked' : ''} data-col-key="${col.key}">
      ${col.label}
    </label>
  `).join('');
}

// ═══════════════════════════════════════════════════
//  COPY HELPERS
// ═══════════════════════════════════════════════════

function copyLeftPanelContent() {
  const asset = state.filteredAssets[state.currentDetailIndex];
  if (!asset) return;
  let text = '';
  if (state.leftPanel === 'chapters' && asset.chapters) {
    text = asset.chapters.map(ch => `${ch.startFormatted} - ${ch.endFormatted}: ${ch.title}\n${ch.description}`).join('\n\n');
  } else if (state.leftPanel === 'transcript' && asset.transcript) {
    text = asset.transcript.map(e => `${e.timestampFormatted}: ${e.text}`).join('\n');
  }
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('leftPanelCopyBtn');
      if (btn) { btn.title = 'Copied!'; setTimeout(() => { btn.title = 'Copy'; }, 2000); }
    }).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════
//  EVENT BINDING
// ═══════════════════════════════════════════════════

function bindEvents() {
  // Board tree clicks
  document.getElementById('boardTree').addEventListener('click', (e) => {
    const chevron = e.target.closest('[data-toggle-board]');
    if (chevron) {
      const boardId = chevron.dataset.toggleBoard;
      if (state.expandedBoards.has(boardId)) state.expandedBoards.delete(boardId);
      else state.expandedBoards.add(boardId);
      renderSidebar();
      savePrefs();
      return;
    }
    const row = e.target.closest('.board-row');
    if (row) navigateToBoard(row.dataset.boardId);
  });

  // Favorites nav
  document.getElementById('favoritesNav')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToFavorites();
  });

  // Filter clear button
  document.getElementById('filterClearBtn')?.addEventListener('click', () => {
    state.activeFilters = {};
    filterAndRender();
  });

  // Breadcrumbs
  document.getElementById('breadcrumbs').addEventListener('click', (e) => {
    const item = e.target.closest('.breadcrumb-item');
    if (item) navigateToBoard(item.dataset.boardId);
  });

  // Search
  let searchTimeout;
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { state.searchQuery = e.target.value; filterAndRender(); }, 200);
  });

  // Search mode toggle
  document.getElementById('searchModeToggle').addEventListener('click', (e) => {
    const span = e.target.closest('span');
    if (!span) return;
    document.querySelectorAll('#searchModeToggle span').forEach(s => s.classList.remove('active'));
    span.classList.add('active');
  });

  // Sort
  document.getElementById('sortBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('sortDropdown').classList.toggle('open');
  });

  document.getElementById('sortDropdown').addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    state.sortField = item.dataset.sort;
    document.getElementById('sortLabel').textContent = item.textContent;
    document.querySelectorAll('#sortDropdown .dropdown-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('sortDropdown').classList.remove('open');
    filterAndRender();
  });

  document.getElementById('sortDirBtn').addEventListener('click', () => {
    state.sortAsc = !state.sortAsc;
    const btn = document.getElementById('sortDirBtn');
    btn.innerHTML = state.sortAsc
      ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M8 3L5 6M8 3l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M8 13l-3-3M8 13l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    filterAndRender();
  });

  // View toggle
  document.getElementById('viewToggle').addEventListener('click', (e) => {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;
    state.currentView = btn.dataset.view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCurrentView();
    savePrefs();
  });

  // Column settings
  document.getElementById('columnSettingsBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('columnSettingsDropdown');
    const rect = e.currentTarget.getBoundingClientRect();
    dropdown.style.top = rect.bottom + 4 + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
    dropdown.classList.toggle('hidden');
    renderColumnSettings();
  });

  document.getElementById('columnToggles').addEventListener('change', (e) => {
    const key = e.target.dataset.colKey;
    const col = state.tableColumns.find(c => c.key === key);
    if (col) {
      col.visible = e.target.checked;
      if (state.currentView === 'table') renderTable();
      savePrefs();
    }
  });

  // Asset clicks
  document.getElementById('contentArea').addEventListener('click', (e) => {
    const card = e.target.closest('[data-asset-index]');
    if (card && !e.target.closest('[data-sort-col]')) {
      openDetail(parseInt(card.dataset.assetIndex));
    }
  });

  // Table header sort
  document.getElementById('contentArea').addEventListener('click', (e) => {
    const th = e.target.closest('[data-sort-col]');
    if (th) {
      const col = th.dataset.sortCol;
      if (state.sortField === col) state.sortAsc = !state.sortAsc;
      else { state.sortField = col; state.sortAsc = true; }
      document.getElementById('sortLabel').textContent = state.tableColumns.find(c => c.key === col)?.label || col;
      filterAndRender();
    }
  });

  // Detail Modal
  document.getElementById('detailCloseBtn').addEventListener('click', closeDetail);
  document.getElementById('detailPrevBtn').addEventListener('click', () => {
    if (state.currentDetailIndex > 0) openDetail(state.currentDetailIndex - 1);
  });
  document.getElementById('detailNextBtn').addEventListener('click', () => {
    if (state.currentDetailIndex < state.filteredAssets.length - 1) openDetail(state.currentDetailIndex + 1);
  });

  // Left panel toggles
  document.getElementById('chaptersToggleBtn').addEventListener('click', () => {
    const asset = state.filteredAssets[state.currentDetailIndex];
    if (asset) renderLeftPanel('chapters', asset);
  });
  document.getElementById('transcriptToggleBtn').addEventListener('click', () => {
    const asset = state.filteredAssets[state.currentDetailIndex];
    if (asset) renderLeftPanel('transcript', asset);
  });
  document.getElementById('chatToggleBtn').addEventListener('click', () => {
    const asset = state.filteredAssets[state.currentDetailIndex];
    if (asset) renderLeftPanel('chat', asset);
  });
  document.getElementById('leftPanelCloseBtn').addEventListener('click', () => {
    state.leftPanel = null;
    document.getElementById('detailLeftPanel').classList.add('hidden');
  });
  document.getElementById('leftPanelCopyBtn').addEventListener('click', copyLeftPanelContent);

  // Right panel section toggles
  document.getElementById('rightPanelContent').addEventListener('click', (e) => {
    const header = e.target.closest('.rp-section-header');
    if (!header) return;
    const sectionKey = header.dataset.section;
    const body = document.querySelector(`[data-section-body="${sectionKey}"]`);
    const chevron = header.querySelector('.rp-section-chevron');
    if (body && chevron) {
      body.classList.toggle('collapsed');
      chevron.classList.toggle('expanded');
    }
  });

  // Right panel tabs — switch content based on active tab
  document.querySelectorAll('.rp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.rp-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const asset = state.filteredAssets[state.currentDetailIndex];
      if (asset) {
        state.activeRpTab = tab.dataset.rpTab;
        renderRightPanel(asset);
      }
    });
  });

  // Right panel collapse
  document.getElementById('rpCollapseBtn').addEventListener('click', () => {
    state.rightPanelCollapsed = !state.rightPanelCollapsed;
    document.getElementById('detailRightPanel').classList.toggle('collapsed', state.rightPanelCollapsed);
  });

  // Kanban group-by dropdown
  document.getElementById('kanbanGroupByDropdown').addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    state.kanbanGroupBy = item.dataset.groupby;
    document.querySelectorAll('#kanbanGroupByDropdown .dropdown-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('kanbanGroupByDropdown').classList.add('hidden');
    renderKanban();
    savePrefs();
  });

  // Sidebar collapse
  document.getElementById('sidebarCollapseBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sort-control')) document.getElementById('sortDropdown').classList.remove('open');
    if (!e.target.closest('#columnSettingsBtn') && !e.target.closest('#columnSettingsDropdown')) document.getElementById('columnSettingsDropdown').classList.add('hidden');
    if (!e.target.closest('#kanbanGroupBtn') && !e.target.closest('#kanbanGroupByDropdown')) document.getElementById('kanbanGroupByDropdown').classList.add('hidden');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const modalOpen = !document.getElementById('detailModal').classList.contains('hidden');
    if (e.key === 'Escape' && modalOpen) closeDetail();
    if (modalOpen) {
      if (e.key === 'ArrowLeft' && state.currentDetailIndex > 0) openDetail(state.currentDetailIndex - 1);
      if (e.key === 'ArrowRight' && state.currentDetailIndex < state.filteredAssets.length - 1) openDetail(state.currentDetailIndex + 1);
      if (e.key === ' ' && state.filteredAssets[state.currentDetailIndex]?.type === 'video') {
        e.preventDefault();
        toggleVideoPlayback();
      }
    }
  });
}
