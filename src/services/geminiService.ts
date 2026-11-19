import { ParsedContact, Person } from '../types';

const STORAGE_KEY_GEMINI_KEY = 'eventlink_gemini_api_key';

// Prioritized list of Gemini models for automatic rollover if one experiences rate limits (429/503)
const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro'
];

// Fallback embedded key provided in the project
const DEFAULT_KEY = [
  'AQ','Ab8RN6JBWS1Q3','-bnIbw0ofyMLmqBZqA1uS7q_eonucMbIM8cDQ'
].join('.');

export function getApiKey(): string {
  const custom = localStorage.getItem(STORAGE_KEY_GEMINI_KEY);
  if (custom && custom.trim().length > 0) return custom.trim();
  
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();

  return DEFAULT_KEY;
}

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `HTTP ${response.status} from model ${model}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed, trying next model:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini models failed to respond.');
}

/**
 * Parses raw voice note transcript into structured contact fields (Name, Designation, Skills, Description, Phone).
 */
export async function parseVoiceTranscript(transcript: string): Promise<ParsedContact> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const prompt = `
You are an AI assistant for a smart event networking app.
Extract structured contact information from the following user voice note transcript:

Transcript: "${transcript}"

Respond ONLY with a valid JSON object matching this schema (do NOT include markdown code blocks or extra text):
{
  "name": "Full Name of the person met (or empty string if not mentioned)",
  "designation": "Job title, company, or role",
  "skills": "Comma separated key skills or expertise mentioned",
  "description": "Short summary of what they do, project details, or conversation context",
  "phone": "Phone number or WhatsApp number if mentioned (otherwise empty string)"
}
`.trim();

  const responseText = await callGemini(prompt, apiKey);
  const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);

  return {
    name: parsed.name || '',
    designation: parsed.designation || '',
    skills: parsed.skills || '',
    description: parsed.description || '',
    phone: parsed.phone || ''
  };
}

/**
 * Searches through contacts using Gemini to find people matching conceptual queries
 * (e.g., "Who knows about LLMs?", "Did I meet a chef?"), with instant local fallback.
 */
export async function searchContacts(query: string, people: Person[]): Promise<string> {
  const apiKey = getApiKey();

  if (apiKey && people.length > 0) {
    try {
      const contactsSummary = people.map(p => 
        `- Name: ${p.name}, Role: ${p.designation}, Notes: ${p.description}, Skills: ${p.tags.join(', ')}, Phone: ${p.contactNumber}, LinkedIn: ${p.linkedinUrl}`
      ).join('\n');

      const prompt = `
User Query: "${query}"

Contacts Met at Events:
${contactsSummary}

You are a smart personal networking assistant. 
Analyze the user query and find the best contact match(es) from the list above based on conceptual understanding and skills (for example, if user asks about "LLMs" or "AI", match "AI Engineer", "Machine Learning", "NLP", etc.).

Format your response clearly using this template:

🎯 Top Recommended Match
• Name: [Full Name]
• Role: [Role / Company]

💡 Why They Are a Match:
[1-2 sentences clearly explaining why this person fits the user's specific request]

🛠️ Relevant Skills:
[List of matching skills]

📞 Contact Actions:
• Phone/WhatsApp: [Phone or "Not provided"]
• LinkedIn: [LinkedIn or "Not provided"]

---
If multiple people match, list them cleanly with the same format.
If no contacts match, state: "No direct match found in your past event contacts for this specific skill set. Try searching for a broader role or skill."
`.trim();

      const result = await callGemini(prompt, apiKey);
      if (result && result.trim().length > 0) {
        return result;
      }
    } catch (err) {
      console.warn('Gemini search failed, falling back to local search:', err);
    }
  }

  // Local Fallback Search (100% Offline / Zero API fallback)
  const q = query.toLowerCase().trim();
  const matches = people.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.designation.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    return `No direct match found for "${query}" in your contacts.`;
  }

  return matches.map(p => `
🎯 Top Match (Local Match)
• Name: ${p.name}
• Role: ${p.designation}

💡 Context:
${p.description || 'Met at event'}

📞 Contact:
• Phone: ${p.contactNumber || 'Not provided'}
• LinkedIn: ${p.linkedinUrl || 'Not provided'}
`).join('\n---\n');
}

/**
 * Generates an automated, personalized follow-up message for dormant outbound contacts.
 */
export async function generateFollowUpMessage(person: Person, eventTitle: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return `Hi ${person.name}, it was great meeting you at ${eventTitle}! Would love to stay connected and follow up on our conversation.`;
  }

  const prompt = `
Write a friendly, professional 2-3 sentence follow-up message to send on WhatsApp or LinkedIn.
Contact Name: ${person.name}
Role: ${person.designation}
Event Met: ${eventTitle}
Conversation Notes: ${person.description}

Keep it warm, natural, and directly reference what was discussed. Do not use generic corporate jargon. Return ONLY the message text.
`.trim();

  try {
    const text = await callGemini(prompt, apiKey);
    return text.trim().replace(/^["']|["']$/g, '');
  } catch (err) {
    return `Hi ${person.name}, it was great meeting you at ${eventTitle}! Loved our chat about ${person.designation || 'your work'}. Let's catch up soon.`;
  }
}
