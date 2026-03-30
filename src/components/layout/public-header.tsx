'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Recycle, LogIn, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle'; // Added ThemeToggle import
import type { TranslationKey } from '@/lib/translations';

interface PublicNavLink {
  href: string;
  labelKey: TranslationKey;
}

const navLinks: PublicNavLink[] = [
  { href: '/', labelKey: 'navHome' },
  { href: '/services', labelKey: 'navServices' },
  { href: '/about-us', labelKey: 'navAboutUs' },
];

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Recycle className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">{t('appName')}</span>
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === link.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <LanguageSwitcher />
          <ThemeToggle /> {/* Added ThemeToggle component */}
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              {t('loginButton')}
            </Link>
          </Button>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="mb-4 flex items-center space-x-2" onClick={closeMobileMenu}>
                   <Recycle className="h-6 w-6 text-primary" />
                   <span className="font-bold">{t('appName')}</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'block px-2 py-1 text-lg',
                      pathname === link.href ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
