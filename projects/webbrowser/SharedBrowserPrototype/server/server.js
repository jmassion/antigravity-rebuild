import http from "http";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const SECRET = process.env.TABSPACE_SECRET || "dev_secret_change_me";

const roomEpochs = new Map(); // roomId -> int
function epoch(roomId) { if (!roomEpochs.has(roomId)) roomEpochs.set(roomId, 1); return roomEpochs.get(roomId); }
function bumpEpoch(roomId) { roomEpochs.set(roomId, epoch(roomId) + 1); return roomEpochs.get(roomId); }
const CLIENT_DIR = path.resolve(__dirname, "..", "client");
const NOTES_FILE = path.resolve(__dirname, "..", "justin_feedback.json");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function nowMs() { return Date.now(); }

function signCap(payload) {
  const body = JSON.stringify(payload);
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("hex");
  return { ...payload, sig };
}

function verifyCap(cap) {
  if (!cap?.sig) return { ok: false, reason: "no_sig" };
  const { sig, ...payload } = cap;
  const body = JSON.stringify(payload);
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("hex");
  if (expected !== sig) return { ok: false, reason: "bad_sig" };
  if (typeof payload.expiresAt !== "number" || payload.expiresAt < nowMs()) return { ok: false, reason: "expired" };
  if (payload.roomEpoch !== epoch(payload.roomId)) return { ok: false, reason: "revoked_epoch" };
  return { ok: true, payload };
}

// In-memory rooms
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      users: new Map(),
      hosts: new Map(),
      surfaces: new Map(),
      locks: new Map(),
      hostMetrics: new Map()
    });
  }
  return rooms.get(roomId);
}

function safeSend(conn, msg) {
  try { conn.ws.send(JSON.stringify(msg)); } catch (_) { }
}

function broadcastRoom(room, msg) {
  for (const c of room.users.values()) safeSend(c, msg);
  for (const c of room.hosts.values()) safeSend(c, msg);
}

function roomState(room) {
  return {
    roomId: room.roomId,
    roomEpoch: epoch(room.roomId),
    surfaces: Array.from(room.surfaces.values()),
    locks: Array.from(room.locks.entries()).map(([surfaceId, lock]) => ({ surfaceId, ...lock })),
    presence: {
      users: Array.from(room.users.values()).map(c => ({ userId: c.userId, displayName: c.displayName })),
      hosts: Array.from(room.hosts.values()).map(c => ({ hostId: c.hostId, hostName: c.hostName, ownerUserId: c.ownerUserId }))
    },
    hostMetrics: Array.from(room.hostMetrics.entries()).map(([hostId, v]) => ({ hostId, ...v }))
  };
}

function canView(surface, userId) {
  const p = surface.policy || {};
  if (surface.ownerUserId === userId) return true;
  if (p.visibility === "PUBLIC") return true;
  if (p.visibility === "PRIVATE") return (p.viewAllow || []).includes(userId);
  if (p.visibility === "GROUP") return (p.viewAllow || []).includes(userId);
  return false;
}

function canControl(surface, userId) {
  const p = surface.policy || {};
  if (surface.ownerUserId === userId) return true;
  if (p.controlMode === "NONE") return false;
  if (p.controlMode === "PUBLIC") return true;
  return (p.controlAllow || []).includes(userId);
}

