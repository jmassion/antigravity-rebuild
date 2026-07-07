/* ═══════════════════════════════════════════
   TabSpace Client — Smart Adaptive Rendering
   Auto-connects, interactive iframes, adaptive
   CDP viewport (screenshot ↔ live), many view modes
   ═══════════════════════════════════════════ */

let ws = null;
let lastState = null;
let controlCaps = new Map();
let currentView = "grid"; // grid | fullheight | carousel | sitemap | mosaic | focus | stack | cinema
let minimizedSurfaces = new Set();
let maximizedSurface = null;
let focusSurface = null; // For focus view

// ─── Per-surface render state tracking (CDP only) ───
const surfaceRenderState = new Map(); // surfaceId → { mode, snapshotSrc, hoverTimer }

const el = {
  server: document.getElementById("server"),
  room: document.getElementById("room"),
  user: document.getElementById("user"),
  connBadge: document.getElementById("conn-badge"),
  connLabel: document.getElementById("conn-label"),
  roomName: document.getElementById("room-name"),
  userLabel: document.getElementById("user-label"),
  epochBadge: document.getElementById("epoch-badge"),
  revokeAll: document.getElementById("revoke-all"),
  addBrowser: document.getElementById("add-browser"),
  addModal: document.getElementById("add-modal"),
  addUrl: document.getElementById("add-url"),
  addTitle: document.getElementById("add-title"),
  modalClose: document.getElementById("modal-close"),
  modalCancel: document.getElementById("modal-cancel"),
  modalConfirm: document.getElementById("modal-confirm"),
  hostMetrics: document.getElementById("host-metrics"),
  metricsGrid: document.getElementById("metrics-grid"),
  metricsCount: document.getElementById("metrics-count"),
  surfacesEmpty: document.getElementById("surfaces-empty"),
  surfaces: document.getElementById("surfaces"),
  spatial3d: document.getElementById("spatial3d-container"),
  toasts: document.getElementById("toasts"),
  addSessionMode: document.getElementById("add-session-mode"),
};

// ─── Toast ───
function toast(message, type = "info") {
  const icons = { success: "✓", error: "✗", info: "ℹ" };
  const div = document.createElement("div");
  div.className = `toast toast-${type}`;
  div.innerHTML = `<span class="toast-icon">${icons[type] || "ℹ"}</span><span>${esc(message)}</span>`;
  el.toasts.appendChild(div);
  setTimeout(() => div.remove(), 3800);
}

function setConn(online) {
  el.connBadge.className = "conn-badge " + (online ? "online" : "offline");
  el.connLabel.textContent = online ? "Connected" : "Offline";
}

function send(msg) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify(msg));
}

// ─── Auto-connect on page load ───
window.addEventListener("DOMContentLoaded", () => {
  el.roomName.textContent = el.room.value;
  el.userLabel.textContent = el.user.value;
  el.revokeAll.onclick = () => {
    send({ type: "REVOKE_ALL", roomId: el.room.value });
    controlCaps.clear();
    toast("Revoked all caps — epoch bumped", "info");
  };

  el.addBrowser.onclick = () => {
    el.addUrl.value = "";
    el.addTitle.value = "";
    if (el.addSessionMode) el.addSessionMode.value = "SHARED";
    el.addModal.style.display = "flex";
    el.addUrl.focus();
  };
  el.modalClose.onclick = () => el.addModal.style.display = "none";
  el.modalCancel.onclick = () => el.addModal.style.display = "none";
  el.addModal.onclick = (e) => { if (e.target === el.addModal) el.addModal.style.display = "none"; };
  el.modalConfirm.onclick = () => {
    let url = el.addUrl.value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    const title = el.addTitle.value.trim() || "";
    const sessionMode = el.addSessionMode ? el.addSessionMode.value : "SHARED";
    send({ type: "REQUEST_ADD_SURFACE", roomId: el.room.value, url, title, sessionMode });
    el.addModal.style.display = "none";
    toast(`Adding browser: ${new URL(url).hostname} (${sessionMode})`, "success");
  };
  el.addUrl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); el.modalConfirm.click(); }
    if (e.key === "Escape") el.addModal.style.display = "none";
  });

  connect();
});

