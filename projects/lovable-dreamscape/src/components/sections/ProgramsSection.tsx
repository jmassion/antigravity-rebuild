import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, BarChart3 } from "lucide-react";

const coursesData = [
  {
    id: 1,
    category: "animation",
    title: { es: "Animación 3D Avanzada", en: "Advanced 3D Animation" },
    description: {
      es: "Domina técnicas de animación de personajes y cinemáticas con herramientas profesionales.",
      en: "Master character animation and cinematic techniques with professional tools.",
    },
    duration: { es: "6 meses", en: "6 months" },
    level: { es: "Avanzado", en: "Advanced" },
  },
  {
    id: 2,
    category: "vfx",
    title: { es: "Efectos Visuales para Cine", en: "Visual Effects for Film" },
    description: {
      es: "Aprende composición, tracking y efectos especiales para producciones cinematográficas.",
      en: "Learn compositing, tracking, and special effects for film productions.",
    },
    duration: { es: "8 meses", en: "8 months" },
    level: { es: "Intermedio", en: "Intermediate" },
  },
  {
    id: 3,
    category: "production",
    title: { es: "Producción Audiovisual", en: "Audiovisual Production" },
    description: {
      es: "Pipeline completo desde preproducción hasta postproducción y entrega final.",
      en: "Complete pipeline from pre-production to post-production and final delivery.",
    },
    duration: { es: "10 meses", en: "10 months" },
    level: { es: "Todos los niveles", en: "All Levels" },
  },
  {
    id: 4,
    category: "animation",
    title: { es: "Motion Graphics", en: "Motion Graphics" },
    description: {
      es: "Crea gráficos en movimiento impactantes para publicidad, televisión y redes sociales.",
      en: "Create stunning motion graphics for advertising, television, and social media.",
    },
    duration: { es: "4 meses", en: "4 months" },
    level: { es: "Principiante", en: "Beginner" },
  },
];

const categories = [
  { key: "all", label: { es: "Todos", en: "All" } },
  { key: "animation", label: { es: "Animación", en: "Animation" } },
  { key: "vfx", label: { es: "VFX", en: "VFX" } },
  { key: "production", label: { es: "Producción", en: "Production" } },
];

export const ProgramsSection = () => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? coursesData : coursesData.filter((c) => c.category === filter);

  return (
    <section id="programs" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("programs", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic">
            {t("programs", "subtitle")}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-5 py-2 rounded-full text-sm font-body transition-all duration-300 ${
                filter === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground/60 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat.label[language]}
            </button>
          ))}
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:glow-gold transition-all duration-500"
            >
              <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {course.title[language]}
              </h3>
              <p className="font-body text-foreground/60 text-sm mb-4 leading-relaxed">
                {course.description[language]}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {course.duration[language]}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" /> {course.level[language]}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="font-display text-xs tracking-wider uppercase border-primary/30 text-primary hover:bg-primary/10"
              >
                {t("programs", "learnMore")}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
