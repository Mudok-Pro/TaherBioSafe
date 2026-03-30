import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { LanguageProvider } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { ThemeProvider as NextThemesProvider } from 'next-themes';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata can't use hooks, so we use default 'en' for initial static generation
export const metadata: Metadata = {
  title: `${translations.en.appName} - Waste Incineration Management`,
  description: 'Comprehensive solution for managing waste incineration processes, contracts, and reports.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <NextThemesProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AppShell>{children}</AppShell>
              <Toaster />
            </NextThemesProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
