'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';

export default function AboutUsPage() {
  const { t } = useLanguage();

  return (
    <div className="container py-12 md:py-20 lg:py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">{t('aboutAppName')}</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
          {t('committedToSafeWaste')}
        </p>
      </div>

      {/* Mission and Values Section */}
      <section className="mb-16 grid gap-12 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
               <Target className="h-6 w-6 text-primary" />
             </div>
            <CardTitle className="text-2xl text-primary">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To be the leading provider of specialized waste management services, prioritizing safety, compliance, and customer satisfaction while protecting our communities and the environment. We operate with integrity and a deep sense of responsibility, honouring the values of diligence and care.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
               <ShieldCheck className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl text-accent">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li><span className="font-medium text-foreground">Safety First:</span> Uncompromising commitment to the safety of our team, clients, and the public.</li>
              <li><span className="font-medium text-foreground">Compliance:</span> Strict adherence to all environmental and safety regulations.</li>
              <li><span className="font-medium text-foreground">Reliability:</span> Dependable and timely service delivery.</li>
              <li><span className="font-medium text-foreground">Integrity:</span> Conducting business with honesty and transparency.</li>
              <li><span className="font-medium text-foreground">Responsibility:</span> Environmental stewardship and community focus.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Our Story/History Section */}
       <section className="mb-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
         <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-semibold text-primary mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
                Founded with a vision for cleaner and safer communities, {t('appName')} has grown into a trusted partner for businesses and institutions requiring specialized waste management. Our dedication stems from a deep-rooted belief in responsible practices and service excellence.
            </p>
             <p className="text-muted-foreground">
                We leverage technology and expertise to provide efficient solutions, ensuring peace of mind for our clients and contributing to a healthier environment for future generations.
             </p>
         </div>
         <div className="w-full md:w-1/2">
             <Image
                src="https://picsum.photos/seed/about-team/600/400"
                alt={`${t('appName')} Team Working`}
                width={600}
                height={400}
                className="rounded-lg shadow-lg object-cover w-full aspect-video"
                data-ai-hint="team meeting"
             />
         </div>
       </section>


      {/* Team Section (Placeholder) */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-semibold text-primary">Meet Our Team (Placeholder)</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Placeholder Team Member Cards */}
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="text-center bg-secondary/30">
              <CardContent className="pt-6">
                <Avatar className="mx-auto h-24 w-24 mb-4 border-2 border-primary">
                  <AvatarImage src={`https://picsum.photos/seed/team${i}/100/100`} alt={`Team Member ${i}`} />
                  <AvatarFallback>T{i}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold text-foreground">Team Member {i}</h3>
                <p className="text-sm text-accent">Role/Title</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-muted-foreground">
          Our dedicated team of professionals is here to support you.
        </p>
      </section>
    </div>
  );
}
