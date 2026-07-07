/* ═══════════════════════════════════════════
   TabSpace CDP Host — Smart Adaptive Streaming
   Launches Chrome, captures screencast frames,
   auto-detects page activity, switches between
   live streaming and snapshot mode.
   ═══════════════════════════════════════════ */

import { WebSocket } from "ws";
import si from "systeminformation";
import { chromium } from "playwright-core";

const SERVER = process.env.TABSPACE_SERVER || "ws://localhost:8787";
const ROOM = process.env.TABSPACE_ROOM || "roomA";
const HOST_ID = process.env.TABSPACE_HOST_ID || "host-1";
const OWNER_USER_ID = process.env.TABSPACE_OWNER_USER_ID || "user-justin";
const HOST_NAME = process.env.TABSPACE_HOST_NAME || "Justin-CDP-Host";
const CHROME_PATH = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// ─── Smart Rendering Config ───
const IDLE_TIMEOUT_MS = 5000;       // 5s of identical frames → snapshot mode
const SAMPLE_POINTS = 100;          // Number of pixel positions to sample for diff
const SNAPSHOT_QUALITY = 85;        // High-quality JPEG for snapshot freeze frame
const STREAM_QUALITY = 60;          // Lower quality for live streaming
const DIFF_THRESHOLD = 5;           // Minimum sampled-pixel diff to count as "changed"

// Surface definitions — same URLs, but these will be real Chrome tabs
const surfaceDefs = [
    { surfaceId: "s1", title: "Wikipedia — Main Page", url: "https://en.wikipedia.org/wiki/Main_Page", containerId: "profile-work", renderHint: "static" },
    { surfaceId: "s2", title: "YouTube — Embedded Video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0", containerId: "profile-work", renderHint: "dynamic" },
    { surfaceId: "s3", title: "OpenStreetMap — World Map", url: "https://www.openstreetmap.org/export/embed.html?bbox=-0.1,51.5,0.0,51.52&layer=mapnik", containerId: "profile-work", renderHint: "dynamic" },
    { surfaceId: "s4", title: "Internet Archive — Wayback Machine", url: "https://web.archive.org/web/2024/https://example.com", containerId: "profile-work", renderHint: "static" },
    { surfaceId: "s5", title: "CodePen — CSS Animation", url: "https://codepen.io/cobra_winfrey/embed/LYVKOGz?default-tab=result&theme-id=dark", containerId: "profile-design", renderHint: "dynamic" },
    { surfaceId: "s6", title: "Google Maps — San Francisco", url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.507640204439!3d37.75781499657369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4t5!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan+Francisco!5e0!3m2!1sen!2sus!4v1&maptype=satellite", containerId: "profile-work", renderHint: "dynamic" },
];

// Track CDP pages and surfaces
const cdpPages = new Map();    // surfaceId → { page, cdpSession, title, renderMode, lastFrameHash, lastChangeAt, isStreaming, snapshotData }
const surfaces = [];           // published surface objects
let surfaceCounter = surfaceDefs.length;
let browser = null;
let browserContext = null;
let ws = null;

// ─── Lightweight Frame Checksum ───
// Samples a fixed set of byte positions from JPEG data to detect changes.
// Not pixel-perfect, but extremely fast and catches meaningful visual changes.
function frameChecksum(buffer) {
    if (buffer.length < SAMPLE_POINTS * 4) return buffer.length; // Fallback for tiny frames
    const spacing = Math.floor(buffer.length / SAMPLE_POINTS);
    let hash = 0;
    for (let i = 0; i < SAMPLE_POINTS; i++) {
        const pos = i * spacing;
        hash = ((hash << 5) - hash + buffer[pos]) | 0;
    }
    return hash;
}

// ─── Launch Chrome & CDP ───
async function launchBrowser() {
    console.log("[cdp] launching Chrome...");
    browser = await chromium.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: [
            "--disable-blink-features=AutomationControlled",
            "--no-first-run",
            "--disable-default-apps",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
        ]
    });
    browserContext = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });
    console.log("[cdp] Chrome launched, context ready");
}

