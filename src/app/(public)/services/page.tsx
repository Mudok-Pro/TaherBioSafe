'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WASTE_TYPES, CUSTOMER_TIERS } from '@/lib/constants';
import { CheckCircle, CreditCard, University } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function ServicesPage() {
  const { t } = useLanguage();
  return (
    <div className="container py-12 md:py-20 lg:py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">{t('ourServicesTitle')}</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
          {t('comprehensiveWasteManagement')}
        </p>
      </div>

      {/* Waste Types Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-semibold text-primary">Types of Waste We Handle</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {WASTE_TYPES.filter(type => type.value !== 'general').map((wasteType) => ( // Exclude 'general' for this display
            <Card key={wasteType.value} className="flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 border border-primary/20">
                  <wasteType.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{wasteType.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure collection, transport, and disposal according to regulations for {wasteType.label.toLowerCase()}.
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Service Tiers Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-semibold text-primary">Service Tiers</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {CUSTOMER_TIERS.map((tier) => (
            <Card key={tier.value} className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="capitalize text-xl text-accent">{tier.label}</CardTitle>
                <CardDescription>Tailored solutions for different needs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Add specific features for each tier if available */}
                <p className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Feature 1</p>
                <p className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Feature 2</p>
                {tier.value !== 'standard' && <p className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Premium Support</p>}
              </CardContent>
            </Card>
          ))}
        </div>
         <p className="mt-6 text-center text-muted-foreground">
            Contact us to discuss the best tier for your organization.
          </p>
      </section>

      {/* Payment Options Section */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-semibold text-primary">Payment Options (Algeria)</h2>
        <Card className="bg-secondary/30 border-accent/30">
          <CardContent className="pt-6">
            <p className="mb-6 text-center text-muted-foreground">
              For our clients in Algeria, we offer convenient payment methods:
            </p>
            <div className="grid gap-6 md:grid-cols-3 text-center">
              <div className="flex flex-col items-center">
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg> {/* Paysera-like icon */}
                 </div>
                <h3 className="font-semibold text-foreground">Paysera</h3>
                <p className="text-sm text-muted-foreground">Easy online payments.</p>
              </div>
              <div className="flex flex-col items-center">
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 mb-2">
                    <University className="h-6 w-6 text-accent" /> {/* CIB-like icon */}
                 </div>
                <h3 className="font-semibold text-foreground">CIB Cards</h3>
                <p className="text-sm text-muted-foreground">Accepted via bank terminals.</p>
              </div>
              <div className="flex flex-col items-center">
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 mb-2">
                    <CreditCard className="h-6 w-6 text-accent" /> {/* Eldahabia-like icon */}
                 </div>
                <h3 className="font-semibold text-foreground">Eldahabia Card</h3>
                <p className="text-sm text-muted-foreground">Pay using your national card.</p>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Please confirm payment details when setting up your contract or scheduling a pickup.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
