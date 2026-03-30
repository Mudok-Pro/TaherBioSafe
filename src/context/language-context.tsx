'use client';

import type { Language, UserRole } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { translations, type TranslationSet, type TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    // Attempt to load saved language from localStorage
    const savedLanguage = localStorage.getItem('appLanguage') as Language | null;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
      setDir(savedLanguage === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.lang = savedLanguage;
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    } else {
      // Default to browser language or 'en'
      const browserLang = navigator.language.split('-')[0];
      const initialLang = browserLang === 'ar' ? 'ar' : 'en';
      setLanguageState(initialLang);
      setDir(initialLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.lang = initialLang;
      document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('appLanguage', initialLang);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    const newDir = lang === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    document.documentElement.lang = lang;
    document.documentElement.dir = newDir;
    localStorage.setItem('appLanguage', lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