// ─── Open a page and start screencast with activity detection ───
async function openCdpPage(surfaceDef) {
    const page = await browserContext.newPage();
    console.log(`[cdp] navigating ${surfaceDef.surfaceId}: ${surfaceDef.url}`);

    try {
        await page.goto(surfaceDef.url, { waitUntil: "domcontentloaded", timeout: 15000 });
    } catch (e) {
        console.log(`[cdp] nav warning for ${surfaceDef.surfaceId}: ${e.message}`);
    }

    // Get CDP session
    const cdpSession = await page.context().newCDPSession(page);

    // Per-surface render state
    const state = {
        page,
        cdpSession,
        title: surfaceDef.title,
        renderMode: "live",         // "live" | "snapshot"
        renderHint: surfaceDef.renderHint || "static",
        lastFrameHash: null,
        lastChangeAt: Date.now(),
        isStreaming: true,
        snapshotData: null,         // base64 JPEG of last snapshot
        consecutiveIdleFrames: 0,
    };

    // ─── Screencast handler with activity detection ───
    cdpSession.on("Page.screencastFrame", async (params) => {
        try {
            const frameData = Buffer.from(params.data, "base64");
            const currentHash = frameChecksum(frameData);
            const now = Date.now();

            // Check if frame content changed
            if (state.lastFrameHash !== null && currentHash === state.lastFrameHash) {
                state.consecutiveIdleFrames++;
            } else {
                state.consecutiveIdleFrames = 0;
                state.lastChangeAt = now;
            }
            state.lastFrameHash = currentHash;

            // If still live-streaming, send the frame
            if (state.renderMode === "live" && state.isStreaming) {
                const header = Buffer.alloc(32);
                header.write(surfaceDef.surfaceId.padEnd(32, "\0"));
                const packet = Buffer.concat([header, frameData]);

                if (ws && ws.readyState === 1) {
                    ws.send(packet); // Binary frame
                }
            }

            // Check idle timeout → switch to snapshot
            const idleDuration = now - state.lastChangeAt;
            if (state.renderMode === "live" && idleDuration >= IDLE_TIMEOUT_MS && state.consecutiveIdleFrames > 3) {
                await switchToSnapshot(surfaceDef.surfaceId, params.data);
            }

            // Acknowledge the frame so CDP sends the next one
            await cdpSession.send("Page.screencastFrameAck", { sessionId: params.sessionId });
        } catch { }
    });

    await cdpSession.send("Page.startScreencast", {
        format: "jpeg",
        quality: STREAM_QUALITY,
        maxWidth: 1280,
        maxHeight: 800,
        everyNthFrame: 3, // Skip frames for bandwidth
    });

    // Auto-detect title
    const title = await page.title().catch(() => surfaceDef.title);
    state.title = title;

    cdpPages.set(surfaceDef.surfaceId, state);
    console.log(`[cdp] streaming ${surfaceDef.surfaceId}: "${title}" (hint: ${state.renderHint})`);
    return title;
}

// ─── Switch to Snapshot Mode ───
async function switchToSnapshot(surfaceId, lastFrameBase64) {
    const state = cdpPages.get(surfaceId);
    if (!state || state.renderMode === "snapshot") return;

    state.renderMode = "snapshot";
    state.isStreaming = false;

    // Capture high-quality snapshot
    let snapshotB64 = lastFrameBase64; // Use last frame as fallback
    try {
        // Take a fresh high-quality screenshot
        const screenshotBuffer = await state.page.screenshot({ type: "jpeg", quality: SNAPSHOT_QUALITY });
        snapshotB64 = screenshotBuffer.toString("base64");
    } catch {
        // Fall back to the last screencast frame
    }

    state.snapshotData = snapshotB64;

    // Stop screencast to save resources
    try {
        await state.cdpSession.send("Page.stopScreencast");
    } catch { }

    // Send snapshot + mode change to clients
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
            type: "SURFACE_SNAPSHOT",
            roomId: ROOM,
            surfaceId,
            snapshot: snapshotB64,
            width: 1280,
            height: 800,
        }));
        ws.send(JSON.stringify({
            type: "RENDER_MODE_CHANGE",
            roomId: ROOM,
            surfaceId,
            renderMode: "snapshot",
        }));
    }

    const idleSec = ((Date.now() - state.lastChangeAt) / 1000).toFixed(1);
    console.log(`[cdp] ${surfaceId} → SNAPSHOT (idle ${idleSec}s)`);
}

