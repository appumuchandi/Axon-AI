'use server';
/**
 * @fileOverview AXON-AI Advanced Emergency Intelligence Assistant.
 * 
 * Provides diagnostic-style emergency assistance with deep intent detection.
 * Inspired by platforms like Ada and Infermedica for structured emergency triage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResourceSchema = z.object({
  name: z.string().describe('The name of the facility.'),
  type: z.string().describe('Type of resource (e.g., Hospital, Pharmacy).'),
  address: z.string().describe('Approximate distance or sector.'),
  googleMapsUrl: z.string().describe('Navigation link.'),
});

const EmergencyAssistantInputSchema = z.object({
  query: z.string().describe("User's description of the emergency."),
});
export type EmergencyAssistantInput = z.infer<typeof EmergencyAssistantInputSchema>;

const EmergencyAssistantOutputSchema = z.object({
  guidance: z.string().describe('Calm, actionable survival instructions.'),
  category: z.enum(['medical', 'disaster', 'safety', 'infrastructure', 'other']),
  followUpQuestions: z.array(z.string()).optional().describe('Diagnostic prompts to narrow down the risk.'),
  suggestedResources: z.array(ResourceSchema).optional(),
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
  prompt: `You are AXON-AI, an expert Emergency Intelligence Engine. 

MISSION:
Act as a calm, highly trained Emergency Medical Dispatcher. Your goal is to provide immediate life-saving steps while gathering critical details.

INTERACTION STYLE:
1. CALM & DIRECT: No fluff. Use clear, numbered lists for actions.
2. DIAGNOSTIC: If the situation is vague, ask one critical question.
3. ADAPTIVE: Tailor guidance for specific injuries (Bleeding, Cardiac, Choking, Stroke) or disasters (Seismic, Flood).
4. SAFETY FIRST: Remind them to contact local emergency services (911/112) at the end of the response.

User Input: {{{query}}}`,
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
      if (!output) throw new Error('AI Timeout');
      return output;
    } catch (error) {
      // HIGH-FIDELITY RESILIENT FALLBACK ENGINE
      const q = input.query.toLowerCase();
      
      if (q.includes('bleed') || q.includes('blood') || q.includes('cut')) {
        return {
          guidance: "Immediate hemorrhage control initiated. \n\n1. Apply firm, direct pressure to the wound with a clean cloth.\n2. Do not remove original bandages if soaked; add more layers.\n3. Keep the injured limb elevated above heart level if possible.\n4. Watch for signs of shock: pale skin, rapid pulse.",
          category: 'medical',
          followUpQuestions: ["Bleeding won't stop", "Wound is deep/gaping", "Victim is dizzy/fainting"]
        };
      }

      if (q.includes('breath') || q.includes('choke') || q.includes('airway')) {
        return {
          guidance: "Airway and breathing protocol active. \n\n1. If the person is choking and cannot cough, perform 5 back blows followed by 5 abdominal thrusts.\n2. If they stop breathing, begin chest-only CPR (100-120 compressions per minute).\n3. Keep the person in a sitting position to aid breathing if they are conscious.",
          category: 'medical',
          followUpQuestions: ["How to do CPR", "Allergic reaction check", "Victim is turning blue"]
        };
      }

      if (q.includes('quake') || q.includes('earthquake') || q.includes('shake')) {
        return {
          guidance: "Seismic survival protocol active.\n\n1. DROP, COVER, and HOLD ON immediately.\n2. Stay away from windows, glass, and heavy furniture.\n3. Do not use elevators. If outdoors, move to an open area away from buildings and power lines.",
          category: 'disaster',
          followUpQuestions: ["Smell gas/leaks", "Structural cracks", "Aftershock steps"]
        };
      }

      return {
        guidance: "I am AXON-AI, your emergency assistant. To provide the most accurate survival guidance, I need to narrow down your situation. Are you experiencing a medical issue, a natural disaster, or a safety threat?",
        category: 'safety',
        followUpQuestions: ["Medical Emergency", "Seismic/Disaster", "Fire/Smoke", "Personal Safety"]
      };
    }
  }
);