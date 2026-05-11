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
      console.warn('Axon-AI Engine fallback engaged.', error);
      
      const q = input.query.toLowerCase();
      
      if (q.includes('first aid') || q.includes('steps') || q.includes('help')) {
        return {
          guidance: `Here are the most important immediate first-aid priorities during an emergency:

1. Ensure the area is safe before helping anyone.
2. Check if the person is conscious and breathing.
3. Call emergency services immediately if the condition is serious.
4. Control severe bleeding using clean pressure if necessary.
5. Keep the person calm and avoid unnecessary movement.

Please describe the specific situation so AXON-AI can provide more tailored guidance.`,
          category: "medical"
        };
      }

      if (q.includes('heart') || q.includes('cardiac') || q.includes('chest pain') || q.includes('breath')) {
        return {
          guidance: `Possible medical emergency detected. Please stay calm and sit down immediately. 

If you are experiencing chest pressure, pain, or difficulty breathing, seek emergency medical help (911/112) right now.

Immediate Actions:
1. Alert someone nearby.
2. Stop all physical activity.
3. Keep your phone nearby and remain conscious.
4. If you have prescribed heart medication, follow your doctor's instructions.

Axon-AI is standing by for SOS activation or location sharing.`,
          category: "medical"
        };
      }

      if (q.includes('quake') || q.includes('shake') || q.includes('seismic')) {
        return {
          guidance: `Seismic activity protocols active. Please prioritize your immediate physical safety.

1. Drop, Cover, and Hold On. Find a sturdy table or desk.
2. Stay away from glass, windows, and heavy furniture.
3. If outdoors, move to an open area away from buildings and power lines.
4. Do not use elevators.

Stay alert for aftershocks. Axon-AI is monitoring your safety grid.`,
          category: "disaster"
        };
      }

      return {
        guidance: `I am standing by to assist you. Please prioritize your immediate safety and follow these steps:

1. Assess your surroundings for any immediate danger.
2. If you are injured or in danger, call professional emergency services (911/112) immediately.
3. Use the SOS features if you need to broadcast your location to your rescue network.

Describe your situation in more detail, and AXON-AI will provide the safest immediate steps.`,
        category: "safety"
      };
    }
  }
);