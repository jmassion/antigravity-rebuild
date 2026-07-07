import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: { es: "El Futuro de la Animación con IA", en: "The Future of Animation with AI" },
    excerpt: {
      es: "Exploramos cómo la inteligencia artificial está transformando la industria de la animación.",
      en: "We explore how artificial intelligence is transforming the animation industry.",
    },
    date: "2026-02-15",
    category: { es: "Tecnología", en: "Technology" },
  },
  {
    id: 2,
    title: { es: "Pipeline de VFX: De la Idea a la Pantalla", en: "VFX Pipeline: From Idea to Screen" },
    excerpt: {
      es: "Una guía completa del proceso de efectos visuales en producciones cinematográficas.",
      en: "A comprehensive guide to the visual effects process in film productions.",
    },
    date: "2026-02-10",
    category: { es: "Educación", en: "Education" },
  },
  {
    id: 3,
    title: { es: "Tendencias en Motion Design 2026", en: "Motion Design Trends 2026" },
    excerpt: {
      es: "Las tendencias más relevantes que están definiendo el motion design este año.",
      en: "The most relevant trends defining motion design this year.",
    },
    date: "2026-02-05",
    category: { es: "Diseño", en: "Design" },
  },
];

export const BlogSection = () => {
  const { language, t } = useLanguage();

  return (
    <section id="blog" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("blog", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
            >
              <span className="text-xs font-body text-primary uppercase tracking-wider">
                {post.category[language]}
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors">
                {post.title[language]}
              </h3>
              <p className="font-body text-sm text-foreground/60 mb-4 leading-relaxed">
                {post.excerpt[language]}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <Button variant="ghost" size="sm" className="text-primary text-xs gap-1 p-0 h-auto">
                  {t("blog", "readMore")} <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
