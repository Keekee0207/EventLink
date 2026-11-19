import { Event, Person, UserProfile } from '../types';
import { getCurrentUser } from './authService';

const KEY_EVENTS = 'eventlink_events';
const KEY_PEOPLE = 'eventlink_people';
const KEY_PROFILE = 'eventlink_profile';
const KEY_REGISTERED = 'eventlink_user_registered';

function getUserEventsKey(): string {
  const user = getCurrentUser();
  return user ? `eventlink_user_${user.id}_events` : KEY_EVENTS;
}

function getUserPeopleKey(): string {
  const user = getCurrentUser();
  return user ? `eventlink_user_${user.id}_people` : KEY_PEOPLE;
}

function getUserProfileKey(): string {
  const user = getCurrentUser();
  return user ? `eventlink_user_${user.id}_profile` : KEY_PROFILE;
}

const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-buildathon-2026',
    title: 'Google Buildathon 2026',
    date: '2026-11-15',
    location: 'Chennai Trade Centre, Chennai, Tamil Nadu',
    description: 'National startup & AI buildathon powered by Google DeepMind and Google Cloud.',
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

export function isUserRegistered(): boolean {
  return localStorage.getItem(KEY_REGISTERED) === 'true';
}

export function setUserRegistered(val: boolean): void {
  localStorage.setItem(KEY_REGISTERED, val ? 'true' : 'false');
}

export function getEvents(): Event[] {
  const data = localStorage.getItem(getUserEventsKey());
  if (!data) {
    saveEvents(INITIAL_EVENTS);
    return INITIAL_EVENTS;
  }
  try {
    const parsed: Event[] = JSON.parse(data);
    // Deduplicate by ID and Title
    const seen = new Set<string>();
    return parsed.filter((evt) => {
      const key = evt.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return INITIAL_EVENTS;
  }
}

export function saveEvents(events: Event[]): void {
  // Deduplicate before saving
  const seen = new Set<string>();
  const cleanEvents = events.filter((evt) => {
    const key = evt.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  localStorage.setItem(getUserEventsKey(), JSON.stringify(cleanEvents));
}

export function getPeople(): Person[] {
  const data = localStorage.getItem(getUserPeopleKey());
  if (!data) {
    savePeople(INITIAL_PEOPLE);
    return INITIAL_PEOPLE;
  }
  try {
    const parsed: Person[] = JSON.parse(data);
    // Deduplicate by Name + EventId
    const seen = new Set<string>();
    return parsed.filter((p) => {
      const key = `${p.eventId}-${p.name.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return INITIAL_PEOPLE;
  }
}

export function savePeople(people: Person[]): void {
  // Deduplicate before saving
  const seen = new Set<string>();
  const cleanPeople = people.filter((p) => {
    const key = `${p.eventId}-${p.name.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  localStorage.setItem(getUserPeopleKey(), JSON.stringify(cleanPeople));
}

export function getUserProfile(): UserProfile {
  const data = localStorage.getItem(getUserProfileKey());
  if (!data) {
    return {
      name: '',
      role: '',
      company: '',
      phone: '',
      linkedin: '',
      email: '',
      bio: ''
    };
  }
  try {
    return JSON.parse(data);
  } catch {
    return {
      name: '',
      role: '',
      company: '',
      phone: '',
      linkedin: '',
      email: '',
      bio: ''
    };
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(getUserProfileKey(), JSON.stringify(profile));
  setUserRegistered(true);
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
