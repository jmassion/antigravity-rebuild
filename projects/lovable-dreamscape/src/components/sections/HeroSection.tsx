import { useLanguage } from "@/i18n/LanguageContext";
import { HeroScene3D } from "@/components/HeroScene3D";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import tigerDirector from "@/assets/tiger-director-3d.png";
import tigerCub from "@/assets/tiger-cub-3d.png";
import goldenCamera from "@/assets/golden-camera-3d.png";

export const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep purple radial background */}
      <div className="absolute inset-0 z-[0] bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(280_50%_15%)_0%,_hsl(270_35%_8%)_70%)]" />
      </div>

      {/* 3D WebGL Scene with characters, particles, and lighting */}
      <HeroScene3D
        tigerDirectorUrl={tigerDirector}
        tigerCubUrl={tigerCub}
        goldenCameraUrl={goldenCamera}
      />

      {/* Radial glows for depth */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/5 blur-[180px]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple/10 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/4 blur-[100px]" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.h1
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-gradient-gold mb-6 tracking-wide drop-shadow-[0_0_40px_hsl(42_78%_55%/0.3)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {t("hero", "title")}
        </motion.h1>

        <motion.p
          className="font-elegant text-xl md:text-2xl lg:text-3xl text-foreground/70 italic mb-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {t("hero", "tagline")}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <Button
            size="lg"
            className="font-display text-sm tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 glow-gold"
            onClick={() => navigate("/game")}
          >
            <Gamepad2 className="w-4 h-4 mr-2" />
            Play the Game
          </Button>
          <Button
            size="lg"
            className="font-display text-sm tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6"
            onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t("hero", "cta1")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="font-display text-sm tracking-widest uppercase border-primary/40 text-primary hover:bg-primary/10 px-8 py-6"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t("hero", "cta2")}
          </Button>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};
