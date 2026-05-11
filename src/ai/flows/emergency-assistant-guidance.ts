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
  prompt: `You are an AI-powered emergency assistant. Your primary goal is to provide immediate, relevant, and concise guidance on first-aid, disaster survival, or safety procedures based on the user's input.

Prioritize actionable steps and clear instructions. Keep your responses direct and to the point, as the user is in an emergency situation.

User's Situation/Question: {{{query}}}`,
});

const emergencyAssistantGuidanceFlow = ai.defineFlow(
  {
    name: 'emergencyAssistantGuidanceFlow',
    inputSchema: EmergencyAssistantInputSchema,
    outputSchema: EmergencyAssistantOutputSchema,
  },
  async input => {
    const {output} = await emergencyAssistantPrompt(input);
    return output!;
  }
);