function connect() {
  const serverUrl = el.server.value;
  ws = new WebSocket(serverUrl);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    setConn(true);
    const userId = el.user.value;
    send({ type: "HELLO", role: "client", userId, displayName: userId });
    send({ type: "JOIN_ROOM", roomId: el.room.value });
    toast("Connected & joined room", "success");
  };

  ws.onclose = () => {
    setConn(false);
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    toast("Connection failed — retrying…", "error");
  };

  ws.onmessage = (ev) => {
    // Binary frame from CDP host
    if (ev.data instanceof ArrayBuffer) {
      handleBinaryFrame(ev.data);
      return;
    }
    try { onMsg(JSON.parse(ev.data)); } catch (e) { console.error("Parse error:", e); }
  };
}

// ─── Binary Frame Handler (CDP screencast) ───
function handleBinaryFrame(buffer) {
  const headerBytes = new Uint8Array(buffer, 0, 32);
  const surfaceId = new TextDecoder().decode(headerBytes).replace(/\0/g, "").trim();
  const jpegData = buffer.slice(32);

  const canvas = document.getElementById(`cdp-canvas-${surfaceId}`);
  if (!canvas) return;

  const blob = new Blob([jpegData], { type: "image/jpeg" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    // Show frame count badge
    const badge = canvas.parentNode?.querySelector(".cdp-badge");
    if (badge) {
      const count = parseInt(badge.dataset.frames || "0") + 1;
      badge.dataset.frames = count;
      badge.textContent = `🟢 CDP LIVE · ${count} frames`;
      badge.style.display = "inline";
    }

    // Update render mode badge to live
    const renderBadge = canvas.parentNode?.querySelector(".render-mode-badge");
    if (renderBadge && renderBadge.dataset.mode !== "live") {
      setRenderModeBadge(renderBadge, "live");
    }

    // Make canvas visible when receiving frames
    if (!canvas.classList.contains("cdp-canvas-visible")) {
      canvas.classList.add("cdp-canvas-visible");
    }
  };
  img.src = url;
}

// ─── Render Mode Badge Updater ───
function setRenderModeBadge(badge, mode) {
  badge.dataset.mode = mode;
  if (mode === "live") {
    badge.textContent = "🔴 LIVE";
    badge.className = "render-mode-badge render-mode-live";
  } else {
    badge.textContent = "📸 SNAPSHOT";
    badge.className = "render-mode-badge render-mode-snapshot";
  }
}

// ─── Message handler ───
function onMsg(msg) {
  if (msg.type === "ROOM_STATE") {
    lastState = msg.state;
    if (lastState.roomEpoch) {
      el.epochBadge.textContent = `epoch ${lastState.roomEpoch}`;
      el.epochBadge.style.display = "inline";
    }
    renderHostMetrics(lastState.hostMetrics || []);
    renderSurfaces(lastState.surfaces || []);
  }

  if (msg.type === "CONTROL_GRANTED") {
    controlCaps.set(msg.surfaceId, msg.cap);
  }

  if (msg.type === "CONTROL_DENIED") {
    toast(`Control denied: ${msg.reason}`, "error");
  }

  // ─── Smart Rendering: Snapshot received (CDP only) ───
  if (msg.type === "SURFACE_SNAPSHOT") {
    handleSnapshotReceived(msg.surfaceId, msg.snapshot);
  }

  // ─── Smart Rendering: Render mode changed (CDP only) ───
  if (msg.type === "RENDER_MODE_CHANGE") {
    handleRenderModeChange(msg.surfaceId, msg.renderMode);
  }

  if (msg.type === "ERROR") {
    if (msg.message !== "no_lock") {
      toast(`Error: ${msg.message}`, "error");
    }
  }
}

// ─── Smart Rendering: Handle snapshot image (CDP only) ───
function handleSnapshotReceived(surfaceId, snapshotB64) {
  const snapshotImg = document.getElementById(`snapshot-img-${surfaceId}`);
  if (snapshotImg) {
    snapshotImg.src = `data:image/jpeg;base64,${snapshotB64}`;
    snapshotImg.classList.add("snapshot-visible");
  }

  const canvas = document.getElementById(`cdp-canvas-${surfaceId}`);
  if (canvas) {
    canvas.classList.remove("cdp-canvas-visible");
  }

  let state = surfaceRenderState.get(surfaceId);
  if (!state) {
    state = { mode: "snapshot", snapshotSrc: null, hoverTimer: null };
    surfaceRenderState.set(surfaceId, state);
  }
  state.mode = "snapshot";
  state.snapshotSrc = `data:image/jpeg;base64,${snapshotB64}`;

  const badge = document.querySelector(`#viewport-${surfaceId} .render-mode-badge`);
  if (badge) setRenderModeBadge(badge, "snapshot");
}

// ─── Smart Rendering: Handle mode change (CDP only) ───
function handleRenderModeChange(surfaceId, renderMode) {
  let state = surfaceRenderState.get(surfaceId);
  if (!state) {
    state = { mode: renderMode, snapshotSrc: null, hoverTimer: null };
    surfaceRenderState.set(surfaceId, state);
  }
  state.mode = renderMode;

  const canvas = document.getElementById(`cdp-canvas-${surfaceId}`);
  const snapshotImg = document.getElementById(`snapshot-img-${surfaceId}`);
  const badge = document.querySelector(`#viewport-${surfaceId} .render-mode-badge`);

  if (renderMode === "live") {
    if (canvas) canvas.classList.add("cdp-canvas-visible");
    if (badge) setRenderModeBadge(badge, "live");
  } else {
    if (canvas) canvas.classList.remove("cdp-canvas-visible");
    if (snapshotImg && state.snapshotSrc) {
      snapshotImg.src = state.snapshotSrc;
      snapshotImg.classList.add("snapshot-visible");
    }
    if (badge) setRenderModeBadge(badge, "snapshot");
  }
}

// ─── Surface rendering ───
function renderSurfaces(surfaces) {
  if (surfaces.length === 0) {
    el.surfacesEmpty.style.display = "flex";
    el.surfaces.innerHTML = "";
    return;
  }

  el.surfacesEmpty.style.display = "none";

  // Only re-render if surfaces changed (avoid iframe flicker)
  const currentIds = Array.from(el.surfaces.querySelectorAll(".surface-card")).map(c => c.dataset.surface);
  const newIds = surfaces.map(s => s.surfaceId);
  const isSame = currentIds.length === newIds.length && currentIds.every((id, i) => id === newIds[i]);

  if (isSame) return;

  // Set focus surface to first if not set
  if (!focusSurface && surfaces.length > 0) focusSurface = surfaces[0].surfaceId;

  el.surfaces.innerHTML = surfaces.map(s => {
    const visTag = (s.policy?.visibility || "PUBLIC").toLowerCase();
    const visLabel = s.policy?.visibility || "PUBLIC";
    const isFocused = focusSurface === s.surfaceId;

    // ─── Viewport content ───
    // ALWAYS render an iframe first so the website is visible and interactive.
    // If CDP streaming is active, add canvas + snapshot layers ON TOP.
    // The canvas only becomes visible when actual frames arrive from the host.
    let viewportContent;
    if (s.url) {
      // Base layer: always an interactive iframe
      const iframeHtml = `<iframe src="${esc(s.url)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="${esc(s.title)}" class="viewport-iframe"></iframe>`;

      if (s.cdpStreaming) {
        // CDP overlay layers: snapshot + canvas sit on top of the iframe.
        // Canvas starts HIDDEN (no cdp-canvas-visible) — only shows when frames arrive.
        const renderMode = s.renderMode || "live";
        if (!surfaceRenderState.has(s.surfaceId)) {
          surfaceRenderState.set(s.surfaceId, { mode: renderMode, snapshotSrc: null, hoverTimer: null, hasFrames: false });
        }
        viewportContent = `
          ${iframeHtml}
          <img id="snapshot-img-${s.surfaceId}" class="snapshot-layer" src="" alt="" />
          <canvas id="cdp-canvas-${s.surfaceId}" class="cdp-canvas" data-surface="${s.surfaceId}"></canvas>
          <span class="render-mode-badge render-mode-live" data-mode="live">🔴 LIVE</span>
          <span class="cdp-badge" style="display:none;" data-frames="0"></span>`;
      } else {
        viewportContent = iframeHtml;
      }
    } else {
      viewportContent = `<div class="card-viewport-fallback"><div class="fallback-icon">🌐</div><div class="fallback-msg">Enter a URL above</div></div>`;
    }

    return `
      <div class="surface-card ${isFocused ? 'focus-primary' : ''}" data-surface="${s.surfaceId}">
        <div class="card-titlebar">
          <div class="card-dots">
            <span class="dot dot-close" data-dot-action="close" data-dot-id="${s.surfaceId}" title="Close"></span>
            <span class="dot dot-min" data-dot-action="minimize" data-dot-id="${s.surfaceId}" title="Minimize"></span>
            <span class="dot dot-max" data-dot-action="maximize" data-dot-id="${s.surfaceId}" title="Maximize"></span>
          </div>
          ${s.favicon ? `<img class="card-favicon" src="${esc(s.favicon)}" alt="" onerror="this.style.display='none'" />` : ""}
          <div class="card-title">${esc(s.title || s.surfaceId)}</div>
          <button class="focus-btn" data-focus="${s.surfaceId}" title="Focus this surface">◎</button>
        </div>
        <div class="card-urlbar">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 2a10 10 0 0 1 0 12M8 2a10 10 0 0 0 0 12M2 8h12" stroke="currentColor" stroke-width="1"/></svg>
          <input class="card-url-input" type="text" value="${esc(s.url || "")}" data-id="${s.surfaceId}" spellcheck="false" />
          <button class="card-url-go" data-nav="${s.surfaceId}" title="Navigate">↵</button>
        </div>
        <div class="card-viewport" id="viewport-${s.surfaceId}">
          ${viewportContent}
        </div>
        <div class="card-tags">
          <span class="tag tag-${visTag}">${esc(visLabel)}</span>
          <span class="tag tag-ctrl-open">⚡ OPEN CONTROL</span>
          ${s.egressPolicy?.region ? `<span class="tag tag-egress">🌐 ${esc(s.egressPolicy.region)}${s.egressPolicy.rotation ? " · " + esc(s.egressPolicy.rotation) : ""}</span>` : ""}
          ${s.containerId ? `<span class="tag tag-container">📦 ${esc(s.containerId)}</span>` : ""}
          ${s.sessionMode ? `<span class="tag tag-session tag-session-${(s.sessionMode || 'SHARED').toLowerCase()}">${s.sessionMode === 'PER_USER' ? '👤' : s.sessionMode === 'SEPARATE_ACCOUNT' ? '🔐' : '👁'} ${esc(s.sessionMode)}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");

  // Wire URL bar navigation
  el.surfaces.querySelectorAll(".card-url-go").forEach(btn => {
    btn.onclick = () => navigateSurface(btn.dataset.nav);
  });

  el.surfaces.querySelectorAll(".card-url-input").forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        navigateSurface(input.dataset.id);
      }
    });
    input.addEventListener("focus", () => {
      const card = input.closest(".surface-card");
      if (card) card.classList.add("active");
    });
    input.addEventListener("blur", () => {
      const card = input.closest(".surface-card");
      if (card) card.classList.remove("active");
    });
  });

  // Auto-request control for all surfaces (demo mode)
  surfaces.forEach(s => {
    if (!controlCaps.has(s.surfaceId)) {
      send({ type: "REQUEST_CONTROL", roomId: el.room.value, surfaceId: s.surfaceId });
    }
  });

  // Wire window dots
  el.surfaces.querySelectorAll(".dot").forEach(dot => {
    dot.onclick = (e) => {
      e.stopPropagation();
      const action = dot.dataset.dotAction;
      const sid = dot.dataset.dotId;
      const card = dot.closest(".surface-card");
      if (action === "close") {
        send({ type: "REQUEST_DESTROY_SURFACE", roomId: el.room.value, surfaceId: sid });
        toast("Closed browser", "info");
      } else if (action === "minimize") {
        if (minimizedSurfaces.has(sid)) {
          minimizedSurfaces.delete(sid);
          card.classList.remove("minimized");
        } else {
          minimizedSurfaces.add(sid);
          card.classList.add("minimized");
          if (maximizedSurface === sid) { maximizedSurface = null; card.classList.remove("maximized"); }
        }
      } else if (action === "maximize") {
        if (maximizedSurface === sid) {
          maximizedSurface = null;
          card.classList.remove("maximized");
        } else {
          if (maximizedSurface) {
            const prev = el.surfaces.querySelector(`[data-surface="${maximizedSurface}"]`);
            if (prev) prev.classList.remove("maximized");
          }
          maximizedSurface = sid;
          card.classList.add("maximized");
          card.classList.remove("minimized");
          minimizedSurfaces.delete(sid);
        }
      }
    };
  });

  // Wire focus buttons
  el.surfaces.querySelectorAll(".focus-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      focusSurface = btn.dataset.focus;
      if (currentView === "focus" || currentView === "cinema") {
        // Re-render to update focus classes
        const allCards = el.surfaces.querySelectorAll(".surface-card");
        allCards.forEach(card => {
          card.classList.toggle("focus-primary", card.dataset.surface === focusSurface);
        });
      }
      toast(`Focused: ${btn.dataset.focus}`, "info");
    };
  });

  // Restore states
  minimizedSurfaces.forEach(sid => {
    const card = el.surfaces.querySelector(`[data-surface="${sid}"]`);
    if (card) card.classList.add("minimized");
  });
  if (maximizedSurface) {
    const card = el.surfaces.querySelector(`[data-surface="${maximizedSurface}"]`);
    if (card) card.classList.add("maximized");
  }

  // Wire CDP canvas input + hover-to-resume (only for CDP surfaces)
  el.surfaces.querySelectorAll(".cdp-canvas").forEach(canvas => {
    const sid = canvas.dataset.surface;

    // Hover-to-resume: mouseenter triggers live mode for snapshot surfaces
    const viewport = canvas.closest(".card-viewport");
    if (viewport) {
      viewport.addEventListener("mouseenter", () => {
        const state = surfaceRenderState.get(sid);
        if (state && state.mode === "snapshot") {
          send({ type: "RESUME_STREAMING", roomId: el.room.value, surfaceId: sid });
        }
      });
    }

    function toViewport(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = 1280 / rect.width;
      const scaleY = 800 / rect.height;
      return { x: Math.round((e.clientX - rect.left) * scaleX), y: Math.round((e.clientY - rect.top) * scaleY) };
    }

    canvas.addEventListener("click", (e) => {
      const { x, y } = toViewport(e);
      send({ type: "SEND_INPUT", roomId: el.room.value, surfaceId: sid, input: { type: "click", x, y }, cap: controlCaps.get(sid) || null });
    });

    canvas.addEventListener("mousemove", (e) => {
      if (canvas._lastMove && Date.now() - canvas._lastMove < 100) return;
      canvas._lastMove = Date.now();
      const { x, y } = toViewport(e);
      send({ type: "SEND_INPUT", roomId: el.room.value, surfaceId: sid, input: { type: "mousemove", x, y }, cap: controlCaps.get(sid) || null });
    });

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const { x, y } = toViewport(e);
      send({ type: "SEND_INPUT", roomId: el.room.value, surfaceId: sid, input: { type: "wheel", x, y, deltaX: e.deltaX, deltaY: e.deltaY }, cap: controlCaps.get(sid) || null });
    }, { passive: false });

    canvas.tabIndex = 0;
    canvas.addEventListener("keydown", (e) => {
      send({ type: "SEND_INPUT", roomId: el.room.value, surfaceId: sid, input: { type: "keydown", key: e.key, code: e.code, text: e.key.length === 1 ? e.key : "" }, cap: controlCaps.get(sid) || null });
    });
    canvas.addEventListener("keyup", (e) => {
      send({ type: "SEND_INPUT", roomId: el.room.value, surfaceId: sid, input: { type: "keyup", key: e.key, code: e.code }, cap: controlCaps.get(sid) || null });
    });
  });
}

