import { useLanguage } from "@/i18n/LanguageContext";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  BookOpen, Clapperboard, Film, Scissors, Megaphone, Globe, DollarSign, Crown,
} from "lucide-react";
import pipelinePage from "@/assets/pipeline-page.jpg";
import { ParallaxSprite } from "@/components/ParallaxSprite";
import tigerConductor from "@/assets/sprites/tiger-conductor.png";
import { PurpleAccentOrb, GoldenAccentOrb } from "@/components/SectionAccents";

const stages = [
  { key: "stage1", icon: BookOpen, angle: 0 },
  { key: "stage2", icon: Clapperboard, angle: 45 },
  { key: "stage3", icon: Film, angle: 90 },
  { key: "stage4", icon: Scissors, angle: 135 },
  { key: "stage5", icon: Megaphone, angle: 180 },
  { key: "stage6", icon: Globe, angle: 225 },
  { key: "stage7", icon: DollarSign, angle: 270 },
  { key: "stage8", icon: Crown, angle: 315 },
];

/* Animated flowing arc between nodes */
const FlowingArc = ({ progress }: { progress: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="pipeGoldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(42 78% 70%)" />
        <stop offset="50%" stopColor="hsl(275 60% 50%)" />
        <stop offset="100%" stopColor="hsl(42 78% 40%)" />
      </linearGradient>
      <filter id="pipeGlow">
        <feGaussianBlur stdDeviation="0.8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Outer ring */}
    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#pipeGoldGrad)" strokeWidth="0.4" strokeDasharray="3 2" opacity="0.4" />

    {/* Inner ring */}
    <circle cx="50" cy="50" r="30" fill="none" stroke="url(#pipeGoldGrad)" strokeWidth="0.2" strokeDasharray="1 3" opacity="0.2" />

    {/* Animated flow indicator on outer ring */}
    <circle
      cx="50"
      cy="50"
      r="42"
      fill="none"
      stroke="hsl(42 78% 60%)"
      strokeWidth="0.8"
      strokeDasharray="8 118"
      strokeDashoffset={-progress * 126}
      strokeLinecap="round"
      filter="url(#pipeGlow)"
      opacity="0.7"
    />

    {/* Radial spokes to each node */}
    {stages.map((_, i) => {
      const a = (i / stages.length) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + 42 * Math.cos(a);
      const y = 50 + 42 * Math.sin(a);
      return (
        <line
          key={i}
          x1="50" y1="50" x2={x} y2={y}
          stroke="url(#pipeGoldGrad)"
          strokeOpacity="0.12"
          strokeWidth="0.3"
          strokeDasharray="1 2"
        />
      );
    })}
  </svg>
);

export const PipelineSection = () => {
  const { t } = useLanguage();
  const [active, setActive] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const flowProgress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section ref={sectionRef} id="pipeline" className="py-28 md:py-40 relative section-bg-gradient section-glow-border overflow-hidden">
      {/* Parallax BG image */}
      <motion.div className="absolute inset-0 z-0 opacity-[0.05]" style={{ y: bgY }}>
        <img src={pipelinePage} alt="" className="w-full h-full object-cover scale-110" />
      </motion.div>

      {/* Atmospheric orbs */}
      <PurpleAccentOrb className="-top-40 -left-32 z-0" size={450} opacity={0.05} />
      <GoldenAccentOrb className="-bottom-32 -right-24 z-0" size={400} opacity={0.04} />

      {/* Character */}
      <ParallaxSprite
        src={tigerConductor}
        className="hidden xl:block -left-2 top-24"
        size={200}
        parallaxY={-35}
        rotate={-3}
        opacity={0.7}
        glow="purple"
        floatDuration={6}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold text-gradient-gold mb-4">
            {t("pipeline", "title")}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="w-24 h-px bg-primary/40" />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <p className="font-elegant text-xl text-foreground/60 italic max-w-2xl mx-auto">
            {t("pipeline", "subtitle")}
          </p>
        </motion.div>

        {/* Circular pipeline - Desktop */}
        <div className="relative max-w-4xl mx-auto">
          {/* Central badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring", stiffness: 80 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/25 via-card to-purple/10 border-2 border-primary/40 flex items-center justify-center backdrop-blur-md">
              <div className="text-center">
                <motion.span
                  className="font-display text-2xl md:text-3xl font-bold text-gradient-gold block"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {t("pipeline", "central")}
                </motion.span>
                <span className="font-body text-[10px] text-foreground/40 uppercase tracking-widest">Pipeline</span>
              </div>
            </div>
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Desktop circular layout with flowing arc */}
          <div className="relative w-full aspect-square max-w-[620px] mx-auto hidden md:block">
            <motion.div className="absolute inset-0" style={{ opacity: useTransform(scrollYProgress, [0.1, 0.3], [0, 1]) }}>
              <FlowingArc progress={flowProgress.get()} />
            </motion.div>

            {/* Use motion value for the arc */}
            <FlowingArcAnimated scrollYProgress={scrollYProgress} />

            {stages.map(({ key, icon: Icon }, i) => {
              const angle = (i / stages.length) * Math.PI * 2 - Math.PI / 2;
              const radius = 42;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              const isActive = active === i;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1, type: "spring", stiffness: 120 }}
                  className="absolute"
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 backdrop-blur-sm relative ${
                      isActive
                        ? "border-primary bg-primary/20 shadow-[0_0_40px_hsl(42_78%_55%/0.5),_0_0_80px_hsl(275_60%_50%/0.15)]"
                        : "border-primary/25 bg-card/60 hover:border-primary/50"
                    }`}
                  >
                    {/* Step number */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card border border-primary/30 flex items-center justify-center">
                      <span className="text-[9px] font-display font-bold text-primary">{i + 1}</span>
                    </div>
                    <Icon className={`w-6 h-6 mb-1 transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-foreground/60"}`} />
                    <span className="font-body text-[10px] lg:text-xs text-center leading-tight px-1 text-foreground/80">
                      {t("pipeline", key)}
                    </span>
                  </motion.div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute z-20 w-60 p-5 rounded-2xl bg-card/95 border border-primary/25 shadow-2xl backdrop-blur-lg -bottom-2 left-1/2 -translate-x-1/2 translate-y-full"
                        style={{ boxShadow: "0 0 30px hsl(42 78% 55% / 0.15), 0 20px 40px hsl(0 0% 0% / 0.3)" }}
                      >
                        <h4 className="font-display text-sm font-semibold text-primary mb-2">{t("pipeline", key)}</h4>
                        <p className="font-body text-xs text-foreground/65 leading-relaxed">
                          {t("pipeline", `${key}Text`)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile grid */}
          <div className="grid grid-cols-2 gap-4 md:hidden mt-20">
            {stages.map(({ key, icon: Icon }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl golden-border backdrop-blur-sm text-center relative"
              >
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-card border border-primary/30 flex items-center justify-center">
                  <span className="text-[10px] font-display font-bold text-primary">{i + 1}</span>
                </div>
                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <h4 className="font-display text-sm font-semibold text-foreground mb-1">
                  {t("pipeline", key)}
                </h4>
                <p className="font-body text-xs text-foreground/55">
                  {t("pipeline", `${key}Text`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* Separate component to properly use motion values */
const FlowingArcAnimated = ({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) => {
  const progress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(42 78% 70%)" />
          <stop offset="50%" stopColor="hsl(275 60% 50%)" />
          <stop offset="100%" stopColor="hsl(42 78% 40%)" />
        </linearGradient>
        <filter id="flowGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#flowGrad)" strokeWidth="0.4" strokeDasharray="3 2" opacity="0.35" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="url(#flowGrad)" strokeWidth="0.15" strokeDasharray="1 3" opacity="0.15" />
      <motion.circle
        cx="50" cy="50" r="42"
        fill="none"
        stroke="hsl(42 78% 60%)"
        strokeWidth="0.8"
        strokeLinecap="round"
        filter="url(#flowGlow)"
        opacity="0.6"
        strokeDasharray="10 116"
        style={{ strokeDashoffset: useTransform(progress, [0, 1], [0, -126]) }}
      />
    </motion.svg>
  );
};
