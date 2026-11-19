import { Person } from '../types';

interface ConceptBridge {
  source: string;
  target: string;
  explanation: string;
}

const CONCEPT_BRIDGES: ConceptBridge[] = [
  { source: 'dart', target: 'flutter', explanation: 'Flutter applications are built using the Dart programming language' },
  { source: 'flutter', target: 'dart', explanation: 'Dart is the primary programming language behind the Flutter UI framework' },
  { source: 'swift', target: 'ios', explanation: 'Swift and SwiftUI are the official native development technologies for Apple iOS' },
  { source: 'ios', target: 'swift', explanation: 'iOS applications are built using Apple Swift language and SwiftUI' },
  { source: 'kotlin', target: 'android', explanation: 'Kotlin and Jetpack Compose are the native Android development standard' },
  { source: 'android', target: 'kotlin', explanation: 'Android development centers on Kotlin and Jetpack architecture' },
  { source: 'javascript', target: 'react', explanation: 'React is the standard JavaScript framework for modern web interfaces' },
  { source: 'typescript', target: 'react', explanation: 'TypeScript is used in enterprise React and Next.js applications' },
  { source: 'react', target: 'javascript', explanation: 'React is built on JavaScript and modern TypeScript standards' },
  { source: 'nextjs', target: 'react', explanation: 'Next.js is the full-stack production framework built on top of React' },
  { source: 'python', target: 'ai', explanation: 'Python is the core programming language powering artificial intelligence' },
  { source: 'ai', target: 'python', explanation: 'AI research and deployment relies heavily on the Python ecosystem' },
  { source: 'llm', target: 'ai', explanation: 'Large Language Models (LLMs) are frontier generative AI systems' },
  { source: 'llms', target: 'ai', explanation: 'Large Language Models (LLMs) are frontier generative AI systems' },
  { source: 'figma', target: 'ui', explanation: 'Figma is the industry standard design and prototyping tool for UI/UX' },
  { source: 'ui/ux', target: 'figma', explanation: 'UI/UX designers build interactive prototypes and systems in Figma' },
  { source: 'golang', target: 'backend', explanation: 'Go (Golang) is engineered for high-throughput backend microservices' },
  { source: 'go', target: 'backend', explanation: 'Go is standard for distributed backend systems' },
  { source: 'docker', target: 'devops', explanation: 'Docker containerization is the building block of DevOps pipelines' },
  { source: 'kubernetes', target: 'devops', explanation: 'Kubernetes is the orchestrator powering cloud-native DevOps infrastructure' },
  { source: 'solidity', target: 'blockchain', explanation: 'Solidity is the smart-contract language for Ethereum and EVM blockchains' }
];

const UNIVERSAL_CLUSTERS: Record<string, string[]> = {
  culinary: ['chef', 'culinary', 'cook', 'baker', 'pastry', 'kitchen', 'restaurant', 'food', 'catering', 'gastronomy', 'hospitality'],
  entrepreneurship: ['entrepreneur', 'founder', 'co-founder', 'ceo', 'founding', 'stealth', 'startup', 'venture', 'owner'],
  deeptech: ['deep tech', 'deeptech', 'ai', 'artificial intelligence', 'robotics', 'quantum', 'biotech', 'autonomous', 'neural', 'hard tech', 'llm', 'llms'],
  healthcare: ['doctor', 'physician', 'surgeon', 'dentist', 'nurse', 'pharmacist', 'medicine', 'clinical', 'health'],
  legal: ['lawyer', 'attorney', 'legal', 'counsel', 'patent', 'ip counsel', 'solicitor']
};

const STOP_WORDS = new Set([
  'whether', 'have', 'i', 'met', 'any', 'before', 'did', 'someone', 'who', 'is',
  'an', 'a', 'the', 'in', 'at', 'from', 'with', 'find', 'me', 'looking', 'for',
  'show', 'tell', 'about', 'there', 'do', 'we', 'know', 'contact', 'person',
  'past', 'recently', 'event', 'hackathon', 'conference', 'please', 'can', 'you',
  'works', 'working', 'does', 'builds', 'building', 'knows', 'well', 'versed',
  'expert', 'expertise', 'specialist', 'and', 'all', 'like', 'that', 'say',
  'talked', 'talking', 'some', 'anyone', 'anybody', 'meeting', 'meet'
]);

export function searchLocally(query: string, people: Person[]): string {
  if (people.length === 0) {
    return 'No contacts saved in your database yet.';
  }

  const rawLower = query.toLowerCase().trim();
  const queryTokens = rawLower
    .split(/[\s,?!.]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  interface MatchResult {
    person: Person;
    score: number;
    matchReason: string;
  }

  const results: MatchResult[] = [];

  for (const person of people) {
    const textPool = [
      person.name,
      person.designation,
      person.company || '',
      person.description,
      person.tags.join(' ')
    ].join(' ').toLowerCase();

    let score = 0;
    const reasons: string[] = [];

    // 1. Direct token matching
    for (const token of queryTokens) {
      if (textPool.includes(token)) {
        score += 30;
        reasons.push(`Direct match for "${token}" in profile`);
      }
    }

    // 2. Concept Bridges (e.g. dart <-> flutter, llm <-> ai)
    for (const bridge of CONCEPT_BRIDGES) {
      const queryHasSource = queryTokens.some((t) => t === bridge.source || t.includes(bridge.source));
      if (queryHasSource && textPool.includes(bridge.target)) {
        score += 40;
        reasons.push(bridge.explanation);
      }
    }

    // 3. Cluster matching (e.g. chef <-> culinary, deep tech <-> ai/robotics)
    for (const [clusterName, words] of Object.entries(UNIVERSAL_CLUSTERS)) {
      const queryMatchesCluster = queryTokens.some((t) => words.includes(t));
      if (queryMatchesCluster) {
        const profileMatchesCluster = words.some((w) => textPool.includes(w));
        if (profileMatchesCluster) {
          score += 35;
          reasons.push(`Strong domain match in ${clusterName} industry`);
        }
      }
    }

    if (score > 0) {
      results.push({
        person,
        score,
        matchReason: reasons.slice(0, 2).join('; ')
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    // If no semantic match, fallback to broad search across all tokens
    const broadMatches = people.filter((p) => {
      const combined = `${p.name} ${p.designation} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
      return queryTokens.some((t) => combined.includes(t));
    });

    if (broadMatches.length > 0) {
      return broadMatches.map((p) => formatPersonMatch(p, 'Broad keyword match in contact history')).join('\n---\n\n');
    }

    return `No direct match found for "${query}" in your contacts. Try asking for a broader skill, role, or technology.`;
  }

  return results.slice(0, 5).map((r) => formatPersonMatch(r.person, r.matchReason)).join('\n---\n\n');
}

function formatPersonMatch(person: Person, reason: string): string {
  return `[Top Recommended Match]
• Name: ${person.name}
• Role: ${person.designation || 'Not specified'}

Context & Match Reason:
${reason || 'Identified through profile context'}

Notes:
${person.description || 'Met at event'}

Contact Details:
• Phone: ${person.contactNumber || 'Not provided'}
• LinkedIn: ${person.linkedinUrl || 'Not provided'}`;
}
