import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Globe, Layout, Layers, Square, Plus, Eye, EyeOff, Lock } from "lucide-react";

interface TreeNode {
  id: string;
  label: string;
  type: "world" | "space" | "stack" | "card";
  children?: TreeNode[];
  active?: boolean;
  locked?: boolean;
  visible?: boolean;
}

const TREE: TreeNode[] = [
  {
    id: "w1", label: "Main World", type: "world", children: [
      {
        id: "s1", label: "Dashboard Space", type: "space", active: true, children: [
          {
            id: "st1", label: "Auth Stack", type: "stack", children: [
              { id: "c1", label: "Login Card", type: "card", active: true },
              { id: "c2", label: "Signup Card", type: "card" },
            ]
          },
          {
            id: "st2", label: "Data Stack", type: "stack", children: [
              { id: "c3", label: "User Profile", type: "card" },
              { id: "c4", label: "Settings Card", type: "card" },
            ]
          },
        ]
      },
      {
        id: "s2", label: "Onboarding Space", type: "space", children: [
          {
            id: "st3", label: "Welcome Stack", type: "stack", children: [
              { id: "c5", label: "Intro Card", type: "card" },
              { id: "c6", label: "Setup Card", type: "card" },
            ]
          },
        ]
      },
    ]
  },
];

const TYPE_ICONS = {
  world: Globe,
  space: Layout,
  stack: Layers,
  card: Square,
};

const TYPE_COLORS = {
  world: "hsl(var(--node-spatial))",
  space: "hsl(var(--node-event))",
  stack: "hsl(var(--node-data))",
  card: "hsl(var(--node-media))",
};

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const [visible, setVisible] = useState(true);
  const Icon = TYPE_ICONS[node.type];
  const color = TYPE_COLORS[node.type];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer group transition-all"
        style={{
          paddingLeft: `${8 + depth * 14}px`,
          background: node.active ? `${color}15` : "transparent",
          border: node.active ? `1px solid ${color}30` : "1px solid transparent",
        }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={10} className="text-muted-foreground" />
          </motion.div>
        ) : (
          <div className="w-2.5" />
        )}
        <Icon size={11} style={{ color, opacity: visible ? 1 : 0.3 }} />
        <span
          className="text-xs flex-1 truncate"
          style={{ color: node.active ? color : "hsl(var(--foreground) / 0.75)" }}
        >
          {node.label}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); setVisible(!visible); }}
          >
            {visible
              ? <Eye size={9} className="text-muted-foreground" />
              : <EyeOff size={9} className="text-muted-foreground/40" />
            }
          </button>
          {node.locked && <Lock size={9} style={{ color: "hsl(var(--node-media))" }} />}
        </div>
      </div>
      <AnimatePresence>
        {open && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {node.children.map((child) => (
              <TreeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WorkspaceSidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: "hsl(var(--sidebar-background))",
        borderRight: "1px solid hsl(var(--sidebar-border))",
        width: collapsed ? 0 : 220,
        overflow: "hidden",
        transition: "width 0.2s ease",
      }}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-sidebar-border flex items-center justify-between">
        <span className="text-xs font-semibold text-sidebar-foreground uppercase tracking-widest">Hierarchy</span>
        <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
          <Plus size={11} className="text-sidebar-foreground" />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {TREE.map((node) => (
          <TreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <div className="text-[10px] text-muted-foreground">4 users · 2 spaces · 6 cards</div>
      </div>
    </div>
  );
}
