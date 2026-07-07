import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * A floating character sprite with scroll-driven parallax motion.
 * Place absolutely inside any section with `relative overflow-hidden`.
 */
interface ParallaxSpriteProps {
  src: string;
  alt?: string;
  /** Horizontal position: Tailwind class like "left-4" or "right-8" */
  className?: string;
  /** Size in px – width (height auto) */
  size?: number;
  /** Parallax strength: how many px the sprite moves over the scroll range. Negative = move up. */
  parallaxY?: number;
  /** Optional horizontal parallax */
  parallaxX?: number;
  /** Initial rotation in deg */
  rotate?: number;
  /** Opacity 0-1 */
  opacity?: number;
  /** Glow color – adds a drop shadow */
  glow?: "gold" | "purple" | "none";
  /** Float animation speed in seconds */
  floatDuration?: number;
}

export const ParallaxSprite = ({
  src,
  alt = "",
  className = "",
  size = 180,
  parallaxY = -60,
  parallaxX = 0,
  rotate = 0,
  opacity = 0.85,
  glow = "gold",
  floatDuration = 6,
}: ParallaxSpriteProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [parallaxY * -1, parallaxY]);
  const x = useTransform(scrollYProgress, [0, 1], [parallaxX * -1, parallaxX]);

  const glowFilter =
    glow === "gold"
      ? "drop-shadow(0 0 25px hsl(42 78% 55% / 0.35)) drop-shadow(0 0 60px hsl(42 78% 55% / 0.15))"
      : glow === "purple"
        ? "drop-shadow(0 0 25px hsl(275 60% 50% / 0.3)) drop-shadow(0 0 60px hsl(275 60% 50% / 0.12))"
        : "none";

  return (
    <motion.div
      ref={ref}
      className={`absolute pointer-events-none z-[5] ${className}`}
      style={{ y, x }}
    >
      <motion.img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain select-none"
        style={{
          filter: glowFilter,
          opacity,
          transform: `rotate(${rotate}deg)`,
        }}
        animate={{
          y: [0, -8, 0],
          rotate: [rotate, rotate + 2, rotate],
        }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

/**
 * A decorative parallax background layer with scroll-driven movement.
 * Ideal for atmospheric gradients, blurred orbs, etc.
 */
interface ParallaxLayerProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // Multiplier for scroll parallax
}

export const ParallaxLayer = ({ children, className = "", speed = 0.3 }: ParallaxLayerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);

  return (
    <motion.div ref={ref} className={`absolute pointer-events-none ${className}`} style={{ y }}>
      {children}
    </motion.div>
  );
};
