'use server';
/**
 * @fileOverview AXON-AI Advanced Emergency Intelligence Assistant.
 * 
 * Provides diagnostic-style emergency assistance with deep intent detection.
 * Optimized for zero-delay triage and high-fidelity local fallback logic.
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
Act as a calm, highly trained Emergency Medical Dispatcher. Provide immediate life-saving steps while gathering critical details.

CRITICAL INSTRUCTION:
If the user describes a clear emergency (e.g., "chest pain", "bleeding", "fire"), skip all introductions. Provide immediate survival protocols and ask diagnostic follow-up questions to assess risk level.

INTERACTION STYLE:
1. CALM & DIRECT: No fluff. Use clear, numbered lists for actions.
2. DIAGNOSTIC: Ask 1-3 critical questions to narrow down life-threatening risks.
3. ADAPTIVE: Tailor guidance for specific injuries (Bleeding, Cardiac, Choking, Stroke, Chest Pain) or disasters (Seismic, Flood, Fire).
4. SAFETY FIRST: Remind them to contact local emergency services (911/112) if necessary.

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
      // HIGH-FIDELITY ZERO-DELAY FALLBACK ENGINE
      // This bypasses generic "I am offline" messages in favor of context-aware guidance.
      const q = input.query.toLowerCase();
      
      // Cardiac / Chest Pain
      if (q.includes('chest') || q.includes('heart') || q.includes('pain')) {
        return {
          guidance: "Chest pain protocol initiated. Please try to remain as calm and still as possible.\n\n1. Sit down immediately and avoid any physical activity.\n2. Loosen tight clothing around the neck and waist.\n3. If symptoms worsen or spread to the jaw/arm, activate SOS immediately.",
          category: 'medical',
          followUpQuestions: ["Are you having difficulty breathing?", "Is the pain spreading to your arm or jaw?", "Do you feel dizzy or sweaty?"]
        };
      }

      // Bleeding
      if (q.includes('bleed') || q.includes('blood') || q.includes('cut') || q.includes('wound')) {
        return {
          guidance: "Hemorrhage control initiated. Immediate action required.\n\n1. Apply firm, direct pressure to the wound with a clean cloth.\n2. If the cloth becomes soaked, add another layer on top; do not remove the first one.\n3. Keep the injured area elevated above heart level if possible.",
          category: 'medical',
          followUpQuestions: ["Is the bleeding pulsing or spurting?", "Is the victim pale or dizzy?", "Is the wound deep or gaping?"]
        };
      }

      // Airway / Choking / Breathing
      if (q.includes('breath') || q.includes('choke') || q.includes('airway') || q.includes('cant breathe')) {
        return {
          guidance: "Airway and breathing protocol active.\n\n1. If the person is choking and cannot speak, perform 5 abdominal thrusts (Heimlich maneuver).\n2. If struggling to breathe, help the person sit upright and keep their neck straight.\n3. Check for obstructions in the mouth.",
          category: 'medical',
          followUpQuestions: ["Are they turning blue?", "Is the person conscious?", "Is this an allergic reaction?"]
        };
      }

      // Fire / Smoke
      if (q.includes('fire') || q.includes('smoke') || q.includes('burn')) {
        return {
          guidance: "Fire safety protocol active. Immediate evacuation is the priority.\n\n1. Evacuate the building immediately using the nearest exit.\n2. Stay low to the floor where the air is cleaner.\n3. Feel doors with the back of your hand; if hot, do not open.",
          category: 'safety',
          followUpQuestions: ["Are you trapped in a room?", "Can you smell gas?", "Are there injuries from burns?"]
        };
      }

      // Earthquake
      if (q.includes('quake') || q.includes('earthquake') || q.includes('shake')) {
        return {
          guidance: "Seismic survival protocol active.\n\n1. DROP, COVER, and HOLD ON immediately.\n2. Stay under a sturdy table or desk. Stay away from windows.\n3. If outdoors, move to an open area away from buildings and power lines.",
          category: 'disaster',
          followUpQuestions: ["Do you smell gas?", "Is there structural damage?", "Is anyone trapped?"]
        };
      }

      // Unconscious
      if (q.includes('unconscious') || q.includes('passed out') || q.includes('not waking up')) {
        return {
          guidance: "Unresponsive victim protocol active.\n\n1. Check for breathing and a pulse.\n2. If breathing, place them in the recovery position (on their side).\n3. If NOT breathing, prepare to perform chest compressions (100-120 per minute).",
          category: 'medical',
          followUpQuestions: ["Is the victim breathing?", "Is there a head injury?", "How long have they been unresponsive?"]
        };
      }

      // Flood / Water
      if (q.includes('flood') || q.includes('water') || q.includes('rising')) {
        return {
          guidance: "Flood emergency protocol active.\n\n1. Move to higher ground immediately. Do not stay in a basement.\n2. Never walk, swim, or drive through moving water.\n3. Avoid contact with floodwater; it may be contaminated or charged.",
          category: 'disaster',
          followUpQuestions: ["Are you trapped by rising water?", "Is the power still on?", "Is there a medical emergency?"]
        };
      }

      return {
        guidance: "I am AXON-AI, your emergency assistant. Please describe the situation or symptoms (e.g., 'chest pain', 'fire') so I can provide the correct survival protocol immediately.",
        category: 'safety',
        followUpQuestions: ["Medical Emergency", "Fire/Smoke", "Natural Disaster", "Personal Safety"]
      };
    }
  }
);
