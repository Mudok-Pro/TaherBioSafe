'use client';

import { useLanguage } from '@/context/language-context';

export function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} {t('appName')}. {t('copyright')}
        </p>
        <div className="flex gap-4">
           <a href="#" className="text-sm text-muted-foreground hover:text-foreground">{t('privacyPolicy')}</a>
           <a href="#" className="text-sm text-muted-foreground hover:text-foreground">{t('termsOfService')}</a>
        </div>
      </div>
    </footer>
  );
}
