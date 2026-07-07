import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqData = [
  {
    q: { es: "¿Necesito experiencia previa?", en: "Do I need prior experience?" },
    a: {
      es: "No necesariamente. Ofrecemos programas para todos los niveles, desde principiantes hasta profesionales avanzados.",
      en: "Not necessarily. We offer programs for all levels, from beginners to advanced professionals.",
    },
  },
  {
    q: { es: "¿Los cursos son presenciales o en línea?", en: "Are courses in-person or online?" },
    a: {
      es: "Ofrecemos un modelo híbrido. Parte del contenido se imparte en línea y las sesiones prácticas se realizan en nuestro estudio.",
      en: "We offer a hybrid model. Part of the content is delivered online and hands-on sessions take place at our studio.",
    },
  },
  {
    q: { es: "¿Qué software se utiliza?", en: "What software is used?" },
    a: {
      es: "Trabajamos con herramientas estándar de la industria como Maya, Houdini, Nuke, DaVinci Resolve, After Effects y más.",
      en: "We work with industry-standard tools like Maya, Houdini, Nuke, DaVinci Resolve, After Effects, and more.",
    },
  },
  {
    q: { es: "¿Ofrecen certificaciones?", en: "Do you offer certifications?" },
    a: {
      es: "Sí, todos nuestros programas incluyen certificación digital. Los planes Profesional y Enterprise incluyen certificación avanzada.",
      en: "Yes, all our programs include digital certification. Professional and Enterprise plans include advanced certification.",
    },
  },
  {
    q: { es: "¿Hay opciones de financiamiento?", en: "Are there financing options?" },
    a: {
      es: "Sí, ofrecemos planes de pago flexibles y descuentos por inscripción anticipada.",
      en: "Yes, we offer flexible payment plans and early enrollment discounts.",
    },
  },
];

export const FAQSection = () => {
  const { language, t } = useLanguage();

  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("faq", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqData.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border/50 rounded-xl px-6 bg-card/30 backdrop-blur-sm data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="font-display text-sm md:text-base text-foreground hover:text-primary transition-colors py-5">
                  {item.q[language]}
                </AccordionTrigger>
                <AccordionContent className="font-body text-foreground/60 pb-5">
                  {item.a[language]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
