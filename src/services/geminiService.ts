import { ParsedContact, Person } from '../types';
import { parseLocally } from './localContactParser';
import { searchLocally } from './localSemanticSearch';

const STORAGE_KEY_GEMINI_KEY = 'eventlink_gemini_api_key';

const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];

export function getApiKey(): string {
  // In test environment, keep offline to prevent unmocked external network calls
  if (import.meta.env.MODE === 'test') {
    return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
  }

  const custom = localStorage.getItem(STORAGE_KEY_GEMINI_KEY);
  if (custom && custom.trim().length > 0) return custom.trim();
  
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();

  return '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} attempt failed:`, err.message);
    }
  }

  throw lastError || new Error('Gemini API call failed.');
}

/**
 * Parses raw voice note transcript into structured contact fields (Name, Designation, Skills, Description, Phone).
 * Tries Gemini API first; if unavailable, seamlessly falls back to on-device NLP parser.
 */
export async function parseVoiceTranscript(transcript: string): Promise<ParsedContact> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const prompt = `
You are an AI assistant for a smart event networking app.
Extract structured contact information from the following user voice note transcript:

Transcript: "${transcript}"

Respond ONLY with a valid JSON object matching this schema (do NOT include markdown code blocks or emojis):
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

      if (parsed.name || parsed.designation || parsed.phone) {
        return {
          name: parsed.name || '',
          designation: parsed.designation || '',
          skills: parsed.skills || '',
          description: parsed.description || transcript,
          phone: parsed.phone || ''
        };
      }
    } catch (err) {
      console.warn('Gemini voice parsing failed, using high-speed local parser:', err);
    }
  }

  // Graceful local fallback parsing (always succeeds, zero latency)
  return parseLocally(transcript);
}

/**
 * Searches through contacts using Gemini to find people matching conceptual queries.
 * Tries Gemini first; if unavailable, seamlessly uses local semantic reasoning engine.
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

You are a personal networking assistant. 
Analyze the query and find the best contact match(es) from the list based on conceptual understanding (for example, if user asks about "LLMs", match "AI Engineer", "Machine Learning", "NLP"; if searching "Dart", match "Flutter").

Format your response cleanly using this exact plain-text template (DO NOT USE EMOJIS):

[Top Recommended Match]
• Name: [Full Name]
• Role: [Role / Company]

Context & Match Reason:
[1-2 sentences clearly explaining why this person fits the user's specific request]

Relevant Skills:
[List of matching skills]

Contact Details:
• Phone: [Phone or "Not provided"]
• LinkedIn: [LinkedIn or "Not provided"]

---
If multiple people match, list them with the same format.
If no contacts match, state: "No direct match found in your past event contacts for this specific skill set. Try searching for a broader role or skill."
`.trim();

      const result = await callGemini(prompt, apiKey);
      if (result && result.trim().length > 0) {
        return result;
      }
    } catch (err) {
      console.warn('Gemini search failed, falling back to local semantic search:', err);
    }
  }

  // Graceful local semantic search (zero API dependency, conceptual knowledge graph)
  return searchLocally(query, people);
}

/**
 * Generates an automated, personalized follow-up message for dormant outbound contacts.
 */
export async function generateFollowUpMessage(person: Person, eventTitle: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return `Hi ${person.name}, it was great meeting you at ${eventTitle}. Would love to stay connected and follow up on our conversation regarding ${person.designation || 'our projects'}.`;
  }

  const prompt = `
Write a friendly, professional 2-sentence follow-up message to send on WhatsApp or LinkedIn.
Contact Name: ${person.name}
Role: ${person.designation}
Event Met: ${eventTitle}
Conversation Notes: ${person.description}

Keep it warm, natural, and directly reference what was discussed. Do not use generic corporate jargon and do not use emojis. Return ONLY the message text.
`.trim();

  try {
    const text = await callGemini(prompt, apiKey);
    return text.trim().replace(/^["']|["']$/g, '');
  } catch (err) {
    return `Hi ${person.name}, it was great connecting with you at ${eventTitle}. Loved our chat about ${person.designation || 'your work'}. Let's catch up soon.`;
  }
}
