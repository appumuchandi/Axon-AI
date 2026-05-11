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
2. Provide immediate, safe, step-by-step actions.
3. If the query is vague (e.g., "Help me", "I'm in trouble"), use the followUpQuestions field to suggest specific emergency types to narrow down.
4. IMPORTANT: Always place the recommendation to contact emergency services (911/112) at the very end of your response.

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
      // RESILIENT FALLBACK ENGINE
      // Operates locally when API quota is exhausted or connectivity is limited.
      const q = input.query.toLowerCase();
      
      // Intent: Medical Emergency
      if (q.includes('medical') || q.includes('hurt') || q.includes('injury') || q.includes('bleeding') || q.includes('pain') || q.includes('cpr') || q.includes('breathing')) {
        return {
          guidance: `I am providing immediate medical emergency guidance. Please follow these steps:

1. Assess for consciousness and regular breathing.
2. If the victim is not breathing, begin chest-only CPR immediately (100-120 compressions per minute).
3. For severe bleeding, apply direct, firm pressure with a clean cloth.
4. Keep the person warm and avoid moving them unless they are in immediate danger.

Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.`,
          category: "medical",
          followUpQuestions: ["Bleeding Control", "Breathing Problem", "Unconscious Person", "Chest Pain", "Burn Injury"]
        };
      }

      // Intent: Seismic / Earthquake
      if (q.includes('quake') || q.includes('shake') || q.includes('earthquake')) {
        return {
          guidance: `Seismic activity protocols engaged. Your immediate physical safety is the priority:

1. Drop, Cover, and Hold On. Find a sturdy table or desk.
2. Stay away from windows, glass, and heavy furniture.
3. If you are outdoors, move to an open area away from buildings, power lines, and trees.
4. Do not use elevators or run outside during shaking.

Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.`,
          category: "disaster",
          followUpQuestions: ["Aftershock Guidance", "Structural Safety", "Check for Gas Leaks", "Evacuation Routes"]
        };
      }

      // Intent: Vague / Help
      if (q.includes('help') || q.length < 12) {
        return {
          guidance: `I am AXON-AI, standing by to assist you. To provide the most accurate safety guidance, could you please describe your situation?`,
          category: "safety",
          followUpQuestions: ["Medical Emergency", "Fire or Disaster", "Seismic Activity", "Personal Safety Threat", "Infrastructure Issue"]
        };
      }

      // Intent: Fire / Flood / Disaster
      if (q.includes('fire') || q.includes('flood') || q.includes('water') || q.includes('smoke')) {
        return {
          guidance: `Emergency disaster protocols active. Follow these immediate survival steps:

1. Move to the safest designated area (high ground for floods, low to the ground for smoke/fire).
2. If there is smoke, cover your mouth with a damp cloth and stay low.
3. For floods, never attempt to walk or drive through moving water.
4. Keep your phone on low power mode and notify a contact of your location.

Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.`,
          category: "disaster",
          followUpQuestions: ["Evacuation Plan", "Fire Safety", "Rising Water Steps", "Nearest Shelter"]
        };
      }

      // Default Resilient Response
      return {
        guidance: `I am prioritizing your immediate safety. Please follow these core emergency steps:

1. Assess your surroundings for any immediate danger before acting.
2. Move to a secure location and try to stay calm.
3. Conserve your phone battery and keep a trusted contact informed of your position.
4. Identify any nearby medical or safety resources if possible.

Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.`,
        category: "safety",
        followUpQuestions: ["Medical Support", "Identify Hazards", "Survival Kits", "Connectivity Help"]
      };
    }
  }
);
