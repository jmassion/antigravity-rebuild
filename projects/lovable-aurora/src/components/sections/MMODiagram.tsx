import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const HEX_ROWS = 5;
const HEX_COLS = 8;

interface HexZone {
  row: number;
  col: number;
  users: number;
  active: boolean;
  type: "webrtc" | "sfu" | "empty";
}

function hexToXY(row: number, col: number, size: number) {
  const w = size * 2;
  const h = Math.sqrt(3) * size;
  const x = col * w * 0.75;
  const y = row * h + (col % 2 === 0 ? 0 : h / 2);
  return { x, y };
}

function HexCell({ zone, size, onClick, selected }: { zone: HexZone; size: number; onClick: () => void; selected: boolean }) {
  const { x, y } = hexToXY(zone.row, zone.col, size);
  const cx = x + size;
  const cy = y + size * Math.sqrt(3) / 2;

  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + size * 0.85 * Math.cos(angle)},${cy + size * 0.85 * Math.sin(angle)}`;
  }).join(" ");

  const color = zone.type === "webrtc" ? "hsl(var(--node-event))"
    : zone.type === "sfu" ? "hsl(var(--node-agent))"
      : zone.active ? "hsl(var(--node-data))"
        : "hsl(var(--border))";

  const fillOpacity = zone.active ? 0.15 + zone.users * 0.04 : 0.04;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <polygon
        points={points}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeOpacity={selected ? 0.8 : zone.active ? 0.4 : 0.15}
        strokeWidth={selected ? 1.5 : 1}
      />
      {zone.active && zone.users > 0 && (
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize={8} fill={color} fillOpacity={0.8}>
          {zone.users}
        </text>
      )}
      {selected && (
        <polygon
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.9}
        />
      )}
    </g>
  );
}

export function MMODiagram() {
  const [zones, setZones] = useState<HexZone[]>(() =>
    Array.from({ length: HEX_ROWS * HEX_COLS }, (_, i) => ({
      row: Math.floor(i / HEX_COLS),
      col: i % HEX_COLS,
      users: 0,
      active: Math.random() > 0.5,
      type: Math.random() > 0.8 ? "webrtc" : Math.random() > 0.6 ? "sfu" : "empty",
    }))
  );
  const [selectedZone, setSelectedZone] = useState<number | null>(3);
  const [totalUsers, setTotalUsers] = useState(0);
  const counterRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setZones((prev) => prev.map((z) => {
        if (!z.active) return z;
        const delta = Math.floor(Math.random() * 3) - 1;
        return { ...z, users: Math.max(0, Math.min(12, z.users + delta)) };
      }));
      counterRef.current += Math.floor(Math.random() * 8 + 2);
      setTotalUsers(counterRef.current);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const HEX_SIZE = 28;
  const svgW = HEX_COLS * HEX_SIZE * 1.5 + HEX_SIZE;
  const svgH = HEX_ROWS * HEX_SIZE * Math.sqrt(3) + HEX_SIZE;
  const selected = selectedZone !== null ? zones[selectedZone] : null;

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="text-xs uppercase tracking-widest text-presence-2 mb-3">Layer 3</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">MMO-Scale </span>
            <span className="text-gradient">Architecture</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Spatial sharding divides every World into hexagonal zones. Users only receive updates for their visible zone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Hex grid */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <div className="px-4 py-2.5 border-b border-border/50 flex items-center gap-3">
                <div className="text-[11px] font-mono text-muted-foreground">world://main — spatial shard map</div>
                <div className="ml-auto flex items-center gap-2">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ background: "hsl(var(--node-spatial))" }}
                  />
                  <span className="text-[10px] font-mono" style={{ color: "hsl(var(--node-spatial))" }}>
                    {totalUsers.toLocaleString()} users total
                  </span>
                </div>
              </div>
              <div className="p-4 overflow-x-auto">
                <svg width={svgW} height={svgH} style={{ display: "block", margin: "0 auto" }}>
                  {zones.map((zone, i) => (
                    <HexCell
                      key={i}
                      zone={zone}
                      size={HEX_SIZE}
                      onClick={() => setSelectedZone(i === selectedZone ? null : i)}
                      selected={i === selectedZone}
                    />
                  ))}
                </svg>
              </div>
              {/* Legend */}
              <div className="px-4 pb-3 flex flex-wrap gap-4">
                {[
                  { color: "hsl(var(--node-event))", label: "WebRTC mesh (<8 users)" },
                  { color: "hsl(var(--node-agent))", label: "SFU relay (large rooms)" },
                  { color: "hsl(var(--node-data))", label: "Active zone" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: l.color, opacity: 0.5 }} />
                    <span className="text-[10px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            {/* Selected zone info */}
            {selected && (
              <motion.div
                key={selectedZone}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--node-event)/0.3)" }}
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Selected Zone</div>
                <div className="text-sm font-semibold text-foreground mb-1">
                  Zone [{selected.row},{selected.col}]
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Users", value: selected.users, color: "hsl(var(--node-data))" },
                    { label: "Mode", value: selected.type === "webrtc" ? "WebRTC mesh" : selected.type === "sfu" ? "SFU relay" : "Idle", color: "hsl(var(--node-event))" },
                    { label: "Status", value: selected.active ? "Active" : "Empty", color: "hsl(var(--node-spatial))" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-[11px] text-muted-foreground">{r.label}</span>
                      <span className="text-[11px] font-mono" style={{ color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stats */}
            {[
              { label: "Sync Latency", value: "~1ms", color: "hsl(var(--node-data))", desc: "CRDT delta over WebRTC" },
              { label: "Conflict Rate", value: "0%", color: "hsl(var(--node-spatial))", desc: "Automerge CRDT" },
              { label: "Max Zone Size", value: "∞", color: "hsl(var(--node-event))", desc: "SFU relay scales up" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  <span className="text-base font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
                <div className="text-[10px] text-muted-foreground/60">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