// ─── Resume Live Streaming ───
async function resumeStreaming(surfaceId) {
    const state = cdpPages.get(surfaceId);
    if (!state || state.renderMode === "live") return;

    state.renderMode = "live";
    state.isStreaming = true;
    state.lastChangeAt = Date.now();
    state.consecutiveIdleFrames = 0;
    state.lastFrameHash = null; // Reset so first frame is always "changed"

    // Restart screencast
    try {
        await state.cdpSession.send("Page.startScreencast", {
            format: "jpeg",
            quality: STREAM_QUALITY,
            maxWidth: 1280,
            maxHeight: 800,
            everyNthFrame: 3,
        });
    } catch (e) {
        console.log(`[cdp] resume error for ${surfaceId}:`, e.message);
        return;
    }

    // Notify clients
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
            type: "RENDER_MODE_CHANGE",
            roomId: ROOM,
            surfaceId,
            renderMode: "live",
        }));
    }

    console.log(`[cdp] ${surfaceId} → LIVE (client hover)`);
}

// ─── Inject input from clients ───
async function injectInput(surfaceId, input) {
    const entry = cdpPages.get(surfaceId);
    if (!entry) return;
    const { cdpSession } = entry;

    // Auto-resume streaming on any input
    if (entry.renderMode === "snapshot") {
        await resumeStreaming(surfaceId);
    }

    try {
        if (input.type === "mousemove" || input.type === "mousedown" || input.type === "mouseup" || input.type === "click") {
            const cdpType = input.type === "mousemove" ? "mouseMoved" : input.type === "mousedown" ? "mousePressed" : input.type === "mouseup" ? "mouseReleased" : "mousePressed";
            await cdpSession.send("Input.dispatchMouseEvent", {
                type: cdpType,
                x: input.x || 0,
                y: input.y || 0,
                button: input.button || "left",
                clickCount: input.type === "click" ? 1 : 0,
            });
            if (input.type === "click") {
                await cdpSession.send("Input.dispatchMouseEvent", {
                    type: "mouseReleased",
                    x: input.x || 0,
                    y: input.y || 0,
                    button: "left",
                });
            }
        } else if (input.type === "keydown" || input.type === "keyup") {
            await cdpSession.send("Input.dispatchKeyEvent", {
                type: input.type === "keydown" ? "keyDown" : "keyUp",
                key: input.key || "",
                text: input.text || "",
                code: input.code || "",
            });
        } else if (input.type === "wheel") {
            await cdpSession.send("Input.dispatchMouseEvent", {
                type: "mouseWheel",
                x: input.x || 0,
                y: input.y || 0,
                deltaX: input.deltaX || 0,
                deltaY: input.deltaY || 0,
            });
        }
    } catch (e) {
        console.log(`[cdp] input error on ${surfaceId}:`, e.message);
    }
}

// ─── Close a CDP page ───
async function closeCdpPage(surfaceId) {
    const entry = cdpPages.get(surfaceId);
    if (!entry) return;
    try {
        await entry.cdpSession.send("Page.stopScreencast").catch(() => { });
        await entry.page.close();
    } catch { }
    cdpPages.delete(surfaceId);
    console.log(`[cdp] closed ${surfaceId}`);
}

