/* ═══════════════════════════════════════════════════════════
   AntiGravity Agent Manager Dashboard — Logic
   ═══════════════════════════════════════════════════════════ */

// ─── COMPUTED STATS ───
function getStats() {
  let total = 0, complete = 0, partial = 0, stalled = 0, unknown = 0;
  WORKSPACES.forEach(ws => {
    if (!ws.threads) return;
    ws.threads.forEach(t => {
      total++;
      if (t.status === 'complete') complete++;
      else if (t.status === 'partial') partial++;
      else if (t.status === 'stalled') stalled++;
      else unknown++;
    });
  });
  return { total, complete, partial, stalled, unknown, workspaces: WORKSPACES.length };
}

function getWorkspaceStats(ws) {
  let complete = 0, partial = 0, stalled = 0, unknown = 0;
  if (!ws.threads) return { complete: 0, partial: 0, stalled: 0, unknown: 0, total: 0, pct: 0 };
  ws.threads.forEach(t => {
    if (t.status === 'complete') complete++;
    else if (t.status === 'partial') partial++;
    else if (t.status === 'stalled') stalled++;
    else unknown++;
  });
  const total = ws.threads.length;
  const pct = total > 0 ? Math.round(((complete + partial * 0.5) / total) * 100) : 0;
  return { complete, partial, stalled, unknown, total, pct };
}

function getOverallStatus(ws) {
  const s = getWorkspaceStats(ws);
  if (s.total === 0) return 'unknown';
  if (s.complete === s.total) return 'complete';
  if (s.stalled > 0 && s.complete === 0 && s.partial === 0) return 'stalled';
  if (s.unknown === s.total) return 'unknown';
  return 'partial';
}

// ─── STATUS LABELS ───
const STATUS_LABELS = {
  complete: '✅ Complete',
  partial: '🔶 In Progress',
  stalled: '🔴 Stalled',
  unknown: '❓ Unknown'
};

const STATUS_CLASSES = {
  complete: 'complete',
  partial: 'partial',
  stalled: 'stalled',
  unknown: 'unknown'
};

// ─── ROUTER ───
let currentView = 'dashboard';
let currentWorkspace = null;
let currentThread = null;
let searchQuery = '';
let filterStatus = 'all';

function navigate(view, wsId, threadId) {
  currentView = view;
  currentWorkspace = wsId ? WORKSPACES.find(w => w.id === wsId) : null;
  currentThread = threadId && currentWorkspace && currentWorkspace.threads
    ? currentWorkspace.threads.find(t => t.id === threadId)
    : null;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (!hash || hash === '/') return navigate('dashboard');
  const parts = hash.split('/').filter(Boolean);
  if (parts.length === 1) return navigate('workspace', parts[0]);
  if (parts.length === 2) return navigate('thread', parts[0], parts[1]);
  navigate('dashboard');
});

// ─── RENDER ENGINE ───
function render() {
  const app = document.getElementById('content');
  switch (currentView) {
    case 'dashboard': app.innerHTML = renderDashboard(); break;
    case 'workspace': app.innerHTML = renderWorkspaceDetail(); break;
    case 'thread': app.innerHTML = renderThreadDetail(); break;
    default: app.innerHTML = renderDashboard();
  }
  // Trigger animations
  requestAnimationFrame(() => {
    document.querySelectorAll('.animate-in').forEach(el => {
      el.style.opacity = '';
    });
  });
}

// ─── CANNED ACTIONS ───
function refreshData() {
  alert("I am a static HTML dashboard. To refresh my data, please ask your AI agent to update the Agent Manager Dashboard. I read from data.js!");
}

function copySummary() {
  const s = getStats();
  const txt = `Agent Manager Status:\nWorkspaces: ${s.workspaces}\nThreads: ${s.total} (${s.complete} done, ${s.partial} active, ${s.stalled} stalled)`;
  navigator.clipboard.writeText(txt).then(() => alert("Summary copied to clipboard!"));
}

