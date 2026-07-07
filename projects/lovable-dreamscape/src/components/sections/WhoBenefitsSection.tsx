import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { motion } from "framer-motion";
import { Palette, Briefcase, Rocket, GraduationCap, Sparkles } from "lucide-react";
import { ParallaxSprite } from "@/components/ParallaxSprite";
import tigerMentor from "@/assets/sprites/tiger-mentor.png";

const profiles = [
  { key: "profile1", icon: Palette },
  { key: "profile2", icon: Briefcase },
  { key: "profile3", icon: Rocket },
  { key: "profile4", icon: GraduationCap },
  { key: "profile5", icon: Sparkles },
];

export const WhoBenefitsSection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-24 md:py-32 relative section-bg-gradient-alt sparkle-overlay overflow-hidden">
      {/* Welcoming mentor tiger */}
      <ParallaxSprite
        src={tigerMentor}
        className="hidden lg:block -left-4 top-32"
        size={200}
        parallaxY={-50}
        rotate={4}
        opacity={0.7}
        glow="gold"
        floatDuration={7}
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
            {t("whoBenefits", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic max-w-2xl mx-auto">
            {t("whoBenefits", "subtitle")}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {profiles.map(({ key, icon: Icon }, i) => {
            const items = (translations.whoBenefits as any)[`${key}Items`][language] as string[];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-6 rounded-xl golden-border backdrop-blur-sm flex gap-5"
              >
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {t("whoBenefits", key)}
                  </h3>
                  <ul className="space-y-1">
                    {items.map((item, j) => (
                      <li key={j} className="font-body text-sm text-foreground/60 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
