/**
 * AntiGravity Vercel Deployment Manager
 * Manages project folder → Vercel project → subdomain mappings
 */

const STORAGE_KEY = 'antigravity-vercel-deployments';
const DNS_RECORD_TYPE = 'A';
const DNS_TARGET = '76.76.21.21';
const CNAME_TARGET = '76.76.21.21'; // A record IP for subdomains
const DOMAIN_SUFFIX = '.holodeckos.com';

const STATUS_FLOW = [
    { id: 'not-started', label: 'Not Started', icon: '○' },
    { id: 'vercel-created', label: 'Vercel Created', icon: '▲' },
    { id: 'domain-added', label: 'Domain Added', icon: '🌐' },
    { id: 'dns-configured', label: 'DNS Configured', icon: '🔧' },
    { id: 'live', label: '✅ Live', icon: '✅' }
];

const DEFAULT_PROJECTS = [
    {
        id: 'noahos',
        name: 'NoahOS',
        path: 'Case Studies/NoahOS',
        subdomain: 'noahos',
        vercelUrl: 'https://noahos.vercel.app',
        enabled: true,
        status: 'domain-added'
    },
    {
        id: 'media-engine',
        name: 'Media Engine',
        path: 'Utilities/Media Engine',
        subdomain: 'media-engine',
        vercelUrl: 'https://media-engine-zeta.vercel.app',
        enabled: true,
        status: 'domain-added'
    },
    {
        id: 'swiperate',
        name: 'SwipeRate',
        path: 'Utilities/SwipeRate',
        subdomain: 'swiperate',
        vercelUrl: 'https://swiperate.vercel.app',
        enabled: true,
        status: 'domain-added'
    },
    {
        id: 'dashboard',
        name: 'Agent Manager Dashboard',
        path: 'Utilities/agent-manager-dashboard',
        subdomain: 'dashboard',
        vercelUrl: 'https://agent-dashboard-ochre-eight.vercel.app',
        enabled: true,
        status: 'domain-added'
    },
    {
        id: 'mission-control',
        name: 'Mission Control Center',
        path: 'Utilities/Mission Control Center',
        subdomain: 'mission-control',
        vercelUrl: 'https://mission-control-jmassions-projects.vercel.app',
        enabled: true,
        status: 'vercel-created'
    },
    {
        id: 'garfield',
        name: 'Garfield',
        path: 'FranchiseOS/Garfield',
        subdomain: 'garfield',
        vercelUrl: 'https://garfield-ten.vercel.app',
        enabled: true,
        status: 'vercel-created'
    },
    {
        id: 'aluzina',
        name: 'Aluzina',
        path: 'Case Studies/Aluzina',
        subdomain: 'aluzina',
        vercelUrl: 'https://aluzina.vercel.app',
        enabled: true,
        status: 'vercel-created'
    },
    {
        id: 'higgsfield',
        name: 'Higgsfield Scraper',
        path: 'Scraper/Higgsfield',
        subdomain: 'higgsfield',
        vercelUrl: '',
        enabled: true,
        status: 'vercel-created'
    },
    {
        id: 'browser',
        name: 'WebBrowser',
        path: 'Utilities/WebBrowser',
        subdomain: 'browser',
        vercelUrl: '',
        enabled: true,
        status: 'not-started'
    },
    {
        id: 'lovart-explorer',
        name: 'LovArt Explorer',
        path: 'Scraper/LovArt',
        subdomain: 'lovart',
        vercelUrl: 'https://lovart-explorer-jmassions-projects.vercel.app',
        enabled: true,
        status: 'vercel-created'
    },
    {
        id: 'paperos',
        name: 'PaperOS',
        path: 'External/PaperOS',
        subdomain: 'paperos',
        vercelUrl: 'https://paperos-jmassions-projects.vercel.app',
        enabled: false,
        status: 'vercel-created'
    },
    {
        id: 'flowphone',
        name: 'FlowPhone',
        path: 'External/FlowPhone',
        subdomain: 'flowphone',
        vercelUrl: 'https://flowphone-jmassions-projects.vercel.app',
        enabled: false,
        status: 'vercel-created'
    }
];

// State
let projects = [];

// ── Persistence ──

function loadProjects() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to pick up any new projects
            const storedIds = new Set(parsed.map(p => p.id));
            const merged = [...parsed];
            DEFAULT_PROJECTS.forEach(dp => {
                if (!storedIds.has(dp.id)) merged.push({ ...dp });
            });
            return merged;
        }
    } catch (e) {
        console.warn('Failed to load state', e);
    }
    return DEFAULT_PROJECTS.map(p => ({ ...p }));
}

function saveProjects() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ── Rendering ──

function render() {
    renderStats();
    renderTable();
    renderDnsCards();
    renderSummary();
    saveProjects();
}

function renderStats() {
    const enabled = projects.filter(p => p.enabled);
    const live = enabled.filter(p => p.status === 'live');
    const inProgress = enabled.filter(p => p.status !== 'not-started' && p.status !== 'live');

    document.getElementById('stat-total').textContent = projects.length;
    document.getElementById('stat-enabled').textContent = enabled.length;
    document.getElementById('stat-live').textContent = live.length;
    document.getElementById('stat-progress').textContent = inProgress.length;
}

