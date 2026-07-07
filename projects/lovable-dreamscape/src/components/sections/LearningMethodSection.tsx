import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Gamepad2, Building2, Users, MessageSquare, Zap, TrendingUp } from "lucide-react";
import purpleGoldBg from "@/assets/purple-gold-bg.jpg";
import { ParallaxSprite } from "@/components/ParallaxSprite";
import tigerGamer from "@/assets/sprites/tiger-gamer.png";

const cards = [
  { key: "card1", icon: Gamepad2 },
  { key: "card2", icon: Building2 },
  { key: "card3", icon: Users },
  { key: "card4", icon: MessageSquare },
  { key: "card5", icon: Zap },
  { key: "card6", icon: TrendingUp },
];

export const LearningMethodSection = () => {
  const { t } = useLanguage();

  return (
    <section id="method" className="py-24 md:py-32 relative overflow-hidden">
      {/* Purple-gold atmospheric BG */}
      <div className="absolute inset-0 z-0 opacity-[0.12]">
        <img src={purpleGoldBg} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-background/85 z-[1]" />

      {/* Gamer tiger for the learning method */}
      <ParallaxSprite
        src={tigerGamer}
        className="hidden lg:block -right-4 bottom-12"
        size={210}
        parallaxY={-45}
        rotate={3}
        opacity={0.75}
        glow="purple"
        floatDuration={5}
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
            {t("learningMethod", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic max-w-2xl mx-auto">
            {t("learningMethod", "subtitle")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cards.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 rounded-xl golden-border backdrop-blur-sm transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 group-hover:glow-gold transition-all">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {t("learningMethod", key)}
              </h3>
              <p className="font-body text-sm text-foreground/60 leading-relaxed">
                {t("learningMethod", `${key}Text`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
