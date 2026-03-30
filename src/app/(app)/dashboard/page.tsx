'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Truck, Users, BarChart3, Recycle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import type { NavLink } from '@/lib/constants'; // Import NavLink for correct typing

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return <p>Loading user data...</p>;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning'; // This could also be translated
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickLinksConfig: Record<string, Array<Pick<NavLink, 'href' | 'labelKey' | 'icon'> & { descriptionKey: string }>> = {
    customer: [
      { href: '/dashboard/customer/contracts', labelKey: 'myContractsNavLabel', icon: FileText, descriptionKey: 'View and manage your service contracts.' as any }, // Cast for now
      { href: '/dashboard/customer/pickups', labelKey: 'orderPickupNavLabel', icon: Truck, descriptionKey: 'Schedule a new waste pickup.' as any },
    ],
    admin: [
      { href: '/dashboard/admin/user-management', labelKey: 'userManagementNavLabel', icon: Users, descriptionKey: 'Manage all platform users.' as any },
      { href: '/dashboard/admin/contracts', labelKey: 'contractManagementNavLabel', icon: FileText, descriptionKey: 'Oversee all customer contracts.' as any },
      { href: '/dashboard/admin/reports', labelKey: 'incinerationReportsNavLabel', icon: Recycle, descriptionKey: 'Summarize and manage reports.' as any },
      { href: '/dashboard/admin/statistics', labelKey: 'statisticsNavLabel', icon: BarChart3, descriptionKey: 'View platform analytics.' as any },
    ],
    owner: [ 
      { href: '/dashboard/admin/user-management', labelKey: 'userManagementNavLabel', icon: Users, descriptionKey: 'Manage all platform users.' as any },
      { href: '/dashboard/admin/contracts', labelKey: 'contractManagementNavLabel', icon: FileText, descriptionKey: 'Oversee all customer contracts.' as any },
      { href: '/dashboard/admin/reports', labelKey: 'incinerationReportsNavLabel', icon: Recycle, descriptionKey: 'Summarize and manage reports.' as any },
      { href: '/dashboard/admin/statistics', labelKey: 'statisticsNavLabel', icon: BarChart3, descriptionKey: 'View platform analytics.' as any },
    ],
    driver: [
      { href: '/dashboard/driver/schedule', labelKey: 'myScheduleNavLabel', icon: Truck, descriptionKey: 'View your pickup and delivery schedule.' as any },
    ]
  };
  // Note: descriptionKey values are placeholders. Ideally, these would be real TranslationKeys.
  // For this iteration, we'll focus on labelKey from constants and use t() for them.

  const relevantLinks = quickLinksConfig[user.role] || [];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            {getGreeting()}, {user.name}!
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {t('welcomeToAppNameDashboard')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your current role: <span className="font-semibold capitalize text-accent">{user.role}</span></p>
          {user.role === 'customer' && user.tier && (
            <p>Your tier: <span className="font-semibold capitalize text-accent">{user.tier}</span></p>
          )}
        </CardContent>
      </Card>

      {relevantLinks.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relevantLinks.map((link) => (
              <Card key={link.href} className="transform transition-all hover:scale-105 hover:shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-medium text-primary">{t(link.labelKey)}</CardTitle>
                  <link.icon className="h-6 w-6 text-accent" />
                </CardHeader>
                <CardContent>
                  {/* For description, if you add keys to translations.ts: <p className="text-sm text-muted-foreground mb-4">{t(link.descriptionKey)}</p> */}
                  <p className="text-sm text-muted-foreground mb-4">{link.descriptionKey}</p> 
                  <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <Link href={link.href}>Go to {t(link.labelKey)}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card data-ai-hint="data graph" className="shadow-lg">
         <CardHeader>
            <CardTitle className="text-primary">Platform Activity Overview</CardTitle>
             <CardDescription>A snapshot of recent activities and key metrics.</CardDescription>
         </CardHeader>
         <CardContent className="text-center">
            <img src="https://picsum.photos/800/300?random=1" alt="Activity graph placeholder" data-ai-hint="analytics chart" className="mx-auto rounded-md shadow-md" />
            <p className="mt-4 text-muted-foreground">Detailed statistics coming soon.</p>
         </CardContent>
      </Card>

    </div>
  );
}
