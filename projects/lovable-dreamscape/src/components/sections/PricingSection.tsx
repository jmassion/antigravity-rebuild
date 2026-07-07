import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: { es: "Individual", en: "Individual" },
    price: "$299",
    features: {
      es: ["1 curso a elección", "Acceso a materiales online", "Soporte por email", "Certificado digital"],
      en: ["1 course of your choice", "Access to online materials", "Email support", "Digital certificate"],
    },
    popular: false,
  },
  {
    name: { es: "Profesional", en: "Professional" },
    price: "$599",
    features: {
      es: ["3 cursos a elección", "Contenido exclusivo", "Mentoría 1-a-1", "Certificado profesional", "Acceso a comunidad VIP"],
      en: ["3 courses of your choice", "Exclusive content", "1-on-1 mentorship", "Professional certificate", "VIP community access"],
    },
    popular: true,
  },
  {
    name: { es: "Enterprise", en: "Enterprise" },
    price: "$999",
    features: {
      es: ["Acceso ilimitado", "Mentoría premium", "Proyectos en equipo", "Placement de empleo", "Certificación avanzada"],
      en: ["Unlimited access", "Premium mentorship", "Team projects", "Job placement", "Advanced certification"],
    },
    popular: false,
  },
];

export const PricingSection = () => {
  const { language, t } = useLanguage();

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("pricing", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto mb-6" />
          <p className="font-elegant text-xl text-foreground/60 italic">
            {t("pricing", "subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative p-8 rounded-xl border backdrop-blur-sm transition-all duration-500 ${
                plan.popular
                  ? "border-primary/60 bg-card/70 glow-gold scale-[1.02]"
                  : "border-border/50 bg-card/40 hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-display uppercase tracking-wider rounded-full">
                  {t("pricing", "popular")}
                </div>
              )}
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {plan.name[language]}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold text-primary">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{t("pricing", "perMonth")}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features[language].map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full font-display text-xs tracking-wider uppercase ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-primary/30 text-primary bg-transparent hover:bg-primary/10"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {t("pricing", "cta")}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
