'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Users, FileText } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context'; // Added import

// Mock data for charts - replace with real data and charting library
const mockChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Contracts Signed',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsla(var(--primary), 0.5)',
    },
    {
      label: 'Pickups Completed',
      data: [28, 48, 40, 19, 86, 27],
      borderColor: 'hsl(var(--accent))',
      backgroundColor: 'hsla(var(--accent), 0.5)',
    },
  ],
};


export default function StatisticsPage() {
  const { t } = useLanguage(); // Added hook usage

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <BarChart className="mr-2 h-6 w-6" />
            Platform Statistics
          </CardTitle>
          <CardDescription>An overview of key metrics and performance indicators for {t('appName')}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-secondary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Total Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+5.2% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Active Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">582</div>
                <p className="text-xs text-muted-foreground">+12 since last week</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Pickups This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78</div>
                <p className="text-xs text-muted-foreground">+8.1% from last month</p>
              </CardContent>
            </Card>
             <Card className="bg-secondary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Reports Summarized</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">152</div>
                <p className="text-xs text-muted-foreground">AI-powered insights</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card data-ai-hint="bar chart" className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Monthly Contract Growth</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for chart */}
                <Image src="https://picsum.photos/seed/chart1/600/300" alt="Monthly Contract Growth Chart" width={600} height={300} className="rounded-md" data-ai-hint="analytics graph"/>
                <p className="text-sm text-muted-foreground mt-2 text-center">Contract growth chart will be displayed here.</p>
              </CardContent>
            </Card>
            <Card data-ai-hint="line chart" className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Pickup Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for chart */}
                <Image src="https://picsum.photos/seed/chart2/600/300" alt="Pickup Volume Trends Chart" width={600} height={300} className="rounded-md" data-ai-hint="data visualization"/>
                 <p className="text-sm text-muted-foreground mt-2 text-center">Pickup volume chart will be displayed here.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
