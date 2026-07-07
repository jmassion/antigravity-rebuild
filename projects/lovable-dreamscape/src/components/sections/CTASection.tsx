import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { BookOpen, Building, User } from "lucide-react";
import ctaPage from "@/assets/cta-page.jpg";
import { ParallaxSprite } from "@/components/ParallaxSprite";
import tigerHero from "@/assets/sprites/tiger-hero.png";

const tracks = [
  { titleKey: "gameTitle", textKey: "gameText", icon: BookOpen },
  { titleKey: "institutionsTitle", textKey: "institutionsText", icon: Building },
  { titleKey: "studentsTitle", textKey: "studentsText", icon: User },
];

export const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden section-bg-gradient">
      {/* Background from PDF */}
      <div className="absolute inset-0 z-0 opacity-[0.06]">
        <img src={ctaPage} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none z-[1]" />

      {/* Superhero tiger for the CTA */}
      <ParallaxSprite
        src={tigerHero}
        className="hidden lg:block -left-2 top-16"
        size={220}
        parallaxY={-50}
        rotate={5}
        opacity={0.8}
        glow="gold"
        floatDuration={5}
      />
      <ParallaxSprite
        src={tigerHero}
        className="hidden lg:block -right-4 bottom-16"
        size={160}
        parallaxY={-30}
        parallaxX={15}
        rotate={-8}
        opacity={0.5}
        glow="purple"
        floatDuration={9}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-6"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("cta", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-lg md:text-xl text-foreground/60 italic max-w-3xl mx-auto">
            {t("cta", "subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {tracks.map(({ titleKey, textKey, icon: Icon }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-6 rounded-xl golden-border backdrop-blur-sm text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {t("cta", titleKey)}
              </h3>
              <p className="font-body text-sm text-foreground/60 leading-relaxed">
                {t("cta", textKey)}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="px-14 py-5 font-display text-lg font-bold tracking-widest uppercase bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 glow-gold hover:shadow-[0_0_60px_rgba(212,175,55,0.5)]"
          >
            {t("cta", "joinNow")}
          </button>
        </motion.div>
      </div>
    </section>
  );
};
