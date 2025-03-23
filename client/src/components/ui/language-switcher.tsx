import React from 'react';
import { Button } from './button';
import { useLanguage } from '@/lib/i18n/languageContext';

export const LanguageSwitcher: React.FC = () => {
  const { locale, changeLanguage, t } = useLanguage();
  
  const toggleLanguage = () => {
    const newLocale = locale === 'he' ? 'en' : 'he';
    changeLanguage(newLocale);
  };
  
  return (
    <Button 
      variant="outline"
      className="fixed top-2 right-2 md:top-4 md:right-4 z-10 text-xs md:text-sm px-2 py-1 h-auto"
      onClick={toggleLanguage}
    >
      {t('common.languageSwitch')}
    </Button>
  );
}; 