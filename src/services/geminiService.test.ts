import { describe, it, expect, beforeEach } from 'vitest';
import {
  getApiKey,
  saveApiKey,
  parseVoiceTranscript,
  searchContacts,
  generateFollowUpMessage
} from './geminiService';
import { Person } from '../types';

describe('geminiService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('API Key Management', () => {
    it('should return empty string in test mode when no custom key is saved', () => {
      expect(getApiKey()).toBe('');
    });

    it('should save and return customized API key', () => {
      saveApiKey('AIzaSyTestKey12345');
      expect(getApiKey()).toBe('AIzaSyTestKey12345');
    });
  });

  describe('Fallback Voice Parsing', () => {
    it('should seamlessly parse transcript via local engine when API key is not configured', async () => {
      const transcript = 'Met Vikram Raman who is a Flutter Developer at MobileFlow, phone 9876543212';
      const parsed = await parseVoiceTranscript(transcript);

      expect(parsed.name).toBe('Vikram Raman');
      expect(parsed.designation).toContain('Flutter Developer');
      expect(parsed.phone).toBe('9876543212');
    });
  });

  describe('Semantic Search Fallback', () => {
    it('should execute ontology search when no API key is provided', async () => {
      const mockPeople: Person[] = [
        {
          id: 'p1',
          eventId: 'evt-1',
          name: 'Hari',
          designation: 'AI Engineer',
          company: 'DeepTech',
          linkedinUrl: '',
          description: 'Works with LLMs and agents',
          contactNumber: '+91 98765 43210',
          tags: ['AI', 'LLMs'],
          relationshipType: 'inbound',
          lastContactDate: new Date().toISOString(),
          callCount: 0,
          messageCount: 0,
          createdAt: new Date().toISOString()
        }
      ];

      const result = await searchContacts('Who knows LLMs?', mockPeople);
      expect(result).toContain('Hari');
      expect(result).toContain('AI Engineer');
    });
  });

  describe('Follow-up Pitch Generation', () => {
    it('should generate personalized follow-up message without emojis', async () => {
      const mockPerson: Person = {
        id: 'p1',
        eventId: 'evt-1',
        name: 'Sepideh Yazdi',
        designation: 'Lead UI/UX Designer',
        company: 'Memphis Studio',
        linkedinUrl: '',
        description: 'Building design systems',
        contactNumber: '+91 98765 43211',
        tags: ['UI/UX', 'Figma'],
        relationshipType: 'outbound',
        lastContactDate: new Date().toISOString(),
        callCount: 0,
        messageCount: 0,
        createdAt: new Date().toISOString()
      };

      const message = await generateFollowUpMessage(mockPerson, 'Google Buildathon 2026');
      expect(message).toContain('Sepideh Yazdi');
      expect(message).toContain('Google Buildathon 2026');
      // Verify zero emojis
      expect(message).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    });
  });
});
