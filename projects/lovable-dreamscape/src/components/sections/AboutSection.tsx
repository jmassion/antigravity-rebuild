import { useLanguage } from "@/i18n/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Eye, Target, Layers, Clock, Lightbulb, Gamepad2, Sparkles } from "lucide-react";
import philosophyPage from "@/assets/philosophy-page.jpg";
import { ParallaxSprite, ParallaxLayer } from "@/components/ParallaxSprite";
import tigerProfessor from "@/assets/sprites/tiger-professor.png";
import { PurpleAccentOrb, GoldenAccentOrb } from "@/components/SectionAccents";

const principles = [
  { icon: Layers, titleKey: "principle1", textKey: "principle1Text", color: "from-primary/20 to-primary/5" },
  { icon: Lightbulb, titleKey: "principle2", textKey: "principle2Text", color: "from-purple-glow/20 to-purple/5" },
  { icon: Eye, titleKey: "principle3", textKey: "principle3Text", color: "from-primary/20 to-primary/5" },
  { icon: Clock, titleKey: "principle4", textKey: "principle4Text", color: "from-purple-glow/20 to-purple/5" },
  { icon: Gamepad2, titleKey: "principle5", textKey: "principle5Text", color: "from-primary/20 to-primary/5" },
];

/* Animated number counter */
const AnimatedCounter = ({ value, label }: { value: string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, type: "spring" }}
    className="text-center"
  >
    <span className="font-display text-4xl md:text-5xl font-bold text-gradient-gold">{value}</span>
    <p className="font-body text-xs text-foreground/50 mt-1 uppercase tracking-wider">{label}</p>
  </motion.div>
);

export const AboutSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-28 md:py-40 relative section-bg-gradient section-glow-border overflow-hidden"
    >
      {/* Parallax background image */}
      <motion.div className="absolute inset-0 z-0 opacity-[0.05]" style={{ y: bgY }}>
        <img src={philosophyPage} alt="" className="w-full h-full object-cover scale-110" />
      </motion.div>

      {/* Atmospheric orbs */}
      <PurpleAccentOrb className="-top-32 -right-32 z-0" size={500} opacity={0.06} />
      <GoldenAccentOrb className="-bottom-40 -left-40 z-0" size={450} opacity={0.04} />
      <ParallaxLayer className="inset-0 z-0" speed={0.15}>
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-glow/4 blur-[100px]" />
      </ParallaxLayer>

      {/* Character sprite */}
      <ParallaxSprite
        src={tigerProfessor}
        className="hidden xl:block -left-4 bottom-32"
        size={220}
        parallaxY={-50}
        rotate={5}
        opacity={0.75}
        glow="gold"
        floatDuration={8}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header with sparkle icon */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary mx-auto" />
          </motion.div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-gradient-gold mb-4">
            {t("about", "title")}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="w-24 h-px bg-primary/40" />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <p className="font-elegant text-xl md:text-2xl text-foreground/60 italic max-w-3xl mx-auto">
            {t("about", "subtitle")}
          </p>
        </motion.div>

        {/* Philosophy hero — image + description split */}
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto mb-24">
          {/* Image with animated border frame */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: 5 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            {/* Glow behind image */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/15 via-purple-glow/10 to-primary/5 blur-[50px] rounded-3xl group-hover:blur-[60px] transition-all duration-700" />

            {/* Animated corner accents */}
            <div className="absolute -top-2 -left-2 w-12 h-12 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 border-purple-glow/40 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-2 border-l-2 border-purple-glow/40 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />

            <img
              src={philosophyPage}
              alt="White Tiger Studios Philosophy"
              className="relative rounded-2xl border border-primary/15 shadow-2xl w-full max-h-[520px] object-cover"
            />

            {/* Shimmer overlay */}
            <div className="absolute inset-0 rounded-2xl shimmer pointer-events-none" />
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="text-foreground/70 font-body text-lg leading-relaxed mb-10">
              {t("about", "description")}
            </p>

            {/* Vision & Mission with animated connecting line */}
            <div className="relative space-y-8 pl-6 border-l border-primary/20">
              {[
                { icon: Eye, titleKey: "vision", textKey: "visionText", accent: "bg-primary" },
                { icon: Target, titleKey: "mission", textKey: "missionText", accent: "bg-purple-glow" },
              ].map(({ icon: Icon, titleKey, textKey, accent }, idx) => (
                <motion.div
                  key={titleKey}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.15 }}
                  className="relative flex gap-4 items-start"
                >
                  {/* Dot on the line */}
                  <div className={`absolute -left-[30px] top-2 w-3 h-3 rounded-full ${accent} shadow-[0_0_10px_currentColor]`} />
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-purple/10 flex items-center justify-center shrink-0 border border-primary/15">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      {t("about", titleKey)}
                    </h3>
                    <p className="font-body text-sm text-foreground/55 leading-relaxed">
                      {t("about", textKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center gap-12 md:gap-20 mb-24 py-8 px-6 rounded-2xl golden-border backdrop-blur-sm max-w-3xl mx-auto"
        >
          <AnimatedCounter value="5" label={t("about", "principlesLabel") || "Principles"} />
          <div className="w-px bg-primary/20" />
          <AnimatedCounter value="8" label={t("about", "stagesLabel") || "Pipeline Stages"} />
          <div className="w-px bg-primary/20" />
          <AnimatedCounter value="∞" label={t("about", "creativityLabel") || "Creativity"} />
        </motion.div>

        {/* 5 Core Principles — animated orbit-style reveal */}
        <div className="relative max-w-5xl mx-auto">
          {/* Section subheading */}
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-semibold text-center text-foreground/80 mb-12"
          >
            {t("about", "principlesHeading") || "Core Principles"}
          </motion.h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map(({ icon: Icon, titleKey, textKey, color }, i) => (
              <motion.div
                key={titleKey}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, type: "spring", stiffness: 100 }}
                className="group relative p-7 rounded-2xl golden-border backdrop-blur-sm hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-500"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Number badge */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-card border border-primary/30 flex items-center justify-center z-10">
                  <span className="font-display text-xs font-bold text-primary">{i + 1}</span>
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple/10 flex items-center justify-center mb-5 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.25)] transition-all duration-500 border border-primary/10">
                    <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-foreground mb-2">
                    {t("about", titleKey)}
                  </h4>
                  <p className="font-body text-sm text-foreground/55 leading-relaxed">
                    {t("about", textKey)}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Philosophy quote card in the 6th slot */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 100 }}
              className="hidden lg:flex p-7 rounded-2xl bg-gradient-to-br from-primary/10 via-purple/5 to-card border border-primary/20 items-center justify-center text-center"
            >
              <div>
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="font-elegant text-lg italic text-foreground/60 leading-relaxed">
                  "{t("about", "philosophyQuote") || "We don't teach tools that change. We teach principles that endure."}"
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
