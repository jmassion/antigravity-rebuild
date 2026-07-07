import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const galleryItems = [
  { id: 1, category: "studio", color: "from-purple/30 to-accent/20", label: { es: "Estudio Principal", en: "Main Studio" } },
  { id: 2, category: "student", color: "from-primary/20 to-gold-dark/20", label: { es: "Trabajo Estudiantil", en: "Student Work" } },
  { id: 3, category: "event", color: "from-accent/30 to-purple-light/20", label: { es: "Evento de Graduación", en: "Graduation Event" } },
  { id: 4, category: "studio", color: "from-navy-light/50 to-purple/20", label: { es: "Sala de Producción", en: "Production Room" } },
  { id: 5, category: "student", color: "from-primary/15 to-accent/15", label: { es: "Animación VFX", en: "VFX Animation" } },
  { id: 6, category: "event", color: "from-purple-light/20 to-primary/15", label: { es: "Workshop en Vivo", en: "Live Workshop" } },
];

const galleryCategories = [
  { key: "all", label: { es: "Todos", en: "All" } },
  { key: "studio", label: { es: "Estudio", en: "Studio" } },
  { key: "student", label: { es: "Estudiantes", en: "Students" } },
  { key: "event", label: { es: "Eventos", en: "Events" } },
];

export const GallerySection = () => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = filter === "all" ? galleryItems : galleryItems.filter((g) => g.category === filter);

  return (
    <section id="gallery" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("gallery", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic">{t("gallery", "subtitle")}</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {galleryCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-5 py-2 rounded-full text-sm font-body transition-all duration-300 ${
                filter === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground/60 hover:border-primary/40"
              }`}
            >
              {cat.label[language]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(item.id)}
              className={`aspect-square rounded-xl bg-gradient-to-br ${item.color} border border-border/30 cursor-pointer hover:border-primary/40 transition-all duration-500 flex items-center justify-center`}
            >
              <span className="font-body text-sm text-foreground/50">{item.label[language]}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <button className="absolute top-6 right-6 text-foreground/60 hover:text-foreground">
              <X className="w-8 h-8" />
            </button>
            <div className="w-full max-w-2xl aspect-video rounded-xl bg-gradient-to-br from-purple/30 to-primary/20 border border-border/30 flex items-center justify-center">
              <span className="text-foreground/40 font-body">
                {galleryItems.find((g) => g.id === selected)?.label[language]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
