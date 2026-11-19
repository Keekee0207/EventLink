import { Event, Person, UserProfile } from '../types';

const KEY_EVENTS = 'eventlink_events';
const KEY_PEOPLE = 'eventlink_people';
const KEY_PROFILE = 'eventlink_profile';

const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-buildathon-2026',
    title: 'Google Buildathon 2026',
    date: '2026-11-15',
    location: 'Chennai Trade Centre, Chennai, Tamil Nadu',
    description: 'National startup & AI buildathon powered by Google DeepMind, Google Cloud, and nasscom.',
    peopleCount: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-devfest-summit',
    title: 'GDG DevFest India Summit',
    date: '2026-11-28',
    location: 'Bengaluru International Exhibition Centre, Karnataka',
    description: 'Annual gathering of cloud architects, mobile developers, and AI researchers.',
    peopleCount: 0,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PEOPLE: Person[] = [
  {
    id: 'person-1',
    eventId: 'evt-buildathon-2026',
    name: 'Hari',
    designation: 'AI Engineer • DeepTech Labs',
    company: 'DeepTech Labs',
    linkedinUrl: 'https://linkedin.com/in/hari-deeptech',
    description: 'Building autonomous LLM agents and multi-agent coordination systems. Met at the AI booth.',
    contactNumber: '+91 98765 43210',
    tags: ['AI Engineer', 'LLMs', 'Python', 'Agents'],
    relationshipType: 'inbound',
    lastContactDate: new Date().toISOString(),
    callCount: 2,
    messageCount: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'person-2',
    eventId: 'evt-buildathon-2026',
    name: 'Sepideh Yazdi',
    designation: 'Lead UI/UX Designer',
    company: 'Memphis Studio',
    linkedinUrl: 'https://linkedin.com/in/sepideh-design',
    description: 'Designs playful neo-brutalist interfaces and accessible mobile systems. Looking for a tech co-founder.',
    contactNumber: '+91 98765 43211',
    tags: ['UI/UX', 'Figma', 'Product Design', 'Founder'],
    relationshipType: 'outbound',
    lastContactDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    callCount: 0,
    messageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'person-3',
    eventId: 'evt-buildathon-2026',
    name: 'Vikram Raman',
    designation: 'Flutter & Dart Architect',
    company: 'MobileFlow',
    linkedinUrl: 'https://linkedin.com/in/vikram-mobile',
    description: 'Specializes in high-performance Dart and offline-first mobile apps. Working on cross-platform SDKs.',
    contactNumber: '+91 98765 43212',
    tags: ['Flutter Developer', 'Dart', 'Android', 'Mobile'],
    relationshipType: 'inbound',
    lastContactDate: new Date().toISOString(),
    callCount: 1,
    messageCount: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'person-4',
    eventId: 'evt-buildathon-2026',
    name: 'Chef Ananya Roy',
    designation: 'Culinary Founder & Food Entrepreneur',
    company: 'Roy Table',
    linkedinUrl: 'https://linkedin.com/in/ananya-culinary',
    description: 'Running a deep food-tech cloud kitchen franchise. Seeking tech partners for kitchen automation.',
    contactNumber: '+91 98765 43213',
    tags: ['Chef', 'FoodTech', 'Founder', 'Culinary'],
    relationshipType: 'outbound',
    lastContactDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    callCount: 0,
    messageCount: 1,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Sam Smith',
  role: 'Founder & Full Stack Developer',
  company: 'EventLink',
  phone: '+91 98765 00000',
  linkedin: 'https://linkedin.com/in/samsmith',
  email: 'sam@eventlink.app',
  bio: 'Building privacy-first AI networking tools for physical events.'
};

export function getEvents(): Event[] {
  const data = localStorage.getItem(KEY_EVENTS);
  if (!data) {
    saveEvents(INITIAL_EVENTS);
    return INITIAL_EVENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_EVENTS;
  }
}

export function saveEvents(events: Event[]): void {
  localStorage.setItem(KEY_EVENTS, JSON.stringify(events));
}

export function getPeople(): Person[] {
  const data = localStorage.getItem(KEY_PEOPLE);
  if (!data) {
    savePeople(INITIAL_PEOPLE);
    return INITIAL_PEOPLE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PEOPLE;
  }
}

export function savePeople(people: Person[]): void {
  localStorage.setItem(KEY_PEOPLE, JSON.stringify(people));
}

export function getUserProfile(): UserProfile {
  const data = localStorage.getItem(KEY_PROFILE);
  if (!data) {
    saveUserProfile(INITIAL_PROFILE);
    return INITIAL_PROFILE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
}

export function exportAllDataJson(): string {
  const data = {
    events: getEvents(),
    people: getPeople(),
    profile: getUserProfile(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.events && Array.isArray(data.events)) saveEvents(data.events);
    if (data.people && Array.isArray(data.people)) savePeople(data.people);
    if (data.profile) saveUserProfile(data.profile);
    return true;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
}
