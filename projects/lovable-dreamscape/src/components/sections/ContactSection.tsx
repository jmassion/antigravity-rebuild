import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export const ContactSection = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Message sent!");
    }, 1000);
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("contact", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <Input
              placeholder={t("contact", "name")}
              required
              className="bg-card/50 border-border/50 focus:border-primary/50"
            />
            <Input
              type="email"
              placeholder={t("contact", "email")}
              required
              className="bg-card/50 border-border/50 focus:border-primary/50"
            />
            <Textarea
              placeholder={t("contact", "message")}
              rows={5}
              required
              className="bg-card/50 border-border/50 focus:border-primary/50 resize-none"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-display text-sm tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("contact", "send")}
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { icon: Mail, text: "info@whitetigerstudios.com" },
              { icon: Phone, text: "+1 (555) 123-4567" },
              { icon: MapPin, text: "Los Angeles, California" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/30">
                <Icon className="w-5 h-5 text-primary shrink-0" />
                <span className="font-body text-foreground/70 text-sm">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
