import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import teamCharacters from "@/assets/team-characters.jpg";
import footerCharacters from "@/assets/footer-characters.jpg";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-primary/20 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0 opacity-[0.08]">
        <img src={footerCharacters} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/80 z-[1]" />

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Team characters image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-md mx-auto mb-8"
        >
          <img
            src={teamCharacters}
            alt="White Tiger Studios Characters"
            className="w-full rounded-2xl opacity-80"
          />
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8 text-center"
        >
          <p className="font-elegant text-lg md:text-xl text-foreground/50 italic leading-relaxed">
            "{t("footer", "quote1")}"
          </p>
          <p className="font-elegant text-lg md:text-xl text-primary/70 italic leading-relaxed mt-2">
            "{t("footer", "quote2")}"
          </p>
        </motion.blockquote>

        <div className="text-center">
          <p className="font-display text-xl text-gradient-gold mb-2">White Tiger Studios</p>
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} White Tiger Studios. {t("footer", "rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
};
