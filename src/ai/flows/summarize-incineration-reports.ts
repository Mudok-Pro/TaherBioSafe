'use server';

/**
 * @fileOverview Summarizes waste incineration reports using AI.
 *
 * - summarizeIncinerationReport - A function that summarizes and categorizes waste incineration reports.
 * - SummarizeIncinerationReportInput - The input type for the summarizeIncinerationReport function.
 * - SummarizeIncinerationReportOutput - The return type for the summarizeIncinerationReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncinerationReportInputSchema = z.object({
  reportText: z
    .string()
    .describe('The text content of the waste incineration report.'),
});
export type SummarizeIncinerationReportInput = z.infer<
  typeof SummarizeIncinerationReportInputSchema
>;

const SummarizeIncinerationReportOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the incineration report.'),
  categories: z
    .array(z.string())
    .describe(
      'An array of categories that the report falls under (e.g., hazardous waste, medical waste).' 
    ),
  keyMetrics: z
    .record(z.string(), z.string())
    .describe(
      'Key metrics extracted from the report, such as total waste processed and emissions levels.'
    ),
});

export type SummarizeIncinerationReportOutput = z.infer<
  typeof SummarizeIncinerationReportOutputSchema
>;

export async function summarizeIncinerationReport(
  input: SummarizeIncinerationReportInput
): Promise<SummarizeIncinerationReportOutput> {
  return summarizeIncinerationReportFlow(input);
}

const summarizeIncinerationReportPrompt = ai.definePrompt({
  name: 'summarizeIncinerationReportPrompt',
  input: {schema: SummarizeIncinerationReportInputSchema},
  output: {schema: SummarizeIncinerationReportOutputSchema},
  prompt: `You are an AI assistant helping to summarize waste incineration reports for quick review by admins.

  Given the following report text, provide a concise summary, categorize the report, and extract key metrics.

  Report Text: {{{reportText}}}

  Summary:
  Categories:
  Key Metrics:`, 
});

const summarizeIncinerationReportFlow = ai.defineFlow(
  {
    name: 'summarizeIncinerationReportFlow',
    inputSchema: SummarizeIncinerationReportInputSchema,
    outputSchema: SummarizeIncinerationReportOutputSchema,
  },
  async input => {
    const {output} = await summarizeIncinerationReportPrompt(input);
    return output!;
  }
);
