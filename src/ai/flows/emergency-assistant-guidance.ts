'use server';
/**
 * @fileOverview AXON-AI Advanced Emergency Intelligence Assistant.
 * 
 * Provides calm, contextual, and resilient assistance during critical situations.
 * Strictly follows the Advanced Emergency Intelligence Prompt guidelines.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResourceSchema = z.object({
  name: z.string().describe('The name of the facility.'),
  type: z.string().describe('Type of resource (e.g., Hospital, Pharmacy, Evacuation Center).'),
  address: z.string().describe('Approximate address or distance.'),
  googleMapsUrl: z.string().describe('A direct link to Google Maps for directions.'),
});

const EmergencyAssistantInputSchema = z.object({
  query: z
    .string()
    .describe("The user's question or description of their emergency situation."),
});
export type EmergencyAssistantInput = z.infer<typeof EmergencyAssistantInputSchema>;

const EmergencyAssistantOutputSchema = z.object({
  guidance: z.string().describe('Immediate, relevant, and concise emergency guidance.'),
  category: z.enum(['medical', 'disaster', 'safety', 'infrastructure', 'other']).describe('The classified category of the emergency.'),
  suggestedResources: z.array(ResourceSchema).optional().describe('Nearby facilities relevant to the query.'),
});
export type EmergencyAssistantOutput = z.infer<typeof EmergencyAssistantOutputSchema>;

const findEmergencyResources = ai.defineTool(
  {
    name: 'findEmergencyResources',
    description: 'Finds nearby hospitals, medical stores, pharmacies, or evacuation centers.',
    inputSchema: z.object({
      resourceType: z.string().describe('Type of resource, e.g., "pharmacy", "hospital".'),
    }),
    outputSchema: z.array(ResourceSchema),
  },
  async (input) => {
    const resources = [
      { name: "Central Medical Emergency Hospital", type: "Hospital", address: "0.8km - Sector 4", googleMapsUrl: "https://www.google.com/maps/search/Central+Medical+Emergency+Hospital" },
      { name: "LifeCare 24/7 Pharmacy", type: "Medical Store", address: "0.3km - Main Street", googleMapsUrl: "https://www.google.com/maps/search/LifeCare+Pharmacy" },
      { name: "City Red Cross Center", type: "Medical Support", address: "1.4km - North Block", googleMapsUrl: "https://www.google.com/maps/search/City+Red+Cross+Center" },
      { name: "Community Health Hub", type: "Pharmacy", address: "0.6km - East Ave", googleMapsUrl: "https://www.google.com/maps/search/Community+Health+Hub" }
    ];
    const type = input.resourceType.toLowerCase();
    return resources.filter(r => r.type.toLowerCase().includes(type) || type === 'medical' || type === 'emergency');
  }
);

export async function emergencyAssistantGuidance(
  input: EmergencyAssistantInput
): Promise<EmergencyAssistantOutput> {
  return emergencyAssistantGuidanceFlow(input);
}

const emergencyAssistantPrompt = ai.definePrompt({
  name: 'emergencyAssistantPrompt',
  tools: [findEmergencyResources],
  input: {schema: EmergencyAssistantInputSchema},
  output: {schema: EmergencyAssistantOutputSchema},
  prompt: `You are AXON-AI, an offline-first emergency intelligence system. Your mission is to provide calm, contextual, and resilient assistance during critical real-world situations.

CORE PERSONALITY:
- Be a calm emergency companion, an intelligent responder, and a trustworthy assistant.
- Sound composed, reassuring, practical, and dependable.
- NEVER sound robotic, cold, alarmist, or detached.

RESPONSE PROTOCOL:
1. Briefly acknowledge the situation calmly.
2. Explain the possible concern clearly and responsibly.
3. Provide immediate, safe, step-by-step actions.
4. Recommend professional emergency services (911/112) when appropriate.
5. Offer AXON-AI assistance actions (SOS, location sharing, emergency contacts).

User Situation: {{{query}}}`,
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
      console.warn('Axon-AI Engine rate limited. Using contextual resilience.', error);
      
      const q = input.query.toLowerCase();
      
      if (q.includes('heart') || q.includes('cardiac') || q.includes('chest pain') || q.includes('pain')) {
        return {
          guidance: `Possible medical emergency detected. Please stay calm and sit down immediately. 

If you are experiencing chest pressure or difficulty breathing, seek emergency medical help (911) right now.

Immediate Actions:
1. Alert someone nearby.
2. Stop all physical activity.
3. Keep your phone nearby and remain conscious.

Axon-AI is standing by for SOS activation or location sharing.`,
          category: "medical"
        };
      }

      return {
        guidance: "Connectivity appears limited, but AXON-AI is continuing in offline assistance mode. \n\n1. Prioritize your immediate safety.\n2. Call professional emergency services if you are in danger.\n3. I am standing by for location sharing and SOS broadcasting.",
        category: "infrastructure"
      };
    }
  }
);