import { WebSocket } from "ws";
import si from "systeminformation";

const SERVER = process.env.TABSPACE_SERVER || "ws://localhost:8787";
const ROOM = process.env.TABSPACE_ROOM || "roomA";
const HOST_ID = process.env.TABSPACE_HOST_ID || "host-1";
const OWNER_USER_ID = process.env.TABSPACE_OWNER_USER_ID || "user-justin";
const HOST_NAME = process.env.TABSPACE_HOST_NAME || "Justin-Host";

const ws = new WebSocket(SERVER);

// Surfaces using websites that ACTUALLY allow iframe embedding
// Most major sites (Gmail, GitHub, Notion, Figma) block iframes via X-Frame-Options / CSP.
// These are chosen because they reliably render inside iframes.
const surfaces = [
  {
    surfaceId: "s1",
    title: "Wikipedia — Main Page",
    url: "https://en.wikipedia.org/wiki/Main_Page",
    favicon: "https://en.wikipedia.org/static/favicon/wikipedia.ico",
    description: "The free encyclopedia. Fully interactive — browse, scroll, click links.",
    ownerUserId: OWNER_USER_ID,
    hostId: HOST_ID,
    containerId: "profile-work",
    targetRef: "tab:101",
    renderHint: "static",
    policy: {
      visibility: "PUBLIC",
      viewAllow: [],
      controlMode: "PUBLIC",
      controlAllow: [],
      reshareAllowed: true,
      cloneAllowed: true
    },
    egressPolicy: { region: "us-west", staticIpRequired: false, rotation: "none" },
    transform: { pos: [-2.4, 0.4, 0.0], rot: [0, 0, 0], scale: [1, 1, 1] }
  },
  {
    surfaceId: "s2",
    title: "YouTube — Embedded Video",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
    favicon: "https://www.youtube.com/s/desktop/12d6b690/img/favicon_32x32.png",
    description: "Embedded YouTube player. Click to play, full controls available.",
    ownerUserId: OWNER_USER_ID,
    hostId: HOST_ID,
    containerId: "profile-work",
    targetRef: "tab:102",
    renderHint: "dynamic",
    policy: {
      visibility: "PUBLIC",
      viewAllow: [],
      controlMode: "PUBLIC",
      controlAllow: [],
      reshareAllowed: true,
      cloneAllowed: true
    },
    egressPolicy: { region: "us-west", staticIpRequired: false, rotation: "none" },
    transform: { pos: [0.0, 0.4, 0.0], rot: [0, 0, 0], scale: [1, 1, 1] }
  },
  {
    surfaceId: "s3",
    title: "OpenStreetMap — World Map",
    url: "https://www.openstreetmap.org/export/embed.html?bbox=-0.1,51.5,0.0,51.52&layer=mapnik",
    favicon: "https://www.openstreetmap.org/assets/favicon-32x32-9b42ff7be43a85c8690dbf953b38fbe7c43e3e3e953aaff561ec6bccf9ef0b36.png",
    description: "Interactive map. Pan, zoom, and explore the world.",
    ownerUserId: OWNER_USER_ID,
    hostId: HOST_ID,
    containerId: "profile-work",
    targetRef: "tab:103",
    renderHint: "dynamic",
    policy: {
      visibility: "PUBLIC",
      viewAllow: [],
      controlMode: "PUBLIC",
      controlAllow: [],
      reshareAllowed: true,
      cloneAllowed: true
    },
    egressPolicy: { region: "eu-west", staticIpRequired: false, rotation: "failover-only" },
    transform: { pos: [2.4, 0.4, 0.0], rot: [0, 0, 0], scale: [1, 1, 1] }
  },
  {
    surfaceId: "s4",
    title: "Internet Archive — Wayback Machine",
    url: "https://web.archive.org/web/2024/https://example.com",
    favicon: "https://archive.org/favicon.ico",
    description: "Browse archived versions of websites through time.",
    ownerUserId: OWNER_USER_ID,
    hostId: HOST_ID,
    containerId: "profile-work",
    targetRef: "tab:104",
    renderHint: "static",
    policy: {
      visibility: "PUBLIC",
      viewAllow: [],
      controlMode: "PUBLIC",
      controlAllow: [],
      reshareAllowed: true,
      cloneAllowed: true
    },
    transform: { pos: [-2.4, -1.2, 0.0], rot: [0, 0, 0], scale: [1, 1, 1] }
  },
  {
    surfaceId: "s5",
    title: "CodePen — CSS Animation",
    url: "https://codepen.io/juliangarnier/embed/LMrRNW?default-tab=result&editable=true",
    favicon: "https://cpwebassets.codepen.io/assets/favicon/favicon-touch-de50acbf5d634ec6791894eba4ba9cf490f709b3d742597c6fc4b734e6492a31.png",
    description: "Live code playground. Watch CSS animations run, edit the code.",
    ownerUserId: OWNER_USER_ID,
    hostId: HOST_ID,
    containerId: "profile-design",
    targetRef: "tab:105",
    renderHint: "dynamic",
    policy: {
      visibility: "PUBLIC",
      viewAllow: [],
      controlMode: "PUBLIC",
      controlAllow: [],
      reshareAllowed: true,
      cloneAllowed: true
    },
    egressPolicy: { region: "us-west", staticIpRequired: false, rotation: "none" },
    transform: { pos: [0.0, -1.2, 0.0], rot: [0, 0, 0], scale: [1, 1, 1] }
  },
  {
    surfaceId: "s6",
    title: "Google Maps — San Francisco",
    url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.507640204439!3d37.75781499657369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4t5!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan+Francisco!5e0!3m2!1sen!2sus!4v1&maptype=satellite",
    favicon: "https://maps.google.com/favicon.ico",
    description: "Interactive satellite map of San Francisco. Pan, zoom, explore.",
    ownerUserId: OWNER_USER_ID,
    hostId: HOST_ID,
    containerId: "profile-work",
    targetRef: "tab:106",
    renderHint: "dynamic",
    policy: {
      visibility: "PUBLIC",
      viewAllow: [],
      controlMode: "PUBLIC",
      controlAllow: [],
      reshareAllowed: true,
      cloneAllowed: true
    },
    transform: { pos: [2.4, -1.2, 0.0], rot: [0, 0, 0], scale: [1, 1, 1] }
  }
];

