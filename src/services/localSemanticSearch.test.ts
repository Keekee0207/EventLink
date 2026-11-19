import { describe, it, expect } from 'vitest';
import { searchLocally } from './localSemanticSearch';
import { Person } from '../types';

const MOCK_PEOPLE: Person[] = [
  {
    id: 'p1',
    eventId: 'evt-1',
    name: 'Hari',
    designation: 'AI Engineer • DeepTech Labs',
    company: 'DeepTech Labs',
    linkedinUrl: 'https://linkedin.com/in/hari',
    description: 'Building autonomous LLM agents and multi-agent coordination systems.',
    contactNumber: '+91 98765 43210',
    tags: ['AI Engineer', 'LLMs', 'Python', 'Agents'],
    relationshipType: 'inbound',
    lastContactDate: new Date().toISOString(),
    callCount: 2,
    messageCount: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    eventId: 'evt-1',
    name: 'Sepideh Yazdi',
    designation: 'Lead UI/UX Designer',
    company: 'Memphis Studio',
    linkedinUrl: 'https://linkedin.com/in/sepideh',
    description: 'Designs playful neo-brutalist interfaces and accessible mobile systems.',
    contactNumber: '+91 98765 43211',
    tags: ['UI/UX', 'Figma', 'Product Design', 'Founder'],
    relationshipType: 'outbound',
    lastContactDate: new Date().toISOString(),
    callCount: 0,
    messageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p3',
    eventId: 'evt-1',
    name: 'Vikram Raman',
    designation: 'Flutter & Dart Architect',
    company: 'MobileFlow',
    linkedinUrl: 'https://linkedin.com/in/vikram',
    description: 'Specializes in high-performance Dart and offline-first mobile apps.',
    contactNumber: '+91 98765 43212',
    tags: ['Flutter Developer', 'Dart', 'Android', 'Mobile'],
    relationshipType: 'inbound',
    lastContactDate: new Date().toISOString(),
    callCount: 1,
    messageCount: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p4',
    eventId: 'evt-1',
    name: 'Chef Ananya Roy',
    designation: 'Culinary Founder & Food Entrepreneur',
    company: 'Roy Table',
    linkedinUrl: 'https://linkedin.com/in/ananya',
    description: 'Running a deep food-tech cloud kitchen franchise.',
    contactNumber: '+91 98765 43213',
    tags: ['Chef', 'FoodTech', 'Founder', 'Culinary'],
    relationshipType: 'outbound',
    lastContactDate: new Date().toISOString(),
    callCount: 0,
    messageCount: 1,
    createdAt: new Date().toISOString()
  }
];

describe('localSemanticSearch', () => {
  it('should return empty message when no people exist', () => {
    const result = searchLocally('Who knows AI?', []);
    expect(result).toBe('No contacts saved in your database yet.');
  });

  it('should match direct name query', () => {
    const result = searchLocally('Hari', MOCK_PEOPLE);
    expect(result).toContain('Hari');
    expect(result).toContain('AI Engineer');
  });

  it('should bridge "Dart" concept query to Flutter Developer (Vikram)', () => {
    const result = searchLocally('Who knows about Dart?', MOCK_PEOPLE);
    expect(result).toContain('Vikram Raman');
    expect(result).toContain('Flutter');
  });

  it('should bridge "LLMs" query to AI Engineer (Hari)', () => {
    const result = searchLocally('Who can build with LLMs?', MOCK_PEOPLE);
    expect(result).toContain('Hari');
    expect(result).toContain('AI Engineer');
  });

  it('should bridge "Figma" query to UI/UX Designer (Sepideh)', () => {
    const result = searchLocally('I need someone experienced in Figma prototyping', MOCK_PEOPLE);
    expect(result).toContain('Sepideh Yazdi');
  });

  it('should match food/culinary cluster when querying for "food" or "restaurant"', () => {
    const result = searchLocally('Who works in the restaurant or food business?', MOCK_PEOPLE);
    expect(result).toContain('Chef Ananya Roy');
  });

  it('should return a friendly fallback message when no candidates match', () => {
    const result = searchLocally('marine biology oceanography scuba diving', MOCK_PEOPLE);
    expect(result).toContain('No direct match found');
  });
});
