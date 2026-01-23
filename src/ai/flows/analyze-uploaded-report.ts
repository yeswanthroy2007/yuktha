
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing uploaded lab reports.
 *
 * - analyzeUploadedReport - Analyzes a lab report, extracts key health parameters, compares them with past reports, and highlights changes.
 * - AnalyzeUploadedReportInput - The input type for the analyzeUploadedReport function.
 * - AnalyzeUploadedReportOutput - The return type for the analyzeUploadedReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Report } from '@/lib/data';

const AnalyzeUploadedReportInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "The lab report as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  pastReports: z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.string(),
      date: z.string(),
      clinic: z.string().optional(),
      file: z.any(),
      analysis: z.any().optional(),
      fileDataUri: z.string().optional(),
  })).optional().describe('Past lab reports for comparison.'),
});

export type AnalyzeUploadedReportInput = z.infer<typeof AnalyzeUploadedReportInputSchema>;

const HealthParameterSchema = z.object({
  name: z.string().describe('The name of the health parameter (e.g., blood sugar, cholesterol).'),
  value: z.string().describe('The value of the health parameter.'),
  unit: z.string().describe('The unit of measurement for the health parameter.'),
  change: z
    .string()
    .describe(
      'A color-coded indicator of the change compared to past reports: 🟢 Stable, 🟡 Caution, 🔴 Alert.'
    ),
  trendGraph: z.string().optional().describe('A data URI for a trend graph of the parameter over time.'),
});

const AnalyzeUploadedReportOutputSchema = z.object({
  reportSummary: z.string().describe('A summary of the lab report analysis.'),
  healthParameters: z.array(HealthParameterSchema).describe('The extracted health parameters and their changes.'),
});

export type AnalyzeUploadedReportOutput = z.infer<typeof AnalyzeUploadedReportOutputSchema>;

export async function analyzeUploadedReport(
  input: AnalyzeUploadedReportInput
): Promise<AnalyzeUploadedReportOutput> {
  return analyzeUploadedReportFlow(input);
}

const analyzeReportPrompt = ai.definePrompt({
  name: 'analyzeReportPrompt',
  input: {schema: AnalyzeUploadedReportInputSchema},
  output: {schema: AnalyzeUploadedReportOutputSchema},
  prompt: `You are an AI health assistant that analyzes lab reports, extracts key health parameters, compares them with past reports, and highlights changes with color-coded indicators.

Analyze the following lab report:

Report: {{media url=reportDataUri}}

{{#if pastReports}}
Compare it with the following past reports:
{{#each pastReports}}
Past Report: {{media url=this.fileDataUri}} - Titled: "{{this.title}}" from {{this.date}}
{{/each}}
{{else}}
There are no past reports to compare with. When generating the summary, inform the user that comparative analysis will be available once they upload a second report of the same type.
{{/if}}

Generate an easy-to-read summary of the report and highlight any significant changes in health parameters compared to past reports. Use color-coded indicators (🟢 Stable, 🟡 Caution, 🔴 Alert) to indicate the magnitude of change.

Ensure the output is properly formatted JSON as described in the output schema. Include trend graphs for each health parameter if possible.`,
});

const analyzeUploadedReportFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedReportFlow',
    inputSchema: AnalyzeUploadedReportInputSchema,
    outputSchema: AnalyzeUploadedReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

