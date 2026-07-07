import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, TrendingDown, Zap, X, Check } from "lucide-react";
import challengePage from "@/assets/challenge-page.jpg";
import { ParallaxSprite, ParallaxLayer } from "@/components/ParallaxSprite";
import tigerDetective from "@/assets/sprites/tiger-detective.png";

const blocks = [
  { key: "problem", icon: AlertTriangle, accent: "text-destructive" },
  { key: "reality", icon: Eye, accent: "text-primary" },
  { key: "result", icon: TrendingDown, accent: "text-destructive" },
  { key: "gap", icon: Zap, accent: "text-primary" },
] as const;

export const ChallengeSection = () => {
  const { t, language } = useLanguage();
  const toolItems = translations.challenge.toolBasedItems[language];
  const processItems = translations.challenge.processBasedItems[language];

  return (
    <section id="challenge" className="py-24 md:py-32 relative section-bg-gradient-alt sparkle-overlay overflow-hidden">
      {/* Decorative BG image */}
      <div className="absolute inset-0 z-0 opacity-[0.04]">
        <img src={challengePage} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Parallax character sprite */}
      <ParallaxSprite
        src={tigerDetective}
        className="hidden lg:block -right-4 top-16"
        size={220}
        parallaxY={-40}
        rotate={-5}
        opacity={0.75}
        glow="gold"
        floatDuration={7}
      />
      <ParallaxLayer className="inset-0 z-0" speed={0.15}>
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full bg-destructive/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px]" />
      </ParallaxLayer>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("challenge", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic max-w-2xl mx-auto">
            {t("challenge", "subtitle")}
          </p>
        </motion.div>

        {/* Four problem blocks */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {blocks.map(({ key, icon: Icon, accent }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: i < 2 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="p-6 rounded-xl golden-border backdrop-blur-sm group"
            >
              <Icon className={`w-8 h-8 ${accent} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {t("challenge", key)}
              </h3>
              <p className="font-body text-sm text-foreground/60 leading-relaxed">
                {t("challenge", `${key}Text`)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Comparison: Tool vs Process */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="p-8 rounded-xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm ornate-corner"
            style={{ borderColor: 'hsl(var(--destructive) / 0.2)' } as React.CSSProperties}
          >
            <h3 className="font-display text-xl font-semibold text-destructive mb-6">
              {t("challenge", "toolBased")}
            </h3>
            <ul className="space-y-3">
              {toolItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 font-body text-foreground/70"
                >
                  <X className="w-5 h-5 text-destructive shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="p-8 rounded-xl border border-primary/25 bg-primary/5 backdrop-blur-sm ornate-corner"
            style={{ borderColor: 'hsl(var(--primary) / 0.25)' } as React.CSSProperties}
          >
            <h3 className="font-display text-xl font-semibold text-primary mb-6">
              {t("challenge", "processBased")}
            </h3>
            <ul className="space-y-3">
              {processItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 font-body text-foreground/70"
                >
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