// ─── HTTP Server ───
const server = http.createServer((req, res) => {
  // CORS headers for notes API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health endpoint
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", rooms: rooms.size, uptime: process.uptime() }));
    return;
  }

  // ─── Notes API ───
  if (req.url === "/api/notes" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        // Append to notes file
        let existing = [];
        try { existing = JSON.parse(fs.readFileSync(NOTES_FILE, "utf8")); } catch { }
        existing.push({
          timestamp: new Date().toISOString(),
          ...data
        });
        fs.writeFileSync(NOTES_FILE, JSON.stringify(existing, null, 2));
        console.log(`[server] 📝 Justin feedback saved (${existing.length} notes total)`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, count: existing.length }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  if (req.url === "/api/notes" && req.method === "GET") {
    try {
      const data = fs.readFileSync(NOTES_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    } catch {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("[]");
    }
    return;
  }

  // Serve static files from client/
  let filePath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  filePath = path.join(CLIENT_DIR, filePath);

  if (!filePath.startsWith(CLIENT_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const conn = { ws, role: null, userId: null, displayName: null, hostId: null, hostName: null, ownerUserId: null, roomId: null };

  ws.on("message", (raw, isBinary) => {
    // ─── Binary Frame Forwarding (CDP screencast) ───
    if (isBinary) {
      if (conn.role !== "host" || !conn.roomId) return;
      const room = getRoom(conn.roomId);
      // Forward binary frame to all clients in the room
      for (const [, client] of room.users) {
        if (client.ws.readyState === 1) {
          client.ws.send(raw, { binary: true });
        }
      }
      return;
    }

    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return safeSend(conn, { type: "ERROR", message: "bad_json" }); }

    if (msg.type === "HELLO") {
      conn.role = msg.role;
      if (conn.role === "client") {
        conn.userId = msg.userId;
        conn.displayName = msg.displayName || msg.userId;
      } else if (conn.role === "host") {
        conn.hostId = msg.hostId;
        conn.hostName = msg.hostName || msg.hostId;
        conn.ownerUserId = msg.ownerUserId;
      }
      return;
    }

    if (msg.type === "JOIN_ROOM") {
      const room = getRoom(msg.roomId);
      conn.roomId = msg.roomId;
      if (conn.role === "client") room.users.set(conn.userId, conn);
      if (conn.role === "host") room.hosts.set(conn.hostId, conn);
      broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      return;
    }

    if (!conn.roomId) return safeSend(conn, { type: "ERROR", message: "join_room_first" });
    const room = getRoom(conn.roomId);

    // ─── Epoch Revocation ───
    if (msg.type === "REVOKE_ALL") {
      if (conn.role === "client") {
        bumpEpoch(room.roomId);
        room.locks.clear();
        broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      }
      return;
    }

    // ─── Host Heartbeat ───
    if (msg.type === "HOST_HEARTBEAT") {
      if (conn.role !== "host") return;
      room.hostMetrics.set(conn.hostId, { ts: nowMs(), metrics: msg.metrics || {} });
      broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      return;
    }

    // ─── Move Surface (owner only) ───
    if (msg.type === "MOVE_SURFACE") {
      const s = room.surfaces.get(msg.surfaceId);
      if (!s) return;
      if (conn.role !== "client") return;
      if (s.ownerUserId !== conn.userId) return;
      s.transform = msg.transform;
      broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      return;
    }

    // ─── Client requests new browser ───
    if (msg.type === "REQUEST_ADD_SURFACE") {
      if (conn.role !== "client") return;
      // Forward to first available host in the room
      const hostConn = room.hosts.values().next().value;
      if (!hostConn) return safeSend(conn, { type: "ERROR", message: "no_host" });
      safeSend(hostConn, {
        type: "SPAWN_SURFACE",
        roomId: room.roomId,
        url: msg.url || "",
        title: msg.title || "",
        sessionMode: msg.sessionMode || "SHARED",
        requestedBy: conn.userId
      });
      return;
    }

    // ─── Client requests browser removal ───
    if (msg.type === "REQUEST_DESTROY_SURFACE") {
      if (conn.role !== "client") return;
      const s = room.surfaces.get(msg.surfaceId);
      if (!s) return;
      // Only owner can remove
      if (s.ownerUserId !== conn.userId) return safeSend(conn, { type: "ERROR", message: "not_owner" });
      const hostConn = room.hosts.get(s.hostId);
      if (hostConn) {
        safeSend(hostConn, { type: "DESTROY_SURFACE", roomId: room.roomId, surfaceId: msg.surfaceId });
      }
      // Also remove from server state immediately
      room.surfaces.delete(msg.surfaceId);
      room.locks.delete(msg.surfaceId);
      broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      return;
    }

    // ─── Host updates surface title ───
    if (msg.type === "UPDATE_SURFACE_TITLE") {
      if (conn.role !== "host") return;
      const s = room.surfaces.get(msg.surfaceId);
      if (!s) return;
      if (s.hostId !== conn.hostId) return;
      s.title = msg.title;
      if (msg.favicon) s.favicon = msg.favicon;
      broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      return;
    }

    if (msg.type === "PUBLISH_SURFACE") {
      if (conn.role !== "host") return;
      const s = msg.surface;
      if (!s?.surfaceId) return;
      if (s.hostId !== conn.hostId) return safeSend(conn, { type: "ERROR", message: "host_mismatch" });
      // Preserve renderMode and renderHint from surface data
      if (!s.renderMode) s.renderMode = "live";
      room.surfaces.set(s.surfaceId, s);
      broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      return;
    }

    // ─── Smart Rendering: Surface Snapshot (host → clients) ───
    if (msg.type === "SURFACE_SNAPSHOT") {
      if (conn.role !== "host") return;
      const s = room.surfaces.get(msg.surfaceId);
      if (!s) return;
      // Update render mode on the surface
      s.renderMode = "snapshot";
      // Forward snapshot to all clients in the room
      for (const [, client] of room.users) {
        safeSend(client, { type: "SURFACE_SNAPSHOT", roomId: room.roomId, surfaceId: msg.surfaceId, snapshot: msg.snapshot, width: msg.width, height: msg.height });
      }
      return;
    }

    // ─── Smart Rendering: Render Mode Change (host → clients) ───
    if (msg.type === "RENDER_MODE_CHANGE") {
      if (conn.role !== "host") return;
      const s = room.surfaces.get(msg.surfaceId);
      if (!s) return;
      s.renderMode = msg.renderMode;
      // Broadcast to all clients
      for (const [, client] of room.users) {
        safeSend(client, { type: "RENDER_MODE_CHANGE", roomId: room.roomId, surfaceId: msg.surfaceId, renderMode: msg.renderMode });
      }
      return;
    }

    // ─── Smart Rendering: Resume Streaming (client → host) ───
    if (msg.type === "RESUME_STREAMING") {
      if (conn.role !== "client") return;
      const s = room.surfaces.get(msg.surfaceId);
      if (!s) return;
      // Forward to the owning host
      const hostConn = room.hosts.get(s.hostId);
      if (hostConn) {
        safeSend(hostConn, { type: "RESUME_STREAMING", roomId: room.roomId, surfaceId: msg.surfaceId, requestedBy: conn.userId });
      }
      return;
    }

    if (msg.type === "UNPUBLISH_SURFACE") {
      if (conn.role !== "host") return;
      room.surfaces.delete(msg.surfaceId);
      room.locks.delete(msg.surfaceId);
      broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      return;
    }

    if (msg.type === "REQUEST_CONTROL") {
      if (conn.role !== "client") return;
      const s = room.surfaces.get(msg.surfaceId);
      if (!s) return;

      if (!canView(s, conn.userId)) return safeSend(conn, { type: "CONTROL_DENIED", roomId: room.roomId, surfaceId: s.surfaceId, reason: "not_viewable" });
      if (!canControl(s, conn.userId)) return safeSend(conn, { type: "CONTROL_DENIED", roomId: room.roomId, surfaceId: s.surfaceId, reason: "not_allowed" });

      room.locks.set(s.surfaceId, { mode: "SOFT", userId: conn.userId, expiresAt: nowMs() + 60_000 });

      const cap = signCap({
        capType: "CONTROL",
        roomId: room.roomId,
        roomEpoch: epoch(room.roomId),
        surfaceId: s.surfaceId,
        userId: conn.userId,
        scopes: ["mouse", "keyboard", "wheel"],
        expiresAt: nowMs() + 300_000
      });

      broadcastRoom(room, { type: "CONTROL_GRANTED", roomId: room.roomId, surfaceId: s.surfaceId, userId: conn.userId, cap });
      return;
    }

    if (msg.type === "RELEASE_CONTROL") {
      if (conn.role !== "client") return;
      const lock = room.locks.get(msg.surfaceId);
      if (lock?.userId === conn.userId) {
        room.locks.delete(msg.surfaceId);
        broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
      }
      return;
    }

    if (msg.type === "SEND_INPUT") {
      if (conn.role !== "client") return;
      const s = room.surfaces.get(msg.surfaceId);
      if (!s) return;

      const lock = room.locks.get(s.surfaceId);
      if (!lock || lock.userId !== conn.userId || lock.expiresAt < nowMs()) return safeSend(conn, { type: "ERROR", message: "no_lock" });

      const capCheck = verifyCap(msg.cap);
      if (!capCheck.ok) return safeSend(conn, { type: "ERROR", message: "bad_cap:" + capCheck.reason });

      const cap = capCheck.payload;
      if (cap.capType !== "CONTROL" || cap.surfaceId !== s.surfaceId || cap.userId !== conn.userId || cap.roomId !== room.roomId) return safeSend(conn, { type: "ERROR", message: "cap_mismatch" });

      const hostConn = room.hosts.get(s.hostId);
      if (!hostConn) return safeSend(conn, { type: "ERROR", message: "host_offline" });

      safeSend(hostConn, { type: "FORWARD_INPUT", roomId: room.roomId, surfaceId: s.surfaceId, userId: conn.userId, input: msg.input, cap: msg.cap });

      lock.expiresAt = nowMs() + 60_000;
      room.locks.set(s.surfaceId, lock);
      return;
    }
  });

  ws.on("close", () => {
    if (!conn.roomId) return;
    const room = getRoom(conn.roomId);
    if (conn.role === "client" && conn.userId) room.users.delete(conn.userId);
    if (conn.role === "host" && conn.hostId) room.hosts.delete(conn.hostId);
    broadcastRoom(room, { type: "ROOM_STATE", roomId: room.roomId, state: roomState(room) });
  });
});

server.listen(PORT, () => {
  console.log(`[server] HTTP + WS running at http://localhost:${PORT}`);
  console.log(`[server] Client UI:    http://localhost:${PORT}`);
  console.log(`[server] Justin Notes: http://localhost:${PORT}/notes.html`);
  console.log(`[server] Health:       http://localhost:${PORT}/health`);
});
