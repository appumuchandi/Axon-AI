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
    // Mock data for the Resilient Intelligence Engine
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
  prompt: `You are AXON-AI, a high-intelligence, resilient Emergency Assistant.

When a user describes a critical medical symptom (e.g., chest pain, heart pain, difficulty breathing, severe bleeding):
1. SOUND CALM AND HUMAN-CENTERED. Do not use technical jargon or "system alert" language.
2. BE ACTIONABLE. Provide immediate, life-saving steps.
3. BE MEDICALLY APPROPRIATE.

Example for Cardiac Pain:
- Acknowledge: "Possible cardiac emergency detected."
- Advice: "Please stay calm and sit down in a safe position."
- Check symptoms: Chest pressure, breathing difficulty, pain spreading to arm/jaw, back pain, dizziness, or sweating.
- Immediate Actions: Call 911/112, avoid physical activity, take prescribed heart medication.
- Offer Next Steps: Ask if they would like AXON-AI to trigger SOS mode, share their location, or alert emergency contacts.

For general emergencies:
- Use numbered lists for steps.
- Always include a disclaimer to contact professional emergency services (911/112).
- If resources are needed, use the findEmergencyResources tool.
- Be concise. Seconds matter.

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
      
      // Cardiac Fallback - Medically Appropriate & Calm
      if (q.includes('heart') || q.includes('cardiac') || q.includes('chest pain')) {
        return {
          guidance: `Possible cardiac emergency detected.

Please stay calm and sit down in a safe position.

If you are experiencing:
- chest pressure or tightness
- difficulty breathing
- pain spreading to the arm, jaw, or back
- dizziness or sweating

seek emergency medical help immediately.

Immediate Actions:
1. Call emergency services (911/112) or alert a nearby person.
2. Avoid physical activity.
3. If prescribed, take your heart medication.
4. Keep your phone nearby and remain conscious if possible.

Would you like AXON-AI to:
- trigger SOS mode
- share your location
- contact emergency contacts`,
          category: "first-aid"
        };
      }

      // CPR Fallback
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
