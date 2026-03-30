
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Recycle, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-primary sm:text-5xl xl:text-6xl/none">
                  {t('safeResponsibleWasteManagement')}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  {t('trustedPartnerSecureWaste')}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/services">
                    {t('exploreOurServicesButton')} <ChevronRight className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about-us">{t('learnMoreAboutUsButton')}</Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              alt={t('safeResponsibleWasteManagement')}
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg"
              data-ai-hint="industrial plant"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">{t('keyFeaturesBadge')}</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-primary">{t('whyChooseUsTitle')}</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t('whyChooseUsDesc')}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Recycle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('comprehensiveServicesTitle')}</CardTitle>
                <CardDescription>{t('comprehensiveServicesDesc')}</CardDescription>
              </CardHeader>
            </Card>
             <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('complianceFocusedTitle')}</CardTitle>
                <CardDescription>{t('complianceFocusedDesc')}</CardDescription>
              </CardHeader>
            </Card>
             <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('reliablePickupsTitle')}</CardTitle>
                <CardDescription>{t('reliablePickupsDesc')}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

       {/* Call to Action Section */}
       <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50 border-t">
         <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
           <div className="space-y-3">
             <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">
               {t('readyForSecureWasteManagementTitle')}
             </h2>
             <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
               {t('readyForSecureWasteManagementDesc')}
             </p>
           </div>
           <div className="mx-auto w-full max-w-sm space-y-2">
             <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
               <Link href="/login">
                 {t('clientLoginRequestServiceButton')}
               </Link>
             </Button>
              <p className="text-xs text-muted-foreground">
                {t('newClientNote')}
             </p>
           </div>
         </div>
       </section>
    </div>
  );
}
