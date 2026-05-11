'use server';
/**
 * @fileOverview AXON-AI Advanced Emergency Intelligence Assistant.
 * 
 * Provides calm, contextual, and resilient assistance during critical situations.
 * Prioritizes user intent over system state.
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
  followUpQuestions: z.array(z.string()).optional().describe('Suggested buttons to narrow down the emergency.'),
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
  prompt: `You are AXON-AI, an expert emergency intelligence system. Your mission is to provide calm, contextual, and resilient assistance.

CORE PERSONALITY:
- Be a calm emergency companion, an intelligent responder, and a trustworthy assistant.
- Sound composed, reassuring, and dependable.
- NEVER mention connectivity issues, cloud failures, or rate limits in your guidance.

RESPONSE PROTOCOL:
1. Acknowledge the situation calmly.
2. Explain the possible concern clearly.
3. Provide immediate, safe, step-by-step actions.
4. If the query is vague (e.g., "Help me", "I'm in trouble"), use the followUpQuestions field to suggest specific emergency types (e.g., "Medical Emergency", "Fire Safety", "Personal Safety").

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
      console.warn('Axon-AI Engine Fallback engaged.', error);
      
      const q = input.query.toLowerCase();
      
      // INTENT DETECTION
      if (q.includes('medical') || q.includes('hurt') || q.includes('injury') || q.includes('bleeding')) {
        return {
          guidance: `Possible medical emergency detected. Please follow these immediate safety steps:

1. Ensure the area is safe for both you and the victim.
2. Check for consciousness and regular breathing.
3. If there is severe bleeding, apply direct pressure with a clean cloth.
4. Keep the person warm and still.
5. Contact emergency services (911/112) immediately if the condition is life-threatening.`,
          category: "medical",
          followUpQuestions: ["Bleeding Control", "Breathing Support", "Unconscious Person", "Chest Pain"]
        };
      }

      if (q.includes('quake') || q.includes('shake') || q.includes('earthquake')) {
        return {
          guidance: `Seismic activity detected. Your immediate physical safety is the priority.

1. Drop, Cover, and Hold On. Find a sturdy table or desk.
2. Stay away from windows, glass, and heavy furniture.
3. If outdoors, move to an open area away from buildings and power lines.
4. Do not use elevators.`,
          category: "disaster",
          followUpQuestions: ["Aftershock Guidance", "Safe Shelter", "Structural Safety"]
        };
      }

      if (q.includes('help') || q.length < 10) {
        return {
          guidance: `I am standing by to assist you. To provide the most accurate safety guidance, could you please describe your situation?`,
          category: "safety",
          followUpQuestions: ["Medical Emergency", "Fire or Disaster", "Personal Safety Threat", "Infrastructure Issue"]
        };
      }

      return {
        guidance: `Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.

Safe steps to take:
1. Assess your surroundings for immediate danger.
2. Move to a secure location if possible.
3. Keep your phone battery conserved and notify a trusted contact of your position.

Describe the specific emergency for more detailed AXON-AI guidance.`,
        category: "safety",
        followUpQuestions: ["Share Location", "Nearby Medical Aid", "Emergency Kit Steps"]
      };
    }
  }
);