'use client';

import { useState } from 'react';
import { summarizeIncinerationReport, type SummarizeIncinerationReportOutput } from '@/ai/flows/summarize-incineration-reports';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertTriangle, Tags, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ReportSummarizer() {
  const [reportText, setReportText] = useState('');
  const [summaryOutput, setSummaryOutput] = useState<SummarizeIncinerationReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      setError('Report text cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummaryOutput(null);

    try {
      const result = await summarizeIncinerationReport({ reportText });
      setSummaryOutput(result);
      toast({
        title: "Report Summarized Successfully!",
        description: "The AI has processed the report.",
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to summarize report: ${errorMessage}`);
      toast({
        title: "Error Summarizing Report",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Textarea
          placeholder="Paste your waste incineration report text here..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          className="min-h-[200px] border-primary/50 focus:border-primary shadow-sm"
          rows={10}
          disabled={isLoading}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSubmit} disabled={isLoading || !reportText.trim()} className="w-full bg-accent text-accent-foreground hover:bg-accent/80 text-lg py-6">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Summarizing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Summarize Report
          </>
        )}
      </Button>

      {summaryOutput && (
        <Card className="mt-6 shadow-md border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-accent" /> AI Generated Summary
            </CardTitle>
            <CardDescription>Review the AI-generated summary, categories, and key metrics below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">Summary:</h3>
              <p className="text-muted-foreground bg-secondary/30 p-3 rounded-md">{summaryOutput.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1 flex items-center">
                <Tags className="mr-2 h-4 w-4 text-accent" /> Categories:
              </h3>
              <div className="flex flex-wrap gap-2">
                {summaryOutput.categories.map((category, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/80 text-primary-foreground rounded-full text-sm shadow">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1 flex items-center">
                <ListChecks className="mr-2 h-4 w-4 text-accent" /> Key Metrics:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground bg-secondary/30 p-3 rounded-md">
                {Object.entries(summaryOutput.keyMetrics).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-medium text-foreground/80">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
