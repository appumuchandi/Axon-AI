'use server';
/**
 * @fileOverview An AI emergency assistant that provides guidance on first-aid, disaster survival, and safety procedures.
 *
 * - emergencyAssistantGuidance - A function that handles the AI emergency assistant interaction.
 * - EmergencyAssistantInput - The input type for the emergencyAssistantGuidance function.
 * - EmergencyAssistantOutput - The return type for the emergencyAssistantGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmergencyAssistantInputSchema = z.object({
  query: z
    .string()
    .describe("The user's question or description of their emergency situation."),
});
export type EmergencyAssistantInput = z.infer<typeof EmergencyAssistantInputSchema>;

const EmergencyAssistantOutputSchema = z.object({
  guidance: z.string().describe('Immediate, relevant, and concise emergency guidance.'),
  category: z.enum(['first-aid', 'survival', 'safety', 'other']).describe('The category of the emergency guidance.'),
});
export type EmergencyAssistantOutput = z.infer<typeof EmergencyAssistantOutputSchema>;

export async function emergencyAssistantGuidance(
  input: EmergencyAssistantInput
): Promise<EmergencyAssistantOutput> {
  return emergencyAssistantGuidanceFlow(input);
}

const emergencyAssistantPrompt = ai.definePrompt({
  name: 'emergencyAssistantPrompt',
  input: {schema: EmergencyAssistantInputSchema},
  output: {schema: EmergencyAssistantOutputSchema},
  prompt: `You are AXON-AI, an expert emergency intelligence assistant. Your mission is to provide life-saving, direct, and actionable guidance for emergency situations.

Focus your response on the following areas:
1. FIRST-AID: Provide step-by-step medical instructions (e.g., CPR, wound care, choking).
2. DISASTER SURVIVAL: Give instructions for surviving natural disasters (e.g., earthquakes, floods, fires).
3. SAFETY PROCEDURES: Explain evacuation protocols, hazardous material safety, and emergency prep.

INSTRUCTIONS:
- Be concise. Seconds matter.
- Use numbered lists for steps.
- Always include a disclaimer to contact professional emergency services (911/112).
- Use a calm, professional tone.

User's Situation/Question: {{{query}}}`,
});

const emergencyAssistantGuidanceFlow = ai.defineFlow(
  {
    name: 'emergencyAssistantGuidanceFlow',
    inputSchema: EmergencyAssistantInputSchema,
    outputSchema: EmergencyAssistantOutputSchema,
  },
  async input => {
    try {
      const {output} = await emergencyAssistantPrompt(input);
      if (!output) throw new Error('No output from AI');
      return output;
    } catch (error) {
      console.warn('AI Assistant rate limited or failed. Returning core emergency protocols.', error);
      return {
        guidance: "URGENT SYSTEM ALERT: AI capacity is currently exceeded. Follow these core emergency protocols:\n\n1. CALL EMERGENCY SERVICES (911/112) immediately if in danger.\n2. Administer basic first-aid: check breathing, apply pressure to stop bleeding.\n3. Secure your immediate surroundings or evacuate to a designated safe zone.\n4. Stay tuned to local emergency radio for official broadcasts.",
        category: "safety"
      };
    }
  }
);
