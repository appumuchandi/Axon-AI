'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating AI-powered informational insights related to emergency preparedness.
 *
 * - generatePreparednessInsights - A function that handles the generation of insights.
 * - GeneratePreparednessInsightsInput - The input type for the generatePreparednessInsights function.
 * - GeneratePreparednessInsightsOutput - The return type for the generatePreparednessInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePreparednessInsightsInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe(
      'An optional topic for the AI to generate insights about, e.g., "earthquake preparedness" or "hurricane safety". If not provided, general emergency preparedness insights will be generated.'
    ),
});
export type GeneratePreparednessInsightsInput = z.infer<
  typeof GeneratePreparednessInsightsInputSchema
>;

const InsightSchema = z.object({
  title: z.string().describe('A concise title for the insight.'),
  content: z.string().describe('The detailed content of the insight or recommendation.'),
  type: z.enum(['tip', 'warning', 'action', 'fact']).describe('The type of insight for visual categorization.'),
});

const GeneratePreparednessInsightsOutputSchema = z.object({
  insights: z
    .array(InsightSchema)
    .describe('A list of AI-generated informational insights.'),
});
export type GeneratePreparednessInsightsOutput = z.infer<
  typeof GeneratePreparednessInsightsOutputSchema
>;

export async function generatePreparednessInsights(
  input: GeneratePreparednessInsightsInput
): Promise<GeneratePreparednessInsightsOutput> {
  return generatePreparednessInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePreparednessInsightsPrompt',
  input: {schema: GeneratePreparednessInsightsInputSchema},
  output: {schema: GeneratePreparednessInsightsOutputSchema},
  prompt: `You are an AI insights engine for emergency intelligence. Your task is to generate highly actionable and concise insights based on the user's request.

If a specific topic is provided (e.g., "Earthquake", "Medical"), focus exclusively on that. Otherwise, provide general emergency resilience tips.

GUIDELINES:
- Be concise. One or two sentences per insight.
- Focus on immediate preparedness or safety actions.
- Categorize each insight as 'tip' (general advice), 'warning' (risk awareness), 'action' (specific task), or 'fact' (safety info).

Input Topic: {{{topic}}}

Output a JSON object with an 'insights' array.`,
});

const generatePreparednessInsightsFlow = ai.defineFlow(
  {
    name: 'generatePreparednessInsightsFlow',
    inputSchema: GeneratePreparednessInsightsInputSchema,
    outputSchema: GeneratePreparednessInsightsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('No output from AI');
      return output;
    } catch (error) {
      console.warn('AI Insights Engine rate limited or failed. Returning fallback survival protocols.', error);
      // Fallback data ensures the user always has survival information even if AI quota is exhausted
      return {
        insights: [
          {
            title: "System Resilience Active",
            content: "AI Intelligence capacity is currently limited. Prioritize standard emergency protocols and listen to local authorities.",
            type: "warning"
          },
          {
            title: "Basic Preparedness",
            content: "Confirm you have at least 3 days of water (1 gallon per person per day) and non-perishable food supplies.",
            type: "action"
          },
          {
            title: "Communication Plan",
            content: "Designate an out-of-town emergency contact that all family members can call during a disaster.",
            type: "tip"
          }
        ]
      };
    }
  }
);
