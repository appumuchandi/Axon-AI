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

Generate exactly 4 highly actionable and concise insights based on the topic provided.

CATEGORIES:
- 'tip' (🛡 Guidance): General survival guidance or safety steps.
- 'warning' (⚠ Alert): Critical alerts or danger awareness.
- 'action' (📡 Connectivity): Communication, power, or connectivity steps.
- 'fact' (🤖 AI Insight): Intelligence briefings or situational awareness.

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
            { title: "Aftershock Risk", content: "Stay alert for aftershocks. Each shaking event can further weaken structures.", type: "warning" },
            { title: "Safe Shelter Guidance", content: "Find a sturdy table or desk. Stay away from glass, windows, and heavy furniture.", type: "tip" },
            { title: "Structural Hazard Awareness", content: "Check for gas leaks and structural cracks before re-entering any building.", type: "fact" },
            { title: "Emergency Evacuation Steps", content: "Have a 'go-bag' ready and know your primary and secondary exit routes.", type: "action" }
          ]
        };
      }

      if (topic.includes('flood') || topic.includes('water')) {
        return {
          insights: [
            { title: "Flood Safety Guidance", content: "Never walk or drive through moving water. Just 6 inches can knock you over.", type: "warning" },
            { title: "Water Contamination Alert", content: "Flood water may contain sewage or chemicals. Boil water before consumption.", type: "fact" },
            { title: "Emergency Shelter Access", content: "Locate high ground and established community shelters immediately.", type: "tip" },
            { title: "Safe Evacuation Recommendations", content: "Follow official evacuation routes. Do not use shortcuts through unknown terrain.", type: "action" }
          ]
        };
      }

      if (topic.includes('medical')) {
        return {
          insights: [
            { title: "Emergency Medical Guidance", content: "If the victim is unresponsive, check for breathing and start CPR immediately if trained.", type: "action" },
            { title: "Symptom Monitoring", content: "Watch for signs of shock: pale skin, rapid pulse, and shallow breathing.", type: "fact" },
            { title: "First-Aid Support", content: "Apply direct pressure to wounds using clean dressings to stop severe bleeding.", type: "tip" },
            { title: "Critical Response Actions", content: "Keep the patient warm and still until professional medical help arrives.", type: "warning" }
          ]
        };
      }

      // Default / General
      return {
        insights: [
          { title: "Emergency Preparedness", content: "Verify you have 3 days of water (1 gal/person) and non-perishable food supplies.", type: "tip" },
          { title: "Offline Assistance Active", content: "Axon-AI is operating in local mode. All critical survival data remains available.", type: "fact" },
          { title: "Backup Communication", content: "Designate an out-of-town contact that all family members can call during a disaster.", type: "action" },
          { title: "Resource Planning", content: "Ensure flashlights, batteries, and a first-aid kit are easily accessible in the dark.", type: "warning" }
        ]
      };
    }
  }
);
