'use client';

import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react'; // Using an icon for the switcher

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}>
      {/* <Languages className="h-5 w-5" /> */}
      {language === 'en' ? 'ع' : 'EN'}
    </Button>
  );
}