function navigateSurface(surfaceId) {
  const input = el.surfaces.querySelector(`.card-url-input[data-id="${surfaceId}"]`);
  const viewport = document.getElementById(`viewport-${surfaceId}`);
  if (!input || !viewport) return;

  let url = input.value.trim();
  if (!url) return;

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
    input.value = url;
  }

  viewport.innerHTML = `<iframe src="${esc(url)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  let hostname;
  try { hostname = new URL(url).hostname; } catch { hostname = url; }
  toast(`Navigated to ${hostname}`, "info");

  const card = el.surfaces.querySelector(`.surface-card:has([data-id="${surfaceId}"])`);
  if (card) {
    const titleEl = card.querySelector(".card-title");
    if (titleEl) titleEl.textContent = hostname;
  }
}

// ─── Utils ───
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ─── Host Metrics ───
function renderHostMetrics(metrics) {
  if (!metrics || metrics.length === 0) {
    el.hostMetrics.style.display = "none";
    return;
  }
  el.hostMetrics.style.display = "block";
  el.metricsCount.textContent = `(${metrics.length} host${metrics.length > 1 ? "s" : ""})`;

  el.metricsGrid.innerHTML = metrics.map(h => {
    const m = h.metrics || {};
    const cpuPct = m.cpuLoadPct || 0;
    const memPct = m.memTotalMB ? Math.round((m.memUsedMB / m.memTotalMB) * 100) : 0;
    const cpuColor = cpuPct > 80 ? "var(--red)" : cpuPct > 50 ? "var(--yellow)" : "var(--green)";
    const memColor = memPct > 85 ? "var(--red)" : memPct > 60 ? "var(--yellow)" : "var(--green)";
    const liveCount = m.liveStreaming ?? "—";
    const snapCount = m.snapshotted ?? "—";
    return `
      <div class="metric-card">
        <div class="metric-host-name">${esc(h.hostId)}</div>
        <div class="metric-row">
          <span class="metric-label">CPU</span>
          <div class="metric-bar"><div class="metric-bar-fill" style="width:${cpuPct}%;background:${cpuColor}"></div></div>
          <span class="metric-value" style="color:${cpuColor}">${cpuPct}%</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">MEM</span>
          <div class="metric-bar"><div class="metric-bar-fill" style="width:${memPct}%;background:${memColor}"></div></div>
          <span class="metric-value" style="color:${memColor}">${m.memUsedMB || 0}/${m.memTotalMB || 0} MB</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">RSS</span>
          <span class="metric-value">${m.rssApproxMB || 0} MB</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Surfaces</span>
          <span class="metric-value">${m.surfaces || 0}</span>
        </div>
        <div class="metric-row metric-row-render">
          <span class="metric-label">Render</span>
          <span class="metric-value"><span class="metric-live-dot">●</span> ${liveCount} live <span class="metric-snap-dot">●</span> ${snapCount} snap</span>
        </div>
      </div>
    `;
  }).join("");
}

// ═══════════════════════════════════════════
// VIEW MODES — 8 ways to see your surfaces
// ═══════════════════════════════════════════

function setViewMode(mode) {
  currentView = mode;
  el.surfaces.className = `surfaces-${mode}`;
  document.querySelectorAll(".view-btn").forEach(b => {
    b.classList.toggle("view-btn-active", b.dataset.view === mode);
  });

  // Sitemap needs special canvas rendering
  if (mode === "sitemap" && lastState?.surfaces) {
    renderSitemap(lastState.surfaces);
  } else {
    const sitemapCanvas = document.getElementById("sitemap-canvas");
    if (sitemapCanvas) sitemapCanvas.style.display = "none";
  }

  // 3D Spatial view
  if (mode === "spatial3d") {
    el.surfaces.style.display = "none";
    el.spatial3d.style.display = "block";
    if (lastState?.surfaces) renderSpatial3D(lastState.surfaces);
  } else {
    el.surfaces.style.display = "";
    el.spatial3d.style.display = "none";
    if (spatial3dState.renderer) spatial3dState.running = false;
  }

  // Focus/cinema: ensure focus-primary class is set
  if ((mode === "focus" || mode === "cinema") && lastState?.surfaces) {
    if (!focusSurface && lastState.surfaces.length > 0) {
      focusSurface = lastState.surfaces[0].surfaceId;
    }
    const allCards = el.surfaces.querySelectorAll(".surface-card");
    allCards.forEach(card => {
      card.classList.toggle("focus-primary", card.dataset.surface === focusSurface);
    });
  }

  toast(`View: ${mode}`, "info");
}

// ─── Sitemap View ───
function renderSitemap(surfaces) {
  let canvas = document.getElementById("sitemap-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "sitemap-canvas";
    canvas.className = "sitemap-canvas";
    el.surfaces.parentNode.insertBefore(canvas, el.surfaces);
  }
  canvas.style.display = "block";
  const rect = canvas.parentNode.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = Math.max(500, rect.height - 60);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (surfaces.length === 0) return;

  const padding = 40;
  const nodeW = 180;
  const nodeH = 80;
  const cols = Math.ceil(Math.sqrt(surfaces.length));
  const spacingX = (canvas.width - padding * 2) / Math.max(cols, 1);
  const spacingY = 140;

  const nodes = surfaces.map((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: padding + col * spacingX + spacingX / 2,
      y: padding + 30 + row * spacingY + spacingY / 2,
      surface: s
    };
  });

  // Draw wires
  ctx.strokeStyle = "rgba(108, 92, 231, 0.3)";
  ctx.lineWidth = 2;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].surface.containerId === nodes[j].surface.containerId) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        const midY = (nodes[i].y + nodes[j].y) / 2;
        ctx.bezierCurveTo(nodes[i].x, midY, nodes[j].x, midY, nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  ctx.font = "10px Inter, sans-serif";
  ctx.fillStyle = "rgba(108, 92, 231, 0.5)";

  nodes.forEach(n => {
    const s = n.surface;
    ctx.fillStyle = "rgba(16, 22, 36, 0.9)";
    ctx.strokeStyle = "rgba(108, 92, 231, 0.4)";
    ctx.lineWidth = 1.5;
    const rx = nodeW / 2, ry = nodeH / 2;
    roundRect(ctx, n.x - rx, n.y - ry, nodeW, nodeH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e2ecff";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.textAlign = "center";
    const title = (s.title || s.surfaceId).length > 22 ? (s.title || s.surfaceId).slice(0, 20) + "…" : (s.title || s.surfaceId);
    ctx.fillText(title, n.x, n.y - 8);

    ctx.fillStyle = "rgba(207, 220, 240, 0.5)";
    ctx.font = "10px 'SF Mono', monospace";
    let urlLabel = "";
    try { urlLabel = new URL(s.url || "").hostname; } catch { urlLabel = s.url || ""; }
    if (urlLabel.length > 26) urlLabel = urlLabel.slice(0, 24) + "…";
    ctx.fillText(urlLabel, n.x, n.y + 8);

    if (s.containerId) {
      ctx.fillStyle = "rgba(108, 92, 231, 0.15)";
      const badge = s.containerId;
      const bw = ctx.measureText(badge).width + 12;
      ctx.fillRect(n.x - bw / 2, n.y + 16, bw, 16);
      ctx.fillStyle = "rgba(162, 155, 254, 0.8)";
      ctx.font = "9px Inter, sans-serif";
      ctx.fillText(badge, n.x, n.y + 28);
    }

    ctx.beginPath();
    ctx.arc(n.x - rx + 12, n.y - ry + 12, 4, 0, Math.PI * 2);
    ctx.fillStyle = s.renderMode === "snapshot" ? "#FECA57" : "#00B894";
    ctx.fill();
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ═══════════════════════════════════════════
// THREE.JS 3D SPATIAL VIEW
// ═══════════════════════════════════════════

const spatial3dState = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  running: false,
  meshes: new Map(), // surfaceId → mesh
  textures: new Map(), // surfaceId → canvas texture
};

function renderSpatial3D(surfaces) {
  if (typeof THREE === "undefined") {
    toast("Three.js not loaded — check network", "error");
    return;
  }

  const container = el.spatial3d;
  const width = container.clientWidth || 1200;
  const height = container.clientHeight || 700;

  // Initialize scene if needed
  if (!spatial3dState.scene) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.04);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.minDistance = 2;
    controls.maxDistance = 20;

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Accent point lights (neon glow)
    const purpleLight = new THREE.PointLight(0x6C5CE7, 0.5, 15);
    purpleLight.position.set(-4, 3, 2);
    scene.add(purpleLight);
    const cyanLight = new THREE.PointLight(0x00CEC9, 0.5, 15);
    cyanLight.position.set(4, 3, -2);
    scene.add(cyanLight);

    // Ground grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x1a1e2e, 0x0f1220);
    scene.add(gridHelper);

    spatial3dState.scene = scene;
    spatial3dState.camera = camera;
    spatial3dState.renderer = renderer;
    spatial3dState.controls = controls;
  }

  // Clear old meshes
  spatial3dState.meshes.forEach((mesh) => {
    spatial3dState.scene.remove(mesh);
    if (mesh.label) spatial3dState.scene.remove(mesh.label);
  });
  spatial3dState.meshes.clear();

  // Create planes for each surface
  const cols = Math.ceil(Math.sqrt(surfaces.length));
  const spacing = 3.5;

  surfaces.forEach((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * spacing;
    const z = (row * spacing) - 1;

    // Create offscreen canvas for texture
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 512;
    texCanvas.height = 320;
    const ctx = texCanvas.getContext("2d");

    // Draw browser chrome look
    ctx.fillStyle = "#1a1e30";
    ctx.fillRect(0, 0, 512, 320);

    // Title bar
    ctx.fillStyle = "#252a3a";
    ctx.fillRect(0, 0, 512, 30);

    // Window dots
    ctx.fillStyle = "#ff5f57"; ctx.beginPath(); ctx.arc(14, 15, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffbd2e"; ctx.beginPath(); ctx.arc(30, 15, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#28c840"; ctx.beginPath(); ctx.arc(46, 15, 5, 0, Math.PI * 2); ctx.fill();

    // Title text
    ctx.fillStyle = "#a0a8c0";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText(s.title || s.surfaceId, 60, 19);

    // URL bar
    ctx.fillStyle = "#0f1220";
    ctx.fillRect(8, 35, 496, 22);
    ctx.fillStyle = "#556";
    ctx.font = "10px Inter, monospace";
    ctx.fillText(s.url || "", 14, 50);

    // Content area — gradient placeholder
    const grd = ctx.createLinearGradient(0, 60, 0, 320);
    grd.addColorStop(0, "#1a1e30");
    grd.addColorStop(1, "#0a0e1a");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 60, 512, 260);

    // Website name large
    ctx.fillStyle = "rgba(108, 92, 231, 0.3)";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.title || "Browser", 256, 160);
    ctx.textAlign = "start";

    // Favicon circle
    ctx.fillStyle = "#6C5CE7";
    ctx.beginPath(); ctx.arc(256, 200, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "16px serif";
    ctx.textAlign = "center";
    ctx.fillText("🌐", 256, 206);
    ctx.textAlign = "start";

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    spatial3dState.textures.set(s.surfaceId, { canvas: texCanvas, texture });

    // Plane geometry (16:10 aspect ratio)
    const planeGeo = new THREE.PlaneGeometry(3, 1.875);
    const planeMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.1,
      emissive: new THREE.Color(0x1a1e30),
      emissiveIntensity: 0.1,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.position.set(x, 1.2, z);
    mesh.rotation.y = 0;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Neon glow behind each plane
    const glowGeo = new THREE.PlaneGeometry(3.2, 2.05);
    const glowMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x6C5CE7 : 0x00CEC9,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(x, 1.2, z + 0.02);
    spatial3dState.scene.add(glowMesh);

    // Text label sprite
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 256;
    labelCanvas.height = 32;
    const lctx = labelCanvas.getContext("2d");
    lctx.fillStyle = "rgba(10, 14, 26, 0.7)";
    lctx.fillRect(0, 0, 256, 32);
    lctx.fillStyle = "#a0a8c0";
    lctx.font = "14px Inter, sans-serif";
    lctx.textAlign = "center";
    lctx.fillText(s.title || s.surfaceId, 128, 22);
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const spriteMat = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2, 0.25, 1);
    sprite.position.set(x, -0.15, z);
    spatial3dState.scene.add(sprite);
    mesh.label = sprite;
    mesh.glow = glowMesh;

    spatial3dState.scene.add(mesh);
    spatial3dState.meshes.set(s.surfaceId, mesh);
  });

  // Start render loop
  spatial3dState.running = true;
  function animate() {
    if (!spatial3dState.running) return;
    requestAnimationFrame(animate);
    spatial3dState.controls.update();

    // Subtle floating animation
    spatial3dState.meshes.forEach((mesh, sid) => {
      const t = Date.now() * 0.001;
      mesh.position.y = 1.2 + Math.sin(t + mesh.position.x * 2) * 0.05;
    });

    spatial3dState.renderer.render(spatial3dState.scene, spatial3dState.camera);
  }
  animate();

  // Handle resize
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    spatial3dState.camera.aspect = w / h;
    spatial3dState.camera.updateProjectionMatrix();
    spatial3dState.renderer.setSize(w, h);
  };
  window.removeEventListener("resize", spatial3dState._resizeHandler);
  spatial3dState._resizeHandler = onResize;
  window.addEventListener("resize", onResize);
}
