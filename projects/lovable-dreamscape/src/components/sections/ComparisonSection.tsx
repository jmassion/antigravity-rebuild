import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { motion } from "framer-motion";

export const ComparisonSection = () => {
  const { t, language } = useLanguage();
  const headers = translations.comparison.headers[language];
  const rows = translations.comparison.rows[language];

  return (
    <section className="py-24 md:py-32 relative section-bg-gradient-alt section-glow-border overflow-hidden">
      <div className="absolute top-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-purple-glow/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-[350px] h-[350px] rounded-full bg-primary/4 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-4">
            {t("comparison", "title")}
          </h2>
          <div className="w-24 h-0.5 bg-primary/40 mx-auto" />
        </motion.div>

        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={`p-4 font-display text-sm md:text-base text-left border-b-2 ${
                      i === 2 ? "text-primary border-primary/30" : "text-foreground/60 border-border/30"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="border-b border-border/15 hover:bg-primary/5 transition-colors"
                >
                  <td className="p-4 font-display text-sm font-medium text-foreground/80">
                    {row[0]}
                  </td>
                  <td className="p-4 font-body text-sm text-foreground/35">
                    {row[1]}
                  </td>
                  <td className="p-4 font-body text-sm text-primary font-medium">
                    {row[2]}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
