import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const defaultLanguageContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {
    // no-op fallback (should be overridden by LanguageProvider)
  },
  t: (key: TranslationKey) => translations.en[key] || key,
};

const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
