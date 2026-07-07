import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * A decorative golden-glow divider placed between sections.
 * Renders an animated horizontal line with radiant gold center and purple edges.
 */
export const GoldenDivider = ({ flip = false }: { flip?: boolean }) => {
  return (
    <div className="relative w-full h-24 -my-12 z-20 pointer-events-none overflow-hidden">
      {/* Central gold line */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-[2px]" />
      </div>

      {/* Glowing center orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          boxShadow: "0 0 20px 6px hsl(42 78% 55% / 0.5), 0 0 60px 12px hsl(42 78% 55% / 0.2)",
        }}
      />

      {/* Side ornaments */}
      <div className={`absolute top-1/2 -translate-y-1/2 ${flip ? "right-[calc(50%-120px)]" : "left-[calc(50%-120px)]"} w-2 h-2 rounded-full bg-purple-glow/40`} />
      <div className={`absolute top-1/2 -translate-y-1/2 ${flip ? "left-[calc(50%-120px)]" : "right-[calc(50%-120px)]"} w-2 h-2 rounded-full bg-purple-glow/40`} />

      {/* Purple glow wisps */}
      <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-40 h-8 rounded-full bg-purple-glow/8 blur-[20px]" />
      <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-40 h-8 rounded-full bg-purple-glow/8 blur-[20px]" />
    </div>
  );
};

/**
 * Animated purple accent orb for atmospheric depth.
 */
export const PurpleAccentOrb = ({
  className = "",
  size = 300,
  opacity = 0.06,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

  return (
    <motion.div
      ref={ref}
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, hsl(275 60% 50% / ${opacity}) 0%, transparent 70%)`,
        scale,
      }}
    />
  );
};

/**
 * Golden accent orb for warm atmospheric glow.
 */
export const GoldenAccentOrb = ({
  className = "",
  size = 250,
  opacity = 0.05,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.15, 0.9]);

  return (
    <motion.div
      ref={ref}
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, hsl(42 78% 55% / ${opacity}) 0%, transparent 70%)`,
        scale,
      }}
    />
  );
};
