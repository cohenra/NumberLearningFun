import React, { createContext, useContext, useState, useEffect } from 'react';
import locales, { Locale, LocaleObject } from './locales';

type LanguageContextType = {
  locale: Locale;
  t: (key: string) => string;
  changeLanguage: (newLocale: Locale) => void;
  currentLocale: LocaleObject;
  dir: 'rtl' | 'ltr';
};

const defaultLanguage: Locale = 'he';

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get language from localStorage, default to 'he'
  const [locale, setLocale] = useState<Locale>(() => {
    const savedLocale = localStorage.getItem('language') as Locale;
    return savedLocale && Object.keys(locales).includes(savedLocale) ? savedLocale : defaultLanguage;
  });
  
  // Get translation function and direction based on locale
  const currentLocale = locales[locale];
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  
  // Update HTML lang and dir attributes when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem('language', locale);
  }, [locale, dir]);
  
  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = currentLocale;
    
    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }
    
    return value !== undefined ? value : key;
  };
  
  // Function to change language
  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    // Reload page to apply direction changes properly
    window.location.reload();
  };
  
  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage, currentLocale, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 