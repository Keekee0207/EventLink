export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  peopleCount: number;
  createdAt: string;
}

export interface Person {
  id: string;
  eventId: string;
  name: string;
  designation: string;
  company?: string;
  linkedinUrl: string;
  description: string;
  contactNumber: string;
  photoUri?: string | null;
  businessCardUri?: string | null;
  voiceTranscript?: string | null;
  tags: string[];
  relationshipType: 'inbound' | 'outbound';
  lastContactDate?: string;
  callCount?: number;
  messageCount?: number;
  createdAt: string;
}

export interface ParsedContact {
  name: string;
  designation: string;
  skills: string;
  description: string;
  phone?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  company: string;
  phone: string;
  linkedin: string;
  email: string;
  bio: string;
}

export interface UserAccount extends UserProfile {
  id: string;
  createdAt: string;
}
