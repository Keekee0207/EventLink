import { ParsedContact } from '../types';

const PHONE_REGEX = /(?:\+?91[\-\s]?)?[6-9]\d{9}/;

const KNOWN_ROLES = [
  'AI Engineer', 'Artificial Intelligence Engineer', 'GenAI Engineer', 'Machine Learning Engineer',
  'ML Engineer', 'Data Scientist', 'Data Analyst', 'Data Engineer', 'Deep Learning Engineer',
  'Full Stack Developer', 'Full Stack Engineer', 'Backend Developer', 'Backend Engineer',
  'Frontend Developer', 'Frontend Engineer', 'Web Developer', 'Software Engineer',
  'Software Developer', 'Android Developer', 'iOS Developer', 'Mobile Developer',
  'Flutter Developer', 'React Native Developer', 'UI/UX Designer', 'UI UX Designer',
  'Product Designer', 'Graphic Designer', 'DevOps Engineer', 'Cloud Engineer',
  'Cloud Architect', 'Solutions Architect', 'Cybersecurity Engineer', 'Blockchain Developer',
  'Web3 Developer', 'Tech Lead', 'Team Lead', 'Engineering Manager', 'Product Manager',
  'Project Manager', 'Founder', 'Co-Founder', 'CEO', 'CTO', 'COO', 'Student', 'Researcher', 'Intern',
  'Chef', 'Culinary Founder', 'Food Entrepreneur', 'Doctor', 'Lawyer', 'Architect'
];

const KNOWN_SKILLS = [
  'AI', 'Machine Learning', 'Deep Learning', 'LLM', 'NLP', 'Computer Vision', 'Generative AI',
  'Python', 'Kotlin', 'Java', 'C++', 'Rust', 'Go', 'Golang', 'JavaScript', 'TypeScript',
  'React', 'React Native', 'Next.js', 'Angular', 'Vue', 'Node.js', 'Express', 'Django',
  'FastAPI', 'Spring Boot', 'Flutter', 'Swift', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Firebase', 'Supabase', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Figma', 'UI/UX', 'Git', 'GraphQL', 'Cybersecurity', 'Blockchain', 'Solidity', 'Web3',
  'Dart', 'Culinary', 'FoodTech', 'Deep Tech', 'Robotics'
];

const NAME_INTRO_REGEXES = [
  /\b(?:i\s+met|met|spoke\s+(?:to|with)|talking\s+(?:to|with)|this\s+is|connected\s+with|chatted\s+with)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\b/i,
  /^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(?:who\s+is|is\s+(?:an?|the)|works\s+as|from)\b/i,
  /^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*,/i
];

const ROLE_INDICATOR_REGEX = /(?:who\s+is\s+(?:an?|the)?|is\s+(?:an?|the)?|works\s+as\s+(?:an?|the)?|working\s+as\s+(?:an?|the)?|role\s+is)\s+([A-Za-z0-9\s/&-]+?)(?=\s+(?:at|in|from|who|and|phone|number|with|,|\.|$))/i;
const COMPANY_INDICATOR_REGEX = /\b(?:at|in|from|works\s+at|working\s+at)\s+([A-Z][A-Za-z0-9\s&]+?)(?=,|\.|\s+and|\s+who|\s+he|\s+she|\s+phone|\s+contact|$)/i;

function toTitleCase(str: string): string {
  return str
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function parseLocally(rawTranscript: string): ParsedContact {
  const transcript = rawTranscript.trim();
  if (!transcript) {
    return { name: '', designation: '', skills: '', description: '', phone: '' };
  }

  let extractedName = '';
  let extractedRole = '';
  let extractedCompany = '';
  let extractedPhone = '';
  const extractedSkills: string[] = [];

  // 1. Phone extraction
  const phoneMatch = transcript.match(PHONE_REGEX);
  if (phoneMatch) {
    extractedPhone = phoneMatch[0].trim();
  }

  // 2. Name extraction
  for (const regex of NAME_INTRO_REGEXES) {
    const match = transcript.match(regex);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.length > 2 && !/^(the|a|an|he|she|they|we|this|that|today|yesterday)$/i.test(candidate)) {
        extractedName = toTitleCase(candidate);
        break;
      }
    }
  }

  // Fallback: first 1-2 words if starting directly with name
  if (!extractedName) {
    const words = transcript.split(/[\s,]+/).filter(Boolean);
    if (words.length > 0 && words[0].length > 2) {
      if (!/^(i|we|met|he|she|they|this|that|today|at|in|from)$/i.test(words[0])) {
        if (words.length > 1 && /^[A-Z][a-z]+$/.test(words[1])) {
          extractedName = toTitleCase(`${words[0]} ${words[1]}`);
        } else {
          extractedName = toTitleCase(words[0]);
        }
      }
    }
  }

  // 3. Role extraction
  const roleMatch = transcript.match(ROLE_INDICATOR_REGEX);
  if (roleMatch && roleMatch[1]) {
    const candidate = roleMatch[1].trim();
    if (candidate.length > 2 && candidate.toLowerCase() !== extractedName.toLowerCase()) {
      extractedRole = toTitleCase(candidate);
    }
  }

  if (!extractedRole) {
    const lower = transcript.toLowerCase();
    for (const role of KNOWN_ROLES) {
      if (lower.includes(role.toLowerCase())) {
        extractedRole = role;
        break;
      }
    }
  }

  // 4. Company extraction
  const companyMatch = transcript.match(COMPANY_INDICATOR_REGEX);
  if (companyMatch && companyMatch[1]) {
    const candidate = companyMatch[1].trim();
    if (candidate.length > 2 && candidate.toLowerCase() !== extractedName.toLowerCase()) {
      extractedCompany = toTitleCase(candidate);
    }
  }

  // Assemble full designation
  let finalDesignation = extractedRole;
  if (extractedCompany) {
    if (finalDesignation) {
      if (!finalDesignation.toLowerCase().includes(extractedCompany.toLowerCase())) {
        finalDesignation = `${finalDesignation} at ${extractedCompany}`;
      }
    } else {
      finalDesignation = extractedCompany;
    }
  }

  // 5. Skills extraction
  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(transcript) && !extractedSkills.includes(skill)) {
      extractedSkills.push(skill);
    }
  }

  if (finalDesignation.toLowerCase().includes('flutter') && !extractedSkills.includes('Dart')) {
    extractedSkills.push('Dart');
  }
  if (finalDesignation.toLowerCase().includes('ai') && !extractedSkills.includes('AI')) {
    extractedSkills.unshift('AI');
  }

  return {
    name: extractedName,
    designation: finalDesignation,
    skills: extractedSkills.join(', '),
    description: transcript,
    phone: extractedPhone
  };
}
