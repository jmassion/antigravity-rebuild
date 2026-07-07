const projects = window.AG_PROJECTS || [];

// Category mapping for icons
const CAT_ICONS = {
    'Case Studies': 'fa-book-open',
    'Utilities': 'fa-tools',
    'Scraper': 'fa-spider',
    'FranchiseOS': 'fa-building'
};

let currentView = 'grid'; // grid, list, 3d
let activeCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initFilters();
    initViewControls();
    updateStats();
    document.getElementById('year').textContent = new Date().getFullYear();
});

function initGallery() {
    renderGrid();
}

function initFilters() {
    // Extract unique categories
    const categories = ['all', ...new Set(projects.map(p => p.category))];

    const filterContainer = document.getElementById('category-filters');
    filterContainer.innerHTML = categories.map(cat => {
        const label = cat === 'all' ? 'All' : cat;
        const active = cat === activeCategory ? 'active' : '';
        return `<button class="filter-btn ${active}" data-cat="${cat}">${label}</button>`;
    }).join('');

    // Event listeners
    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeCategory = e.target.getAttribute('data-cat');
            renderGrid();
        }
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderGrid();
    });
}

function initViewControls() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Find closest btn in case icon was clicked
            const targetBtn = e.target.closest('.view-btn');
            const view = targetBtn.getAttribute('data-view');

            if (view === '3d') {
                show3DView();
            } else {
                hide3DView();
                setViewMode(view);
            }
        });
    });

    document.getElementById('exit-3d-btn').addEventListener('click', hide3DView);
}

function setViewMode(mode) {
    currentView = mode;
    document.querySelectorAll('.view-btn:not(.spark-btn)').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-view') === mode);
    });

    const container = document.getElementById('gallery-container');
    if (mode === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }
}

function show3DView() {
    document.getElementById('three-container').classList.remove('hidden');
    document.querySelector('.spark-btn').classList.add('active');

    // Dispatch event to tell three.js to init if it hasn't or resume
    window.dispatchEvent(new CustomEvent('ag:enter-3d'));
}

function hide3DView() {
    document.getElementById('three-container').classList.add('hidden');
    document.querySelector('.spark-btn').classList.remove('active');

    window.dispatchEvent(new CustomEvent('ag:exit-3d'));
}

function updateStats() {
    const live = projects.filter(p => p.status === 'live').length;
    const total = projects.length;
    const hosted = projects.filter(p => p.vercelUrl !== '').length;

    const statsBar = document.getElementById('stats-container');
    statsBar.innerHTML = `
        <div class="stat-chip"><i class="fa-solid fa-layer-group"></i> ${total} Total Projects</div>
        <div class="stat-chip"><i class="fa-solid fa-cloud-arrow-up"></i> ${hosted} Cloud Deployed</div>
        <div class="stat-chip"><i class="fa-solid fa-circle-check" style="color: var(--success)"></i> ${live} Live Status</div>
    `;
}

function renderGrid() {
    const mainContainer = document.getElementById('gallery-container');
    const demosContainer = document.getElementById('demos-container');
    const mainTitle = document.getElementById('title-main');
    const demosTitle = document.getElementById('title-demos');

    const filtered = projects.filter(p => {
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const matchSearch = p.name.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery);
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        mainContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
                <i class="fa-solid fa-ghost" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No projects found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        demosContainer.innerHTML = '';
        mainTitle.style.display = 'none';
        demosTitle.style.display = 'none';
        return;
    }

    const mainProjects = filtered.filter(p => p.category !== 'Showcases');
    const demoProjects = filtered.filter(p => p.category === 'Showcases');

    mainTitle.style.display = mainProjects.length ? 'block' : 'none';
    demosTitle.style.display = demoProjects.length ? 'block' : 'none';

    const buildCard = (p) => {
        const iconClass = CAT_ICONS[p.category] || 'fa-cube';
        const hasVercel = p.vercelUrl && p.vercelUrl.trim() !== '';
        // Elegant image loading with fallback to fontawesome icon
        const thumbPath = `ag-assets/thumbnails/${p.id}.jpg`;
        const errorFallback = `this.outerHTML='<i class="fa-solid ${iconClass} project-icon"></i>'`;
        const thumbnailHtml = `<img src="${thumbPath}" class="project-thumbnail" alt="${p.name}" onerror="${errorFallback}">`;

        return `
            <div class="project-card">
                <span class="status-badge status-${p.status}">${p.status.replace('-', ' ')}</span>
                
                <div class="card-header" style="background: ${p.color}">
                    ${thumbnailHtml}
                </div>
                
                <div class="card-body">
                    <div class="card-info">
                        <div class="card-category">${p.category}</div>
                        <h3 class="card-title">${p.name}</h3>
                        <p class="card-desc">${p.description}</p>
                    </div>
                    
                    <div class="tech-stack">
                        ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                    
                    <div class="card-links">
                        <a href="${p.localPath}" class="card-btn btn-primary" title="Open Local Development Route">
                            <i class="fa-solid fa-house-laptop"></i> Local Node
                        </a>
                        ${hasVercel ? `
                            <a href="${p.vercelUrl}" target="_blank" class="card-btn btn-secondary" title="Open Deployed Version">
                                <i class="fa-solid fa-cloud"></i> ${p.subdomain}
                            </a>
                        ` : `
                            <button class="card-btn btn-secondary" disabled style="opacity: 0.3; cursor: not-allowed" title="Not deployed">
                                <i class="fa-solid fa-cloud"></i> Off-Grid
                            </button>
                        `}
                    </div>
                </div>
            </div >
        `;
    };

    mainContainer.innerHTML = mainProjects.map(buildCard).join('');
    demosContainer.innerHTML = demoProjects.map(buildCard).join('');
}
