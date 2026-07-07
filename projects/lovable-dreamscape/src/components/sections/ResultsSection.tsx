import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { motion } from "framer-motion";
import { ParallaxSprite } from "@/components/ParallaxSprite";
import tigerChampion from "@/assets/sprites/tiger-champion.png";

const resultKeys = ["result1", "result2", "result3", "result4", "result5"];

export const ResultsSection = () => {
  const { t, language } = useLanguage();

  return (
    <section id="results" className="py-24 md:py-32 relative section-bg-gradient sparkle-overlay overflow-hidden">
      {/* Champion tiger celebrating results */}
      <ParallaxSprite
        src={tigerChampion}
        className="hidden lg:block -right-2 top-20"
        size={200}
        parallaxY={-55}
        rotate={-4}
        opacity={0.75}
        glow="gold"
        floatDuration={6}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("results", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic max-w-2xl mx-auto">
            {t("results", "subtitle")}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          {/* Golden vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />

          <div className="space-y-10">
            {resultKeys.map((key, i) => {
              const items = (translations.results as any)[`${key}Items`][language] as string[];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="relative pl-16 md:pl-20"
                >
                  {/* Golden timeline dot */}
                  <div className="absolute left-4 md:left-6 top-1 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-[0_0_15px_rgba(212,175,55,0.6)]" />

                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {t("results", key)}
                  </h3>
                  <ul className="space-y-2">
                    {items.map((item, j) => (
                      <li key={j} className="font-body text-sm text-foreground/60 flex items-start gap-2">
                        <span className="text-primary mt-1 text-xs">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