function capLooksValid(cap) {
  return cap && cap.capType === "CONTROL" && typeof cap.sig === "string";
}

let surfaceCounter = surfaces.length;

ws.on("open", () => {
  console.log("[host] connected to", SERVER);
  ws.send(JSON.stringify({ type: "HELLO", role: "host", hostId: HOST_ID, ownerUserId: OWNER_USER_ID, hostName: HOST_NAME }));
  ws.send(JSON.stringify({ type: "JOIN_ROOM", roomId: ROOM }));

  for (const s of surfaces) {
    ws.send(JSON.stringify({ type: "PUBLISH_SURFACE", roomId: ROOM, surface: s }));
    console.log(`[host] published: ${s.title}`);
  }
  console.log(`[host] ${surfaces.length} surfaces published to room ${ROOM}`);

  // Start heartbeat (report system metrics every 2s)
  setInterval(heartbeat, 2000);
});

ws.on("message", (raw) => {
  const msg = JSON.parse(raw.toString());
  if (msg.type === "FORWARD_INPUT") {
    const { surfaceId, userId, input, cap } = msg;
    if (!capLooksValid(cap)) {
      console.log("[host] ✗ reject input (invalid cap)", { surfaceId, userId });
      return;
    }
    const surface = surfaces.find(s => s.surfaceId === surfaceId);
    console.log(`[host] ✓ input on "${surface?.title || surfaceId}" from ${userId}`, input);
  }

  if (msg.type === "ROOM_STATE") {
    const state = msg.state;
    console.log(`[host] room: ${state.presence?.users?.length || 0} user(s), ${state.presence?.hosts?.length || 0} host(s), ${state.surfaces?.length || 0} surface(s)`);
  }

  // ─── Spawn a new surface (requested by client via server) ───
  if (msg.type === "SPAWN_SURFACE") {
    surfaceCounter++;
    const newSurface = {
      surfaceId: `s${surfaceCounter}`,
      title: msg.title || msg.url || `Browser ${surfaceCounter}`,
      url: msg.url || "",
      favicon: "",
      description: "",
      ownerUserId: msg.requestedBy || OWNER_USER_ID,
      hostId: HOST_ID,
      containerId: "profile-work",
      targetRef: `tab:${100 + surfaceCounter}`,
      sessionMode: msg.sessionMode || "SHARED",
      policy: {
        visibility: "PUBLIC",
        viewAllow: [],
        controlMode: "PUBLIC",
        controlAllow: [],
        reshareAllowed: true,
        cloneAllowed: true
      },
      transform: { pos: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1] }
    };
    surfaces.push(newSurface);
    ws.send(JSON.stringify({ type: "PUBLISH_SURFACE", roomId: ROOM, surface: newSurface }));
    console.log(`[host] spawned: ${newSurface.title} (${newSurface.surfaceId})`);
  }

  // ─── Destroy a surface ───
  if (msg.type === "DESTROY_SURFACE") {
    const idx = surfaces.findIndex(s => s.surfaceId === msg.surfaceId);
    if (idx !== -1) {
      const removed = surfaces.splice(idx, 1)[0];
      ws.send(JSON.stringify({ type: "UNPUBLISH_SURFACE", roomId: ROOM, surfaceId: msg.surfaceId }));
      console.log(`[host] destroyed: ${removed.title} (${msg.surfaceId})`);
    }
  }
});

ws.on("close", () => console.log("[host] disconnected"));
ws.on("error", (err) => console.error("[host] error:", err.message));

// ─── Heartbeat ───
async function heartbeat() {
  try {
    const mem = await si.mem();
    const load = await si.currentLoad();
    const metrics = {
      rssApproxMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      memUsedMB: Math.round(mem.active / 1024 / 1024),
      memTotalMB: Math.round(mem.total / 1024 / 1024),
      cpuLoadPct: Math.round(load.currentLoad),
      surfaces: surfaces.length
    };
    ws.send(JSON.stringify({ type: "HOST_HEARTBEAT", roomId: ROOM, metrics }));
  } catch { }
}
