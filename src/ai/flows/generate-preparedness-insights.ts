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
  prompt: `You are an AI insights engine for emergency preparedness. Your task is to generate informational insights based on the user's request.

If a specific topic is provided, focus the insights on that topic. Otherwise, provide general emergency preparedness suggestions, risk awareness tips, disaster response recommendations, and safety improvement guidance.

Ensure the insights are informative, concise, and easy to understand. Provide at least 3 distinct insights.

Input Topic: {{{topic}}}

Output a JSON object with an 'insights' array, where each element has a 'title' and 'content' field.`,
});

const generatePreparednessInsightsFlow = ai.defineFlow(
  {
    name: 'generatePreparednessInsightsFlow',
    inputSchema: GeneratePreparednessInsightsInputSchema,
    outputSchema: GeneratePreparednessInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
