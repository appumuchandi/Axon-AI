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
  category: z.enum(['first-aid', 'survival', 'safety', 'other']).describe('The category of the emergency guidance.'),
  suggestedResources: z.array(ResourceSchema).optional().describe('Nearby facilities relevant to the query.'),
});
export type EmergencyAssistantOutput = z.infer<typeof EmergencyAssistantOutputSchema>;

// Tool to provide real-world rescue resources to the LLM
const findEmergencyResources = ai.defineTool(
  {
    name: 'findEmergencyResources',
    description: 'Finds nearby hospitals, medical stores, pharmacies, or evacuation centers based on the user query.',
    inputSchema: z.object({
      resourceType: z.string().describe('Type of resource to look for, e.g., "pharmacy", "hospital", "store".'),
    }),
    outputSchema: z.array(ResourceSchema),
  },
  async (input) => {
    // In a real app, this would call a Places API or a geo-query on Firestore
    // Providing deterministic mock data for the hackathon/demo
    const resources = [
      { 
        name: "Central Medical Emergency Hospital", 
        type: "Hospital", 
        address: "0.8km - Sector 4", 
        googleMapsUrl: "https://www.google.com/maps/search/Central+Medical+Emergency+Hospital" 
      },
      { 
        name: "LifeCare 24/7 Pharmacy", 
        type: "Medical Store", 
        address: "0.3km - Main Street", 
        googleMapsUrl: "https://www.google.com/maps/search/LifeCare+Pharmacy" 
      },
      { 
        name: "City Red Cross Center", 
        type: "Medical Support", 
        address: "1.4km - North Block", 
        googleMapsUrl: "https://www.google.com/maps/search/City+Red+Cross+Center" 
      },
      { 
        name: "Community Health Hub", 
        type: "Pharmacy", 
        address: "0.6km - East Ave", 
        googleMapsUrl: "https://www.google.com/maps/search/Community+Health+Hub" 
      }
    ];

    const type = input.resourceType.toLowerCase();
    return resources.filter(r => 
      r.type.toLowerCase().includes(type) || 
      r.name.toLowerCase().includes(type) ||
      type === 'medical' || type === 'emergency'
    );
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
  prompt: `You are AXON-AI, the core of this UNIQUE Emergency Intelligence System. You are disaster-ready, offline-optimized, and resilient.

Your mission is to provide life-saving, direct, and actionable guidance for emergency situations. You operate when traditional systems fail.

If the user asks for nearby resources (hospitals, pharmacies, stores, etc.), use the findEmergencyResources tool to get specific locations.

Focus your response on the following areas:
1. FIRST-AID: Provide step-by-step medical instructions (e.g., CPR, wound care, choking).
2. DISASTER SURVIVAL: Give instructions for surviving natural disasters (e.g., earthquakes, floods, fires).
3. SAFETY PROCEDURES: Explain evacuation protocols and hazardous material safety.

INSTRUCTIONS:
- Be concise. Seconds matter.
- Use numbered lists for steps.
- Always include a disclaimer to contact professional emergency services (911/112).
- If resources are found, summarize the best options briefly in the guidance and return the suggestedResources array.

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
      console.warn('AI Assistant capacity exceeded. Using contextual fallback.', error);
      
      const q = input.query.toLowerCase();
      
      // Contextual fallbacks to "react in accordance" even when LLM is down
      if (q.includes('cpr')) {
        return {
          guidance: "DISASTER PROTOCOL ACTIVE (CPR):\n1. Call 911/112 immediately.\n2. Push hard and fast in the center of the chest.\n3. Rate: 100-120 compressions per minute.\n4. Allow full chest recoil.",
          category: "first-aid"
        };
      }
      
      if (q.includes('medical') || q.includes('store') || q.includes('hospital') || q.includes('pharmacy')) {
        return {
          guidance: "Intelligence Link Disrupted. Accessing locally cached medical resources from the Resilient Intelligence Engine. Priority: Seek professional care at the nearest Trauma Center.",
          category: "safety",
          suggestedResources: [
            { name: "Central Medical Emergency Hospital", type: "Hospital", address: "0.8km", googleMapsUrl: "https://www.google.com/maps/search/Central+Medical+Emergency+Hospital" },
            { name: "LifeCare 24/7 Pharmacy", type: "Medical Store", address: "0.3km", googleMapsUrl: "https://www.google.com/maps/search/LifeCare+Pharmacy" }
          ]
        };
      }

      return {
        guidance: "SYSTEM CRITICAL ALERT: Cloud intelligence is restricted. Follow these Resilience Protocols:\n\n1. CALL EMERGENCY SERVICES (911/112) immediately if in danger.\n2. Administer basic first-aid: check breathing, apply pressure to stop bleeding.\n3. Secure your immediate surroundings or evacuate to a designated safe zone.",
        category: "safety"
      };
    }
  }
);
