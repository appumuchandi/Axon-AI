'use server';
/**
 * @fileOverview AXON-AI Advanced Emergency Intelligence Assistant.
 * 
 * Provides diagnostic-style emergency assistance. 
 * Inspired by platforms like Ada and Infermedica for structured emergency triage.
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
    .describe("The user's description of their situation or symptoms."),
});
export type EmergencyAssistantInput = z.infer<typeof EmergencyAssistantInputSchema>;

const EmergencyAssistantOutputSchema = z.object({
  guidance: z.string().describe('Immediate, diagnostic-style emergency guidance.'),
  category: z.enum(['medical', 'disaster', 'safety', 'infrastructure', 'other']).describe('Classified category.'),
  suggestedResources: z.array(ResourceSchema).optional().describe('Nearby facilities.'),
  followUpQuestions: z.array(z.string()).optional().describe('Diagnostic buttons to narrow down the situation.'),
});
export type EmergencyAssistantOutput = z.infer<typeof EmergencyAssistantOutputSchema>;

const findEmergencyResources = ai.defineTool(
  {
    name: 'findEmergencyResources',
    description: 'Finds nearby hospitals or emergency facilities.',
    inputSchema: z.object({
      resourceType: z.string().describe('Type of resource, e.g., "pharmacy", "hospital".'),
    }),
    outputSchema: z.array(ResourceSchema),
  },
  async (input) => {
    const resources = [
      { name: "Central Medical Emergency Hospital", type: "Hospital", address: "0.8km - Sector 4", googleMapsUrl: "https://www.google.com/maps/search/Central+Medical+Emergency+Hospital" },
      { name: "LifeCare 24/7 Pharmacy", type: "Medical Store", address: "0.3km - Main Street", googleMapsUrl: "https://www.google.com/maps/search/LifeCare+Pharmacy" },
      { name: "City Red Cross Center", type: "Medical Support", address: "1.4km - North Block", googleMapsUrl: "https://www.google.com/maps/search/City+Red+Cross+Center" }
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
  prompt: `You are AXON-AI, a high-fidelity Emergency Medical and Disaster Intelligence system.

MISSION:
Provide structured, diagnostic guidance. Act like an expert Emergency Medical Dispatcher (EMD).

INTERACTION PROTOCOL:
1. DIAGNOSTIC TRIAGE: If the user's input is vague (e.g., "I'm hurt", "Help"), ask a critical diagnostic question.
2. ACTIONABLE STEPS: Provide concise, numbered survival steps.
3. NARROW DOWN: Use the followUpQuestions field to provide "Diagnostic Buttons" that represent specific symptoms or hazards (e.g., "Bleeding Control", "Severe Pain", "Structural Collapse").
4. SAFETY WARNING: Always place the recommendation to contact emergency services (911/112) at the very end of your response.

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
      // RESILIENT DIAGNOSTIC FALLBACK ENGINE
      const q = input.query.toLowerCase();
      
      // Intent: Bleeding
      if (q.includes('bleed') || q.includes('blood') || q.includes('cut')) {
        return {
          guidance: `I am providing immediate hemorrhage control guidance. Follow these steps:

1. Apply direct, firm pressure to the wound with a clean cloth.
2. Do not remove the cloth if it becomes soaked; add more layers on top.
3. If pressure does not stop the bleeding on a limb, identify if a tourniquet is needed.
4. Keep the injured person calm and lying down.

Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.`,
          category: "medical",
          followUpQuestions: ["Wound is Deep", "Bleeding Won't Stop", "Internal Pain", "Identify Nearest Hospital"]
        };
      }

      // Intent: Breathing / Airway
      if (q.includes('breath') || q.includes('choke') || q.includes('suffocat')) {
        return {
          guidance: `I am providing emergency airway and breathing guidance. Follow these steps:

1. Check for obstructions in the mouth or throat.
2. If the person is choking and cannot cough, perform the Heimlich Maneuver (abdominal thrusts).
3. If they are unconscious and not breathing, begin chest-only CPR immediately.
4. Keep the person in a position that allows for the easiest breathing.

Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.`,
          category: "medical",
          followUpQuestions: ["How to do CPR", "Victim is Unconscious", "Allergic Reaction", "Asthma Attack"]
        };
      }

      // Intent: Chest Pain / Heart
      if (q.includes('chest') || q.includes('heart') || q.includes('stroke')) {
        return {
          guidance: `I am providing critical cardiac and stroke emergency guidance. Follow these steps:

1. Have the person sit down, rest, and stay calm.
2. Loosen any tight clothing.
3. Ask if they have prescribed nitroglycerin or aspirin.
4. Monitor for signs of a stroke: facial drooping, arm weakness, or speech difficulty.

Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.`,
          category: "medical",
          followUpQuestions: ["Stroke Check (FAST)", "Aspirin Guidance", "Victim Collapsed", "Find Cardiac Center"]
        };
      }

      // Intent: Seismic
      if (q.includes('quake') || q.includes('shake')) {
        return {
          guidance: `Seismic activity protocols active. Your immediate physical safety is the priority:

1. Drop, Cover, and Hold On.
2. Stay away from glass, windows, and heavy furniture.
3. If outdoors, move to an open area away from buildings and power lines.
4. Do not move until the shaking stops completely.

Please prioritize your immediate safety. If you are in a life-threatening situation, contact emergency services (911/112) now.`,
          category: "disaster",
          followUpQuestions: ["Check for Gas Leaks", "Structural Hazard", "Aftershock Steps", "Evacuation Route"]
        };
      }

      // Default Diagnostic / Vague
      return {
        guidance: `I am AXON-AI, your emergency intelligence assistant. To provide the most accurate survival guidance, I need to narrow down your situation. 

Are you experiencing a medical emergency, a natural disaster, or a personal safety threat?`,
        category: "safety",
        followUpQuestions: ["Medical Emergency", "Seismic/Disaster", "Fire/Smoke", "Personal Safety Threat"]
      };
    }
  }
);
