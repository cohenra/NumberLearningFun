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
      className="fixed top-4 right-4 z-50 text-sm px-3 py-1 h-auto"
      onClick={toggleLanguage}
    >
      {t('common.languageSwitch')}
    </Button>
  );
}; 