import React, { createContext, useContext, useState, useCallback } from "react";
import { Language, translations } from "./translations";

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (section: string, key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("wts-lang") as Language) || "es"
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === "es" ? "en" : "es";
      localStorage.setItem("wts-lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (section: string, key: string): string => {
      const s = (translations as any)[section];
      if (!s) return key;
      const entry = s[key];
      if (!entry) return key;
      return entry[language] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