// ─── DASHBOARD VIEW ───
function renderDashboard() {
  const stats = getStats();
  const filtered = WORKSPACES.filter(ws => {
    if (filterStatus === 'all') return true;
    return getOverallStatus(ws) === filterStatus;
  }).filter(ws => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return ws.name.toLowerCase().includes(q) ||
      ws.description.toLowerCase().includes(q) ||
      (ws.threads && ws.threads.some(t => t.title.toLowerCase().includes(q)));
  });

  return `
    <div class="stats-bar">
      <div class="stat-card animate-in">
        <div class="stat-icon purple">📊</div>
        <div>
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Total Threads</div>
        </div>
      </div>
      <div class="stat-card animate-in">
        <div class="stat-icon green">✅</div>
        <div>
          <div class="stat-value">${stats.complete}</div>
          <div class="stat-label">Complete</div>
        </div>
      </div>
      <div class="stat-card animate-in">
        <div class="stat-icon amber">🔶</div>
        <div>
          <div class="stat-value">${stats.partial}</div>
          <div class="stat-label">In Progress</div>
        </div>
      </div>
      <div class="stat-card animate-in">
        <div class="stat-icon red">🔴</div>
        <div>
          <div class="stat-value">${stats.stalled + stats.unknown}</div>
          <div class="stat-label">Stalled / Unknown</div>
        </div>
      </div>
      <div class="stat-card animate-in">
        <div class="stat-icon blue">📁</div>
        <div>
          <div class="stat-value">${stats.workspaces}</div>
          <div class="stat-label">Workspaces</div>
        </div>
      </div>
    </div>

    <!-- Canned Actions -->
    <div class="canned-actions animate-in">
      <button class="canned-btn" onclick="refreshData()">🔄 Refresh Data</button>
      <button class="canned-btn" onclick="copySummary()">📋 Copy Summary</button>
      <button class="canned-btn" onclick="toggleFeedbackPanel()">💬 Submit Feedback</button>
    </div>

    <div class="controls animate-in">
      <div class="search-box">
        <input type="text" placeholder="Search workspaces and threads…"
               value="${searchQuery}"
               oninput="searchQuery=this.value;render()">
      </div>
      <button class="filter-btn ${filterStatus === 'all' ? 'active' : ''}" onclick="filterStatus='all';render()">All</button>
      <button class="filter-btn ${filterStatus === 'complete' ? 'active' : ''}" onclick="filterStatus='complete';render()">✅ Done</button>
      <button class="filter-btn ${filterStatus === 'partial' ? 'active' : ''}" onclick="filterStatus='partial';render()">🔶 Active</button>
      <button class="filter-btn ${filterStatus === 'stalled' ? 'active' : ''}" onclick="filterStatus='stalled';render()">🔴 Stalled</button>
    </div>

    <div class="section-header">
      <h2 class="section-title">Workspaces</h2>
    </div>

    <div class="workspace-grid">
      ${filtered.map((ws, i) => {
    const s = getWorkspaceStats(ws);
    const overall = getOverallStatus(ws);
    return `
          <div class="workspace-card animate-in" style="--card-accent:${ws.color}"
               onclick="location.hash='#${ws.id}'">
            ${ws.thumbnail ? `
              <a href="${ws.vercel && ws.vercel.status !== 'not-deployed' ? ws.vercel.url : (ws.previewFiles && ws.previewFiles[0] ? 'file://' + ws.previewFiles[0].path : '#')}" target="_blank" class="thumbnail-link" onclick="event.stopPropagation()" title="Open Live Site">
                <div class="thumbnail-wrapper">
                  <img src="${ws.thumbnail}" class="workspace-thumbnail" alt="${ws.name}">
                  <div class="thumbnail-overlay">
                    <span class="live-btn">↗ Open Live</span>
                  </div>
                </div>
              </a>
            ` : ''}
            
            <div class="workspace-card-header">
              <div style="display:flex; align-items:center; gap:12px">
                <div class="workspace-icon">${ws.icon}</div>
                <div class="workspace-name" style="margin:0">${ws.name}</div>
              </div>
              <span class="workspace-badge badge-${STATUS_CLASSES[overall]}">${STATUS_LABELS[overall]}</span>
            </div>
            
            <div class="workspace-desc" style="margin-top:12px">${ws.description}</div>
            
            ${ws.tags ? `<div class="tech-tags">${ws.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}</div>` : ''}

            <div class="workspace-progress">
              <div class="progress-track">
                <div class="progress-fill" style="width:${s.pct}%"></div>
              </div>
              <div class="progress-label">
                <span>${s.complete}/${s.total} threads complete</span>
                <span>${s.pct}%</span>
              </div>
            </div>
            
            <div class="workspace-threads">
              ${(ws.threads || []).slice(0, 4).map(t => `
                <span class="thread-chip ${STATUS_CLASSES[t.status]}">${t.title.length > 24 ? t.title.slice(0, 22) + '…' : t.title}</span>
              `).join('')}
              ${ws.threads && ws.threads.length > 4 ? `<span class="thread-chip">+${ws.threads.length - 4} more</span>` : ''}
            </div>

            ${ws.vercel && ws.vercel.status !== 'not-deployed' ? `
               <a class="vercel-badge ${ws.vercel.status}" href="${ws.vercel.url}" target="_blank" onclick="event.stopPropagation()">
                 ▲ Vercel: ${ws.vercel.status.toUpperCase()}
               </a>
            ` : `<div class="vercel-badge not-deployed">▲ Vercel: Not Deployed</div>`}

            ${ws.previewFiles && ws.previewFiles.length > 0 ? `
            <div class="workspace-previews">
              ${ws.previewFiles.map(f => `
                <a class="ws-preview-chip" href="file://${f.path}" target="_blank" title="Open ${f.label} in Chrome" onclick="event.stopPropagation()">🔗 ${f.label}</a>
              `).join('')}
            </div>` : ''}
          </div>
        `;
  }).join('')}
    </div>
  `;
}

