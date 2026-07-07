import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "María González",
    course: { es: "Animación 3D Avanzada", en: "Advanced 3D Animation" },
    quote: {
      es: "White Tiger Studios transformó mi carrera. El enfoque práctico y la calidad de instrucción son incomparables.",
      en: "White Tiger Studios transformed my career. The hands-on approach and quality of instruction are unmatched.",
    },
    rating: 5,
  },
  {
    name: "Carlos Mendez",
    course: { es: "Efectos Visuales para Cine", en: "Visual Effects for Film" },
    quote: {
      es: "Aprendí más en 6 meses aquí que en 4 años de universidad. El pipeline completo marca la diferencia.",
      en: "I learned more in 6 months here than in 4 years of university. The complete pipeline makes the difference.",
    },
    rating: 5,
  },
  {
    name: "Ana Rivera",
    course: { es: "Motion Graphics", en: "Motion Graphics" },
    quote: {
      es: "La mentoría personalizada y la comunidad de estudiantes hacen de esta una experiencia única.",
      en: "The personalized mentorship and student community make this a unique experience.",
    },
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const { language, t } = useLanguage();

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("testimonials", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="font-elegant text-lg italic text-foreground/70 mb-4">
                "{item.quote[language]}"
              </p>
              <div>
                <p className="font-body font-semibold text-foreground text-sm">{item.name}</p>
                <p className="font-body text-xs text-muted-foreground">{item.course[language]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
