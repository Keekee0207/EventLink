import { describe, it, expect, beforeEach } from 'vitest';
import {
  isUserRegistered,
  setUserRegistered,
  getEvents,
  saveEvents,
  getPeople,
  savePeople,
  getUserProfile,
  saveUserProfile,
  exportAllDataJson,
  importAllDataJson
} from './storageService';
import { Event, Person, UserProfile } from '../types';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('User Registration', () => {
    it('should default to unregistered if localStorage is empty', () => {
      expect(isUserRegistered()).toBe(false);
    });

    it('should record user registration accurately', () => {
      setUserRegistered(true);
      expect(isUserRegistered()).toBe(true);
      setUserRegistered(false);
      expect(isUserRegistered()).toBe(false);
    });
  });

  describe('Events Management & Duplicate Prevention', () => {
    it('should seed default events when store is initially empty', () => {
      const events = getEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].title).toBe('Google Buildathon 2026');
    });

    it('should prevent saving duplicate events by title', () => {
      const sampleEvents: Event[] = [
        {
          id: 'evt-1',
          title: 'AI Summit 2026',
          date: '2026-11-20',
          location: 'Chennai',
          description: 'AI conference',
          peopleCount: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'evt-2',
          title: 'AI Summit 2026', // Duplicate title
          date: '2026-11-20',
          location: 'Chennai',
          description: 'Duplicate event',
          peopleCount: 0,
          createdAt: new Date().toISOString()
        }
      ];

      saveEvents(sampleEvents);
      const saved = getEvents();
      expect(saved.filter(e => e.title.toLowerCase() === 'ai summit 2026').length).toBe(1);
    });
  });

  describe('People Management & Duplicate Prevention', () => {
    it('should seed initial contacts when store is initially empty', () => {
      const people = getPeople();
      expect(people.length).toBeGreaterThan(0);
      expect(people.some(p => p.name === 'Hari')).toBe(true);
    });

    it('should deduplicate contacts by eventId and name', () => {
      const peopleList: Person[] = [
        {
          id: 'p1',
          eventId: 'evt-test',
          name: 'Keerthana',
          designation: 'Software Engineer',
          company: 'TechCorp',
          linkedinUrl: 'https://linkedin.com/in/keerthana',
          description: 'Met at booth',
          contactNumber: '+91 9999999999',
          tags: ['React', 'TypeScript'],
          relationshipType: 'inbound',
          lastContactDate: new Date().toISOString(),
          callCount: 1,
          messageCount: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'p2',
          eventId: 'evt-test',
          name: 'Keerthana', // Duplicate contact in the same event
          designation: 'Engineer',
          company: 'TechCorp',
          linkedinUrl: 'https://linkedin.com/in/keerthana',
          description: 'Duplicate entry',
          contactNumber: '+91 9999999999',
          tags: ['React'],
          relationshipType: 'inbound',
          lastContactDate: new Date().toISOString(),
          callCount: 0,
          messageCount: 0,
          createdAt: new Date().toISOString()
        }
      ];

      savePeople(peopleList);
      const saved = getPeople();
      const duplicates = saved.filter(p => p.eventId === 'evt-test' && p.name.toLowerCase() === 'keerthana');
      expect(duplicates.length).toBe(1);
    });
  });

  describe('User Profile and Data Import/Export', () => {
    it('should save and retrieve user profile, auto-registering the user', () => {
      const profile: UserProfile = {
        name: 'Alex Rivera',
        role: 'AI Product Lead',
        company: 'Venture Studio',
        phone: '+91 9876543210',
        linkedin: 'https://linkedin.com/in/alex-rivera',
        email: 'alex@venture.com',
        bio: 'Building frontier AI tooling'
      };

      saveUserProfile(profile);
      expect(isUserRegistered()).toBe(true);

      const retrieved = getUserProfile();
      expect(retrieved.name).toBe('Alex Rivera');
      expect(retrieved.company).toBe('Venture Studio');
    });

    it('should export all data to a valid JSON string and import successfully', () => {
      const exported = exportAllDataJson();
      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('events');
      expect(parsed).toHaveProperty('people');

      const success = importAllDataJson(exported);
      expect(success).toBe(true);
    });

    it('should reject invalid JSON during import without throwing', () => {
      const success = importAllDataJson('INVALID_JSON_STRING');
      expect(success).toBe(false);
    });
  });
});
