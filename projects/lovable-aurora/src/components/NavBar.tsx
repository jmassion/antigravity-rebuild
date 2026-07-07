import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, Menu, X, ArrowRight } from "lucide-react";

interface NavLink { label: string; path: string; badge?: string; }

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Workspace", path: "/workspace" },
  { label: "Nodes", path: "/nodes" },
  { label: "Flow 3D", path: "/flow", badge: "3D" },
  { label: "HyperTalk", path: "/hypertalk" },
  { label: "Worlds", path: "/worlds" },
  { label: "Marketplace", path: "/marketplace", badge: "New" },
  { label: "Studio", path: "/studio" },
  { label: "Docs", path: "/docs" },
  { label: "Connectors", path: "/connectors" },
];

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "hsl(var(--background) / 0.85)"
            : "hsl(var(--background) / 0.4)",
          backdropFilter: "blur(16px)",
          borderBottom: scrolled
            ? "1px solid hsl(var(--border) / 0.8)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 24px hsl(var(--primary) / 0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <Hexagon size={12} className="text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight text-sm hidden sm:block">
              HyperCard <span className="text-gradient">∞</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    color: active
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground))",
                    background: active ? "hsl(var(--primary) / 0.08)" : "transparent",
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "hsl(var(--primary) / 0.1)",
                        border: "1px solid hsl(var(--primary) / 0.25)",
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {link.label}
                    {(link as NavLink).badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: "hsl(var(--node-event) / 0.2)", color: "hsl(var(--node-event))" }}>
                        {(link as NavLink).badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CTA + avatar + hamburger */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate("/workspace")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Enter World
              <ArrowRight size={11} />
            </button>
            {/* User avatar */}
            <div
              className="hidden sm:flex w-7 h-7 rounded-full items-center justify-center text-[10px] font-bold flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.4)" }}
            >
              HC
            </div>
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <X size={16} className="text-foreground" />
              ) : (
                <Menu size={16} className="text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-12 inset-x-0 z-40 lg:hidden"
            style={{
              background: "hsl(var(--background) / 0.95)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: active ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      background: active ? "hsl(var(--primary) / 0.08)" : "transparent",
                    }}
                  >
                    {link.label}
                  </button>
                );
              })}
              <button
                onClick={() => navigate("/workspace")}
                className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold"
              >
                Enter World <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