// ─── WORKSPACE DETAIL VIEW ───
function renderWorkspaceDetail() {
  if (!currentWorkspace) return renderDashboard();
  const ws = currentWorkspace;
  const s = getWorkspaceStats(ws);

  return `
    <nav class="breadcrumb">
      <a onclick="location.hash='#'">Dashboard</a>
      <span class="sep">›</span>
      <span class="current">${ws.name}</span>
    </nav>

    <div class="section-header" style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:16px">
        <div class="workspace-icon" style="font-size:32px;width:56px;height:56px">${ws.icon}</div>
        <div>
          <h2 class="section-title" style="font-size:26px">${ws.name}</h2>
          <p style="color:var(--text-secondary);font-size:14px;margin-top:4px; font-family: 'JetBrains Mono', monospace">
            <code>${ws.workspacePath}</code>
          </p>
        </div>
      </div>
    </div>

    ${ws.tags ? `<div class="tech-tags" style="margin-bottom:24px;">${ws.tags.map(tag => `<span class="tech-tag" style="background:var(--bg-elevated); font-size:12px; padding:4px 12px;">${tag}</span>`).join('')}</div>` : ''}

    <div class="stats-bar" style="margin-bottom:32px">
      <div class="stat-card animate-in">
        <div class="stat-icon green">✅</div>
        <div><div class="stat-value">${s.complete}</div><div class="stat-label">Complete</div></div>
      </div>
      <div class="stat-card animate-in">
        <div class="stat-icon amber">🔶</div>
        <div><div class="stat-value">${s.partial}</div><div class="stat-label">In Progress</div></div>
      </div>
      <div class="stat-card animate-in">
        <div class="stat-icon red">❓</div>
        <div><div class="stat-value">${s.stalled + s.unknown}</div><div class="stat-label">Stalled/Unknown</div></div>
      </div>
    </div>

    ${ws.previewFiles && ws.previewFiles.length > 0 ? `
    <div class="detail-section animate-in">
      <h3><span class="icon">🔗</span> Preview in Browser</h3>
      <div class="preview-links">
        ${ws.previewFiles.map(f => `
          <a class="preview-link" href="file://${f.path}" target="_blank" title="Open ${f.label} in Chrome">
            <span class="link-icon">🌐</span>
            ${f.label}
            <span class="link-arrow">→</span>
          </a>
        `).join('')}
      </div>
    </div>` : ''}

    <div class="thread-list">
      ${(ws.threads || []).map(t => `
        <div class="thread-card animate-in" onclick="location.hash='#${ws.id}/${t.id}'">
          <div class="thread-status-dot ${STATUS_CLASSES[t.status]}"></div>
          <div>
            <div class="thread-title">${t.title}</div>
            <div class="thread-meta">${STATUS_LABELS[t.status]} · ${t.tasks.length} tasks · ${t.outputs.length} outputs</div>
            <div class="thread-tags">
              <span class="tag">${t.id}</span>
              ${t.nextSteps.length > 0 ? `<span class="tag">${t.nextSteps.length} next steps</span>` : ''}
            </div>
          </div>
          <div class="thread-arrow">→</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── THREAD DETAIL VIEW ───
function renderThreadDetail() {
  if (!currentWorkspace || !currentThread) return renderDashboard();
  const ws = currentWorkspace;
  const t = currentThread;

  const tasksDone = t.tasks.filter(x => x.done === true).length;
  const tasksTotal = t.tasks.length;

  return `
    <nav class="breadcrumb">
      <a onclick="location.hash='#'">Dashboard</a>
      <span class="sep">›</span>
      <a onclick="location.hash='#${ws.id}'">${ws.name}</a>
      <span class="sep">›</span>
      <span class="current">${t.title}</span>
    </nav>

    <div class="thread-detail">
      <div class="thread-detail-header animate-in">
        <div class="thread-detail-title">${t.title}</div>
        <div class="thread-detail-status ${STATUS_CLASSES[t.status]}">
          <span class="thread-status-dot ${STATUS_CLASSES[t.status]}" style="width:10px;height:10px;margin:0"></span>
          ${STATUS_LABELS[t.status]}
        </div>
        <div class="thread-detail-id">${t.fullId}</div>
      </div>

      <!-- Intent -->
      <div class="detail-section animate-in">
        <h3><span class="icon">🎯</span> Intent</h3>
        <p style="font-size:14px;color:var(--text-secondary);line-height:1.7">${t.intent}</p>
      </div>

      <!-- Task Progress -->
      ${tasksTotal > 0 ? `
      <div class="detail-section animate-in">
        <h3><span class="icon">📋</span> Task Progress <span style="color:var(--text-muted);font-weight:400;font-size:13px;margin-left:auto">${tasksDone}/${tasksTotal}</span></h3>
        <div class="workspace-progress" style="margin-bottom:16px">
          <div class="progress-track">
            <div class="progress-fill" style="width:${tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0}%"></div>
          </div>
        </div>
        <ul class="checklist">
          ${t.tasks.map(task => {
    const cls = task.done === true ? 'done' : task.done === 'progress' ? 'progress' : 'todo';
    const icon = task.done === true ? '✓' : task.done === 'progress' ? '◔' : '○';
    return `<li><span class="check-icon ${cls}">${icon}</span> ${task.text}</li>`;
  }).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- What Worked -->
      ${t.whatWorked.length > 0 ? `
      <div class="detail-section animate-in">
        <h3><span class="icon">✅</span> What Worked</h3>
        <ul class="insights-list">
          ${t.whatWorked.map(w => `<li class="worked">${w}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Issues / What Didn't Work -->
      ${t.whatDidnt.length > 0 ? `
      <div class="detail-section animate-in">
        <h3><span class="icon">⚠️</span> Issues & Challenges</h3>
        <ul class="insights-list">
          ${t.whatDidnt.map(w => `<li class="issue">${w}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Outputs -->
      ${t.outputs.length > 0 ? `
      <div class="detail-section animate-in">
        <h3><span class="icon">📦</span> Outputs & Files</h3>
        <ul class="file-list">
          ${t.outputs.map(f => `
            <li>
              <span class="file-icon">📄</span>
              <span class="file-name">${f.name}</span>
              <span class="file-desc">${f.desc}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Next Steps -->
      ${t.nextSteps.length > 0 ? `
      <div class="detail-section animate-in">
        <h3><span class="icon">🚀</span> Next Steps</h3>
        <ul class="next-steps-list">
          ${t.nextSteps.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
  `;
}

// ─── FEEDBACK LOGIC ───
let isFeedbackOpen = false;

function toggleFeedbackPanel() {
  isFeedbackOpen = !isFeedbackOpen;
  document.getElementById('feedbackPanel').classList.toggle('active', isFeedbackOpen);
  document.getElementById('feedbackOverlay').classList.toggle('active', isFeedbackOpen);
}

async function submitFeedback() {
  const text = document.getElementById('feedbackText').value.trim();
  const cat = document.getElementById('feedbackCategory').value;

  if (!text) {
    alert("Please enter some feedback first.");
    return;
  }

  // Usually we would POST this to a local server endpoint running in the dashboard dir.
  // Since this is a static file, we will save it to localStorage and also offer a download.
  const entry = {
    timestamp: new Date().toISOString(),
    category: cat,
    text: text,
    workspaceContext: currentWorkspace ? currentWorkspace.id : 'global'
  };

  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem('ag_feedback') || '[]');
  } catch (e) { }

  existing.push(entry);
  localStorage.setItem('ag_feedback', JSON.stringify(existing));

  alert("Feedback saved locally! To sync to disk, ask your AntiGravity agent to read it, or use the download prompt.");

  // Fallback blob download
  const blob = new Blob([JSON.stringify(existing, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'feedback.json';
  a.click();

  document.getElementById('feedbackText').value = '';
  toggleFeedbackPanel();
}


// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.slice(1);
  if (!hash || hash === '/') {
    navigate('dashboard');
  } else {
    const parts = hash.split('/').filter(Boolean);
    if (parts.length === 1) navigate('workspace', parts[0]);
    else if (parts.length === 2) navigate('thread', parts[0], parts[1]);
    else navigate('dashboard');
  }
});
