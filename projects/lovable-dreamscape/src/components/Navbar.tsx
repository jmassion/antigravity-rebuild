import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["home", "about", "pipeline", "method", "results", "programs", "pricing", "contact"] as const;

const sectionIds: Record<string, string> = {
  home: "hero",
  about: "about",
  pipeline: "pipeline",
  method: "method",
  results: "results",
  programs: "programs",
  pricing: "pricing",
  contact: "contact",
};

export const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <button onClick={() => scrollTo("hero")} className="font-display text-xl font-bold text-gradient-gold tracking-wider">
          WTS
        </button>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((key) => (
            <button
              key={key}
              onClick={() => scrollTo(sectionIds[key])}
              className="text-sm font-body text-foreground/60 hover:text-primary transition-colors duration-300"
            >
              {t("nav", key)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="text-xs font-display font-semibold px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            {language === "es" ? "EN" : "ES"}
          </button>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass border-t border-primary/10"
          >
            <div className="flex flex-col items-center gap-4 py-6">
              {navLinks.map((key) => (
                <button
                  key={key}
                  onClick={() => scrollTo(sectionIds[key])}
                  className="text-base font-body text-foreground/70 hover:text-primary transition-colors"
                >
                  {t("nav", key)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