function renderSummary() {
    const enabled = projects.filter(p => p.enabled);
    const live = enabled.filter(p => p.status === 'live').length;
    const pending = enabled.filter(p => p.status !== 'not-started' && p.status !== 'live').length;
    const inactive = enabled.filter(p => p.status === 'not-started').length;

    document.getElementById('summary-bar').innerHTML = `
        <div class="summary-pill"><span class="dot live"></span> ${live} Live</div>
        <div class="summary-pill"><span class="dot pending"></span> ${pending} In Progress</div>
        <div class="summary-pill"><span class="dot inactive"></span> ${inactive} Not Started</div>
    `;
}

function renderTable() {
    const tbody = document.getElementById('project-tbody');
    tbody.innerHTML = projects.map((p, i) => `
        <div class="project-row ${p.enabled ? '' : 'disabled'}" data-idx="${i}">
            <div class="checkbox ${p.enabled ? 'checked' : ''}" onclick="toggleEnabled(${i})"></div>
            <div class="folder-info">
                <div class="folder-name">${escHtml(p.name)}</div>
                <div class="folder-path">${escHtml(p.path)}</div>
            </div>
            <div class="subdomain-input">
                <input class="subdomain-field" value="${escHtml(p.subdomain)}" 
                    onchange="updateSubdomain(${i}, this.value)" 
                    ${p.enabled ? '' : 'disabled'}>
                <span class="subdomain-suffix">${DOMAIN_SUFFIX}</span>
            </div>
            <div class="cname-value">
                <span class="cname-text">${CNAME_TARGET}</span>
                <button class="copy-btn" onclick="copyCname(${i}, this)">Copy</button>
            </div>
            <div>
                <span class="status-badge ${p.status}" onclick="cycleStatus(${i})"
                    title="Click to advance status">
                    ${getStatusLabel(p.status)}
                </span>
            </div>
            <div class="row-actions">
                <button class="action-btn" onclick="openVercelUrl(${i})" title="Open in Vercel">▲</button>
                <button class="action-btn danger" onclick="removeProject(${i})" title="Remove">×</button>
            </div>
        </div>
    `).join('');
}

function renderDnsCards() {
    const container = document.getElementById('dns-cards');
    const enabled = projects.filter(p => p.enabled && p.status !== 'live');

    if (enabled.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem;">No pending DNS configurations. Enable projects and advance their status to see instructions here.</p>';
        return;
    }

    container.innerHTML = enabled.map(p => `
        <div class="dns-card">
            <div class="dns-card-header">
                <span class="dns-card-title">${escHtml(p.subdomain)}${DOMAIN_SUFFIX}</span>
                <span class="status-badge ${p.status} dns-card-status">${getStatusLabel(p.status)}</span>
            </div>
            <div class="dns-record">
                <span class="dns-label">Type</span>
                <span class="dns-value">A</span>
                <span class="dns-label">Name</span>
                <span class="dns-value">${escHtml(p.subdomain)}</span>
                <span class="dns-label">Points to</span>
                <span class="dns-value">${DNS_TARGET}</span>
                <span class="dns-label">TTL</span>
                <span class="dns-value">3600</span>
            </div>
            <button class="dns-copy-all" onclick="copyDnsRecord('${escHtml(p.subdomain)}')">
                📋 Copy Record Values
            </button>
        </div>
    `).join('');
}

// ── Actions ──

function toggleEnabled(idx) {
    projects[idx].enabled = !projects[idx].enabled;
    render();
}

function updateSubdomain(idx, value) {
    projects[idx].subdomain = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    render();
}

function cycleStatus(idx) {
    const currentIdx = STATUS_FLOW.findIndex(s => s.id === projects[idx].status);
    const nextIdx = (currentIdx + 1) % STATUS_FLOW.length;
    projects[idx].status = STATUS_FLOW[nextIdx].id;
    render();
}

function getStatusLabel(statusId) {
    const status = STATUS_FLOW.find(s => s.id === statusId);
    return status ? `${status.icon} ${status.label}` : statusId;
}

function copyCname(idx, btn) {
    const text = `${projects[idx].subdomain}${DOMAIN_SUFFIX} → ${CNAME_TARGET}`;
    copyToClipboard(text, btn);
}

function copyDnsRecord(subdomain) {
    const text = `Type: A\nName: ${subdomain}\nPoints to: ${DNS_TARGET}\nTTL: 3600`;
    copyToClipboard(text);
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
        if (btn) {
            btn.textContent = '✓';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'Copy';
                btn.classList.remove('copied');
            }, 1500);
        }
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied to clipboard!');
    });
}

function openVercelUrl(idx) {
    const p = projects[idx];
    const url = p.vercelUrl || `https://vercel.com/dashboard`;
    window.open(url, '_blank');
}

function removeProject(idx) {
    if (confirm(`Remove "${projects[idx].name}" from the deployment list?`)) {
        projects.splice(idx, 1);
        render();
    }
}

function addProject() {
    const name = prompt('Project name:');
    if (!name) return;
    const path = prompt('Folder path (relative to AntiGravity):');
    if (!path) return;
    const subdomain = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

    projects.push({
        id: `custom-${Date.now()}`,
        name,
        path,
        subdomain,
        enabled: true,
        status: 'not-started'
    });
    render();
}

function resetDefaults() {
    if (confirm('Reset all projects to defaults? This will lose custom changes.')) {
        localStorage.removeItem(STORAGE_KEY);
        projects = DEFAULT_PROJECTS.map(p => ({ ...p }));
        render();
    }
}

function exportConfig() {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vercel-deployments.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Config exported!');
}

// ── Helpers ──

function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ── Init ──

document.addEventListener('DOMContentLoaded', () => {
    projects = loadProjects();
    render();
});