// ─── Main ───
async function main() {
    await launchBrowser();

    ws = new WebSocket(SERVER);

    ws.on("open", async () => {
        console.log("[host] connected to", SERVER);
        ws.send(JSON.stringify({ type: "HELLO", role: "host", hostId: HOST_ID, ownerUserId: OWNER_USER_ID, hostName: HOST_NAME }));
        ws.send(JSON.stringify({ type: "JOIN_ROOM", roomId: ROOM }));

        // Open CDP pages and publish surfaces
        for (const def of surfaceDefs) {
            const title = await openCdpPage(def);
            const surface = {
                surfaceId: def.surfaceId,
                title: title || def.title,
                url: def.url,
                favicon: "",
                description: "",
                ownerUserId: OWNER_USER_ID,
                hostId: HOST_ID,
                containerId: def.containerId,
                targetRef: `cdp:${def.surfaceId}`,
                cdpStreaming: true, // Flag to tell client to use canvas instead of iframe
                renderMode: "live", // Initial render mode
                renderHint: def.renderHint || "static",
                policy: {
                    visibility: "PUBLIC",
                    viewAllow: [],
                    controlMode: "PUBLIC",
                    controlAllow: [],
                    reshareAllowed: true,
                    cloneAllowed: true,
                },
                transform: { pos: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1] },
            };
            surfaces.push(surface);
            ws.send(JSON.stringify({ type: "PUBLISH_SURFACE", roomId: ROOM, surface }));
            console.log(`[host] published: ${surface.title} (CDP, hint: ${def.renderHint})`);
        }
        console.log(`[host] ${surfaces.length} CDP surfaces published to room ${ROOM}`);

        // Start heartbeat
        setInterval(heartbeat, 2000);
    });

    ws.on("message", async (raw, isBinary) => {
        if (isBinary) return; // Host shouldn't receive binary
        const msg = JSON.parse(raw.toString());

        if (msg.type === "FORWARD_INPUT") {
            const { surfaceId, input } = msg;
            await injectInput(surfaceId, input);
        }

        // ─── Resume Streaming (client requests live mode) ───
        if (msg.type === "RESUME_STREAMING") {
            const { surfaceId } = msg;
            await resumeStreaming(surfaceId);
        }

        if (msg.type === "ROOM_STATE") {
            const state = msg.state;
            console.log(`[host] room: ${state.presence?.users?.length || 0} user(s), ${state.presence?.hosts?.length || 0} host(s), ${state.surfaces?.length || 0} surface(s)`);
        }

        if (msg.type === "SPAWN_SURFACE") {
            surfaceCounter++;
            const def = {
                surfaceId: `s${surfaceCounter}`,
                title: msg.title || msg.url || `Browser ${surfaceCounter}`,
                url: msg.url || "",
                containerId: "profile-work",
                renderHint: "dynamic", // New surfaces default to dynamic
            };
            const title = await openCdpPage(def);
            const surface = {
                surfaceId: def.surfaceId,
                title: title || def.title,
                url: def.url,
                favicon: "",
                description: "",
                ownerUserId: msg.requestedBy || OWNER_USER_ID,
                hostId: HOST_ID,
                containerId: def.containerId,
                targetRef: `cdp:${def.surfaceId}`,
                cdpStreaming: true,
                renderMode: "live",
                renderHint: def.renderHint,
                policy: {
                    visibility: "PUBLIC", viewAllow: [], controlMode: "PUBLIC",
                    controlAllow: [], reshareAllowed: true, cloneAllowed: true,
                },
                transform: { pos: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1] },
            };
            surfaces.push(surface);
            ws.send(JSON.stringify({ type: "PUBLISH_SURFACE", roomId: ROOM, surface }));
            console.log(`[host] spawned CDP: ${surface.title} (hint: ${def.renderHint})`);
        }

        if (msg.type === "DESTROY_SURFACE") {
            const idx = surfaces.findIndex(s => s.surfaceId === msg.surfaceId);
            if (idx !== -1) {
                const removed = surfaces.splice(idx, 1)[0];
                await closeCdpPage(msg.surfaceId);
                ws.send(JSON.stringify({ type: "UNPUBLISH_SURFACE", roomId: ROOM, surfaceId: msg.surfaceId }));
                console.log(`[host] destroyed CDP: ${removed.title}`);
            }
        }
    });

    ws.on("close", async () => {
        console.log("[host] disconnected");
        for (const [sid] of cdpPages) await closeCdpPage(sid);
        if (browser) await browser.close().catch(() => { });
    });

    ws.on("error", (err) => console.error("[host] error:", err.message));
}

// ─── Heartbeat ───
async function heartbeat() {
    try {
        const mem = await si.mem();
        const load = await si.currentLoad();

        // Count render modes for metrics
        let liveCount = 0, snapshotCount = 0;
        for (const [, state] of cdpPages) {
            if (state.renderMode === "live") liveCount++;
            else snapshotCount++;
        }

        const metrics = {
            rssApproxMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
            memUsedMB: Math.round(mem.active / 1024 / 1024),
            memTotalMB: Math.round(mem.total / 1024 / 1024),
            cpuLoadPct: Math.round(load.currentLoad),
            surfaces: surfaces.length,
            liveStreaming: liveCount,
            snapshotted: snapshotCount,
        };
        ws.send(JSON.stringify({ type: "HOST_HEARTBEAT", roomId: ROOM, metrics }));
    } catch { }
}

main().catch(err => {
    console.error("[cdp] fatal:", err);
    process.exit(1);
});
