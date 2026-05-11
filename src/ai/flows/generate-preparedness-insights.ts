'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating AI-powered informational insights related to emergency preparedness.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePreparednessInsightsInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe(
      'An optional topic for the AI to generate insights about, e.g., "earthquake preparedness" or "hurricane safety".'
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
  prompt: `You are the Axon-AI Engine. Your mission is disaster readiness and survival intelligence.

Generate highly actionable and concise insights based on the topic.

CATEGORIES:
- 'tip' (🛡 Guidance)
- 'warning' (⚠ Alert)
- 'action' (📡 Connectivity)
- 'fact' (🤖 AI Insight)

Topic: {{{topic}}}`,
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
      console.warn('Axon-AI rate limited. Using resilient fallback logic.');
      
      const topic = input.topic?.toLowerCase() || "";
      
      if (topic.includes('seismic') || topic.includes('earthquake')) {
        return {
          insights: [
            { title: "Drop, Cover, Hold On", content: "Immediately drop to your hands and knees. Cover your head and neck with your arms. Hold on until shaking stops.", type: "warning" },
            { title: "Safe Zones", content: "Stay away from glass, windows, outside doors and walls, and anything that could fall.", type: "tip" },
            { title: "Structural Warnings", content: "Be aware that some earthquakes are actually foreshocks and a larger earthquake might occur.", type: "fact" }
          ]
        };
      }

      if (topic.includes('flood') || topic.includes('water')) {
        return {
          insights: [
            { title: "Water Safety", content: "Do not walk, swim, or drive through flood waters. Turn Around, Don't Drown!", type: "warning" },
            { title: "Evacuation Guidance", content: "If told to evacuate, do so immediately. Never ignore evacuation orders.", type: "action" },
            { title: "Contamination Alerts", content: "Floodwaters may contain sewage, sharp objects, and hazardous chemicals.", type: "fact" }
          ]
        };
      }

      if (topic.includes('medical')) {
        return {
          insights: [
            { title: "Emergency Assistance", content: "If someone is unconscious or not breathing, call 911 immediately and start CPR if trained.", type: "action" },
            { title: "First-Aid Actions", content: "Apply firm, steady pressure to any site of severe bleeding with a clean cloth.", type: "tip" },
            { title: "Breathing Guidance", content: "Help the person into a comfortable position, usually sitting, and loosen tight clothing.", type: "fact" }
          ]
        };
      }

      return {
        insights: [
          { title: "Local Survival Protocol", content: "Disaster-ready intelligence capacity is restricted. Prioritize standard emergency protocols and listen to local authorities.", type: "warning" },
          { title: "Resource Preparedness", content: "Confirm you have at least 3 days of water (1 gallon per person per day) and non-perishable food supplies.", type: "action" },
          { title: "Communication Resilience", content: "Designate an out-of-town emergency contact that all family members can call during a disaster.", type: "tip" }
        ]
      };
    }
  }
);