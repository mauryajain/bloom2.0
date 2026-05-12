// ============================================================
// BLOOM — Supabase Edge Function: ask-bloom
// Gemini AI proxy — keeps GEMINI_API_KEY server-side
// Deploy with: npx supabase functions deploy ask-bloom
// Set secret: npx supabase secrets set GEMINI_API_KEY=your-key
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY_ENV = 'GEMINI_API_KEY';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  userMessage: string;
}

interface UserProfileRow {
  nickname: string;
  date_of_birth: string;
  life_stage: string;
  pronouns: string;
  cycle_status: string;
  symptom_duration: string;
  dismissal_history: string[];
  urgency_score: number;
  has_doctor: boolean;
  reminder_preferences: string[];
  is_minor: boolean;
}

interface ConditionRow { condition_name: string; is_diagnosed: boolean; is_family_history: boolean; }
interface SymptomRow { symptom_name: string; }
interface GoalRow { goal_text: string; }
interface UserRow { communication_style: string; }

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get(GEMINI_API_KEY_ENV);
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: 'Bloom AI is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userMessage }: RequestBody = await req.json();

    // Emergency keyword check (server-side safety net)
    const emergencyKeywords = [
      'chest pain', "can't breathe", 'cannot breathe', 'severe bleeding',
      "can't stop bleeding", 'fainting', 'passed out', 'suicidal', 'want to die',
      'want to hurt myself', 'self-harm', 'unresponsive', 'seizure',
      'sudden severe headache', 'vision loss', 'miscarriage', 'ectopic',
      'overdose', 'stroke', 'heart attack',
    ];
    const lowerMsg = userMessage.toLowerCase();
    const isEmergency = emergencyKeywords.some(kw => lowerMsg.includes(kw));

    if (isEmergency) {
      return new Response(
        JSON.stringify({
          response: `🚨 **This sounds like a medical emergency.**\n\nPlease contact emergency services immediately:\n- **India:** Call **102** (ambulance) or **112** (emergency)\n- **USA/Canada:** Call **911**\n- **UK:** Call **999**\n\nIf you are having thoughts of self-harm, call iCall India: 9152987821\n\nPlease seek help immediately. I cannot provide health guidance for emergency symptoms. 🙏`,
          isEmergency: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile data
    const userId = user.id;
    const [profileRes, conditionsRes, symptomsRes, goalsRes, userRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('user_conditions').select('*').eq('user_id', userId),
      supabase.from('user_symptoms').select('symptom_name').eq('user_id', userId).eq('source', 'onboarding'),
      supabase.from('user_goals').select('goal_text').eq('user_id', userId),
      supabase.from('users').select('communication_style').eq('id', userId).single(),
    ]);

    const profile: UserProfileRow | null = profileRes.data;
    const conditions: ConditionRow[] = conditionsRes.data ?? [];
    const symptoms: SymptomRow[] = symptomsRes.data ?? [];
    const goals: GoalRow[] = goalsRes.data ?? [];
    const userRow: UserRow | null = userRes.data;

    // Calculate age
    let age = 0;
    if (profile?.date_of_birth) {
      const dob = new Date(profile.date_of_birth);
      age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    const isMinor = profile?.is_minor ?? false;
    const communicationStyle = userRow?.communication_style ?? 'balanced';
    const diagnosedConditions = conditions.filter(c => c.is_diagnosed).map(c => c.condition_name);
    const familyHistory = conditions.filter(c => c.is_family_history).map(c => c.condition_name);
    const symptomList = symptoms.map(s => s.symptom_name);
    const goalList = goals.map(g => g.goal_text);

    const toneInstruction =
      communicationStyle === 'warm'
        ? 'Use warm, empathetic, conversational language. Be like a knowledgeable friend.'
        : communicationStyle === 'clinical'
        ? 'Use clear, structured, factual language. Be direct and concise.'
        : 'Balance warmth and clarity.';

    const systemPrompt = `You are Bloom, an AI women's health companion.

USER PROFILE:
- Name: ${profile?.nickname ?? 'User'}, Age: ${age}, Life stage: ${profile?.life_stage ?? 'not specified'}
- Symptoms: ${symptomList.length > 0 ? symptomList.join(', ') : 'None reported'}
- Diagnosed conditions: ${diagnosedConditions.length > 0 ? diagnosedConditions.join(', ') : 'None'}
- Family history: ${familyHistory.length > 0 ? familyHistory.join(', ') : 'None'}
- Goals: ${goalList.length > 0 ? goalList.join(', ') : 'General health understanding'}
- Communication style: ${communicationStyle}
${isMinor ? '\n⚠️ MINOR SAFE MODE: Under 18. Never discuss HRT, fertility, or sexual health.\n' : ''}

RULES:
1. Never diagnose. Use: "may be consistent with", "worth discussing", "some people with similar symptoms..."
2. Always end with "Questions to ask your doctor:" section with 2-4 specific questions.
3. ${toneInstruction}
4. Reference the user's actual profile data — not generic answers.
5. Never recommend stopping medications. Always recommend consulting a healthcare provider.`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} — ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    return new Response(
      JSON.stringify({ response: responseText, isEmergency: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[ask-bloom]', err);
    return new Response(
      JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
