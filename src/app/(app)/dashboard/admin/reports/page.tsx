import { ReportSummarizer } from '@/components/admin/report-summarizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function IncinerationReportsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">AI-Powered Report Summarization</CardTitle>
          <CardDescription>
            Quickly summarize and categorize waste incineration reports. Paste the report text below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportSummarizer />
        </CardContent>
      </Card>
    </div>
  );
}
