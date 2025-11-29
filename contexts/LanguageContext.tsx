import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from '../i18n/locales';

type Language = 'ko' | 'en';
type TranslationKeys = keyof typeof translations.ko;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys, params?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko');

  const t = useCallback((key: TranslationKeys, params?: { [key: string]: string | number }): string => {
    // FIX: Updated `t` function to support an optional `params` object for string interpolation. This resolves errors where the function was called with more than one argument.
    let translation = translations[language][key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });
    }
    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
