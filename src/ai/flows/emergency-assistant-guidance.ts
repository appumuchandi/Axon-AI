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
3. ADAPTIVE: Tailor guidance for specific injuries (Bleeding, Cardiac, Choking, Stroke, Chest Pain) or disasters (Seismic, Flood, Fire).
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
      
      // Cardiac / Chest Pain
      if (q.includes('chest') || q.includes('heart') || q.includes('pain in chest')) {
        return {
          guidance: "Chest pain protocol initiated. Please try to remain as calm and still as possible.\n\n1. Sit down and avoid any physical exertion.\n2. Loosen tight clothing around the neck and waist.\n3. If you have prescribed nitroglycerin, take it now.\n4. Prepare for immediate medical transport.",
          category: 'medical',
          followUpQuestions: ["Difficulty breathing?", "Pain in arm/jaw?", "Dizziness/Sweating?"]
        };
      }

      // Bleeding
      if (q.includes('bleed') || q.includes('blood') || q.includes('cut')) {
        return {
          guidance: "Hemorrhage control initiated. Immediate action required.\n\n1. Apply firm, direct pressure to the wound with a clean cloth or bandage.\n2. If the cloth becomes soaked, do not remove it; add another layer on top.\n3. Keep the injured area elevated above heart level if possible.\n4. If bleeding is life-threatening and on a limb, consider a tourniquet if trained.",
          category: 'medical',
          followUpQuestions: ["Wound is deep/gaping", "Victim is pale/dizzy", "Bleeding is pulsing"]
        };
      }

      // Airway / Choking
      if (q.includes('breath') || q.includes('choke') || q.includes('airway') || q.includes('cant breathe')) {
        return {
          guidance: "Airway and breathing protocol active.\n\n1. If the person is choking and cannot speak, perform 5 back blows followed by 5 abdominal thrusts (Heimlich maneuver).\n2. If they are struggling to breathe but conscious, help them sit upright.\n3. Check for any obstructions in the mouth.\n4. If they stop breathing, begin chest-only CPR immediately.",
          category: 'medical',
          followUpQuestions: ["Victim is unconscious?", "Turning blue?", "Allergic reaction?"]
        };
      }

      // Fire
      if (q.includes('fire') || q.includes('smoke') || q.includes('burning')) {
        return {
          guidance: "Fire safety protocol active. Immediate evacuation is the priority.\n\n1. Evacuate the building immediately using the nearest exit.\n2. If there is smoke, stay low to the floor where the air is cleaner.\n3. Feel doors with the back of your hand before opening; if hot, find another route.\n4. Do not use elevators.",
          category: 'safety',
          followUpQuestions: ["Trapped in room?", "Smell gas?", "Injuries from burns?"]
        };
      }

      // Earthquake
      if (q.includes('quake') || q.includes('earthquake') || q.includes('shake')) {
        return {
          guidance: "Seismic survival protocol active.\n\n1. DROP, COVER, and HOLD ON immediately.\n2. Stay under a sturdy table or desk. Stay away from windows and heavy furniture.\n3. If outdoors, move to an open area away from buildings, power lines, and trees.\n4. Stay where you are until the shaking stops.",
          category: 'disaster',
          followUpQuestions: ["Smell gas leaks?", "Structural damage?", "People trapped?"]
        };
      }

      // Flood
      if (q.includes('flood') || q.includes('water') || q.includes('rising')) {
        return {
          guidance: "Flood emergency protocol active.\n\n1. Move to higher ground immediately. If in a building, go to the highest floor.\n2. Never walk, swim, or drive through moving water. Just 6 inches can knock you over.\n3. Avoid contact with floodwater; it may be contaminated or electrically charged.\n4. Turn off utilities at the main switches if safe to do so.",
          category: 'disaster',
          followUpQuestions: ["Trapped by water?", "Power is still on?", "Medical emergency?"]
        };
      }

      // Unconscious
      if (q.includes('unconscious') || q.includes('passed out') || q.includes('not waking up')) {
        return {
          guidance: "Unresponsive victim protocol active.\n\n1. Check for breathing and a pulse.\n2. If breathing, place them in the recovery position (on their side).\n3. If NOT breathing, begin chest compressions immediately (100-120 per minute).\n4. Do not leave the victim alone; stay with them until help arrives.",
          category: 'medical',
          followUpQuestions: ["Victim is breathing?", "How to do CPR?", "Head injury suspected?"]
        };
      }

      return {
        guidance: "I am AXON-AI, your emergency assistant. Please describe the situation or your symptoms clearly (e.g., 'chest pain', 'severe bleeding', 'house fire') so I can provide the correct survival protocol immediately.",
        category: 'safety',
        followUpQuestions: ["Medical Issue", "Natural Disaster", "Fire/Smoke", "Personal Safety"]
      };
    }
  }
);
