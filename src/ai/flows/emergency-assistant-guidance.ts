'use server';
/**
 * @fileOverview AXON-AI Advanced Emergency Intelligence Assistant.
 * 
 * Provides diagnostic-style emergency assistance with deep intent detection and contextual memory.
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

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const EmergencyAssistantInputSchema = z.object({
  query: z.string().describe("User's description of the emergency."),
  history: z.array(MessageSchema).optional().describe("Previous conversation messages for context."),
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

CONTEXT & MEMORY:
You must maintain the context of the current emergency. If the user previously mentioned a symptom (e.g., "chest pain") and now provides a follow-up (e.g., "I'm sweaty"), recognize this as a potential high-priority escalation of the existing medical event. Do not reset or ask what kind of emergency it is if one is already established.

CRITICAL INSTRUCTION:
If the user describes a clear emergency (e.g., "chest pain", "bleeding", "fire"), skip all introductions. Provide immediate survival protocols and ask diagnostic follow-up questions to assess risk level.

INTERACTION STYLE:
1. CALM & DIRECT: No fluff. Use clear, numbered lists for actions.
2. DIAGNOSTIC: Ask 1-3 critical questions to narrow down life-threatening risks.
3. ADAPTIVE: Tailor guidance for specific injuries (Bleeding, Cardiac, Choking, Stroke, Chest Pain) or disasters (Seismic, Flood, Fire).
4. SAFETY FIRST: Remind them to contact local emergency services (911/112) if necessary.

{{#if history}}
HISTORY:
{{#each history}}
{{role}}: {{content}}
{{/each}}
{{/if}}

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
      // HIGH-FIDELITY ZERO-DELAY CONTEXTUAL FALLBACK ENGINE
      const q = input.query.toLowerCase();
      const h = (input.history || []).map(m => m.content.toLowerCase()).join(' ');
      const combined = q + ' ' + h;
      
      // Cardiac / Chest Pain / Triage Responses (Sweaty, Dizzy)
      if (combined.includes('chest') || combined.includes('heart') || q.includes('pain') || combined.includes('sweat') || combined.includes('dizzy') || combined.includes('arm') || combined.includes('jaw')) {
        return {
          guidance: "Cardiac alert. Symptoms like sweating or dizziness combined with chest discomfort are high-priority indicators.\n\n1. Stop all activity and sit down immediately.\n2. Loosen tight clothing and try to breathe slowly.\n3. If symptoms spread to the jaw or arm, activate SOS for immediate dispatch.",
          category: 'medical',
          followUpQuestions: ["Are you having difficulty breathing?", "Is the pain spreading to your arm or jaw?", "Do you have a history of heart issues?"]
        };
      }

      // Airway / Choking / Breathing
      if (combined.includes('breath') || combined.includes('choke') || combined.includes('airway') || q.includes('cant breathe') || q.includes('shortness')) {
        return {
          guidance: "Respiratory emergency protocol active. Oxygenation is the priority.\n\n1. If choking and unable to cough or speak, perform 5 abdominal thrusts (Heimlich maneuver).\n2. If struggling to breathe, sit upright to keep the airway open.\n3. Do not attempt to walk or exert yourself.",
          category: 'medical',
          followUpQuestions: ["Are your lips or nails turning blue?", "Are you wheezing?", "Is this an allergic reaction?"]
        };
      }

      // Stroke / Neurological (Headache, Numbness)
      if (combined.includes('headache') || combined.includes('numb') || combined.includes('slur') || combined.includes('face') || combined.includes('stroke')) {
        return {
          guidance: "Neurological alert initiated. Check for F.A.S.T. signs.\n\n1. F - Face: Is one side of the face drooping?\n2. A - Arms: Can you raise both arms?\n3. S - Speech: Is your speech slurred?\n4. T - Time: If any signs are present, activate SOS immediately.",
          category: 'medical',
          followUpQuestions: ["Do you have sudden vision changes?", "Is the headache the worst of your life?", "Is there weakness on one side?"]
        };
      }

      // Bleeding
      if (combined.includes('bleed') || combined.includes('blood') || combined.includes('cut') || combined.includes('wound') || combined.includes('injury')) {
        return {
          guidance: "Hemorrhage control protocol active.\n\n1. Apply firm, direct pressure with the cleanest available cloth.\n2. Maintain constant pressure; do not lift the cloth to check.\n3. Elevate the limb above the heart if possible.",
          category: 'medical',
          followUpQuestions: ["Is the bleeding pulsing or spurting?", "Is there an object stuck in the wound?", "Are you feeling faint?"]
        };
      }

      // Fire / Smoke
      if (combined.includes('fire') || combined.includes('smoke') || combined.includes('burn') || combined.includes('hot')) {
        return {
          guidance: "Fire safety protocol active. Evacuation is your priority.\n\n1. Get out immediately. Do not collect belongings.\n2. Stay low to the floor to avoid smoke.\n3. Feel doors with the back of your hand before opening.",
          category: 'safety',
          followUpQuestions: ["Are you trapped?", "Is there gas smell?", "Can you see an exit?"]
        };
      }

      // Earthquake
      if (combined.includes('quake') || combined.includes('earthquake') || combined.includes('shake') || combined.includes('tremor')) {
        return {
          guidance: "Seismic survival protocol active.\n\n1. DROP, COVER, and HOLD ON.\n2. Stay under a sturdy desk or table. Away from glass.\n3. If outdoors, move to an open area away from power lines.",
          category: 'disaster',
          followUpQuestions: ["Is there structural damage?", "Do you smell gas?", "Are there aftershocks?"]
        };
      }

      // General Medical
      if (combined.includes('sick') || combined.includes('fever') || combined.includes('ill') || combined.includes('vomit') || combined.includes('doctor')) {
        return {
          guidance: "General medical triage initiated. Please monitor your vitals.\n\n1. Stay hydrated and track your temperature.\n2. If symptoms include sudden confusion or severe rash, notify rescue contacts.\n3. Keep your profile updated for first responders.",
          category: 'medical',
          followUpQuestions: ["How high is the fever?", "Are you experiencing pain?", "When did symptoms start?"]
        };
      }

      return {
        guidance: "I am AXON-AI, your emergency intelligence companion. Please describe your symptoms or the disaster situation (e.g., 'chest pain', 'bleeding', 'fire') so I can provide the correct survival protocol immediately.",
        category: 'safety',
        followUpQuestions: ["Medical Emergency", "Fire/Smoke", "Natural Disaster", "Personal Safety"]
      };
    }
  }
);
