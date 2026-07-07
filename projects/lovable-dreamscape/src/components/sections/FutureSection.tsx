import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { motion } from "framer-motion";
import { RefreshCw, Globe, Heart, Handshake, BarChart3 } from "lucide-react";
import purpleGoldBg from "@/assets/purple-gold-bg.jpg";
import { ParallaxSprite } from "@/components/ParallaxSprite";
import tigerExplorer from "@/assets/sprites/tiger-explorer.png";

const pillars = [
  { key: "pillar1", icon: RefreshCw },
  { key: "pillar2", icon: Globe },
  { key: "pillar3", icon: Heart },
  { key: "pillar4", icon: Handshake },
  { key: "pillar5", icon: BarChart3 },
];

export const FutureSection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.08]">
        <img src={purpleGoldBg} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-background/90 z-[1]" />

      {/* Space explorer tiger for the future */}
      <ParallaxSprite
        src={tigerExplorer}
        className="hidden lg:block -right-6 bottom-20"
        size={210}
        parallaxY={-40}
        rotate={-6}
        opacity={0.7}
        glow="purple"
        floatDuration={8}
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
            {t("future", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic max-w-2xl mx-auto">
            {t("future", "subtitle")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map(({ key, icon: Icon }, i) => {
            const items = (translations.future as any)[`${key}Items`][language] as string[];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-xl golden-border backdrop-blur-sm transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                  {t("future", key)}
                </h3>
                <ul className="space-y-2">
                  {items.map((item, j) => (
                    <li key={j} className="font-body text-sm text-foreground/60 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
