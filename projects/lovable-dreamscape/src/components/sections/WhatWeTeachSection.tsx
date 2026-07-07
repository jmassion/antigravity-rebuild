import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { PurpleAccentOrb, GoldenAccentOrb } from "@/components/SectionAccents";

export const WhatWeTeachSection = () => {
  const { t, language } = useLanguage();
  const dontItems = translations.whatWeTeach.dontItems[language];
  const doItems = translations.whatWeTeach.doItems[language];

  return (
    <section className="py-24 md:py-32 relative sparkle-overlay section-glow-border overflow-hidden">
      <PurpleAccentOrb className="-top-20 -left-32 z-0" size={400} opacity={0.07} />
      <GoldenAccentOrb className="-bottom-24 -right-20 z-0" size={350} opacity={0.05} />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("whatWeTeach", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic max-w-2xl mx-auto">
            {t("whatWeTeach", "subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, rotateY: 10 }}
            whileInView={{ opacity: 1, rotateY: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="p-8 rounded-xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm ornate-corner"
            style={{ borderColor: 'hsl(var(--destructive) / 0.2)' } as React.CSSProperties}
          >
            <h3 className="font-display text-2xl font-semibold text-destructive mb-6">
              {t("whatWeTeach", "dontTeach")}
            </h3>
            <ul className="space-y-4">
              {dontItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3 font-body text-foreground/70"
                >
                  <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotateY: -10 }}
            whileInView={{ opacity: 1, rotateY: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="p-8 rounded-xl border border-primary/25 bg-primary/5 backdrop-blur-sm ornate-corner"
            style={{ borderColor: 'hsl(var(--primary) / 0.25)' } as React.CSSProperties}
          >
            <h3 className="font-display text-2xl font-semibold text-primary mb-6">
              {t("whatWeTeach", "doTeach")}
            </h3>
            <ul className="space-y-4">
              {doItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3 font-body text-foreground/70"
                >
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
