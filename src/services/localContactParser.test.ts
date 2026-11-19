import { describe, it, expect } from 'vitest';
import { parseLocally } from './localContactParser';

describe('localContactParser', () => {
  it('should return empty fields when transcript is empty or whitespace', () => {
    const result = parseLocally('   ');
    expect(result).toEqual({
      name: '',
      designation: '',
      skills: '',
      description: '',
      phone: ''
    });
  });

  it('should extract name, role, company, skills and phone from natural conversational voice note', () => {
    const transcript = 'I met Hari who is an AI Engineer at DeepTech Labs, he knows Python, LLM, and his phone is 9876543210';
    const result = parseLocally(transcript);

    expect(result.name).toBe('Hari');
    expect(result.designation).toContain('AI Engineer');
    expect(result.phone).toBe('9876543210');
    expect(result.skills).toContain('Python');
    expect(result.skills).toContain('LLM');
  });

  it('should extract contact with intro "Spoke with" and role "UI/UX Designer"', () => {
    const transcript = 'Spoke with Sepideh Yazdi who is a UI/UX Designer at Memphis Studio, skills are Figma and UI/UX';
    const result = parseLocally(transcript);

    expect(result.name).toBe('Sepideh Yazdi');
    expect(result.designation).toContain('UI/UX Designer');
    expect(result.skills).toContain('Figma');
  });

  it('should extract 10-digit Indian phone numbers with or without +91 prefix', () => {
    const transcript1 = 'Met Rohan at Google booth, phone number is +91 9123456789';
    const result1 = parseLocally(transcript1);
    expect(result1.phone?.replace(/[\s-]/g, '')).toContain('9123456789');

    const transcript2 = 'Call Vikram on 9876543212 regarding Flutter SDK';
    const result2 = parseLocally(transcript2);
    expect(result2.phone).toBe('9876543212');
  });

  it('should correctly capture skills like Flutter, Kotlin, React, Docker', () => {
    const transcript = 'Vikram is building apps with Flutter, Dart, and Kotlin';
    const result = parseLocally(transcript);

    expect(result.skills).toContain('Flutter');
    expect(result.skills).toContain('Dart');
    expect(result.skills).toContain('Kotlin');
  });

  it('should retain the full transcript in description for context preserving', () => {
    const transcript = 'Discussed multi-agent LLM systems and hackathon project architecture with Hari';
    const result = parseLocally(transcript);
    expect(result.description).toBe(transcript);
  });
});
