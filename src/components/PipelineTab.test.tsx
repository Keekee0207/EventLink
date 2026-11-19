import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PipelineTab } from './PipelineTab';
import { Person, Event } from '../types';

const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Google Buildathon 2026',
    date: '2026-11-15',
    location: 'Chennai',
    description: 'Buildathon',
    peopleCount: 2,
    createdAt: new Date().toISOString()
  }
];

const MOCK_PEOPLE: Person[] = [
  {
    id: 'p1',
    eventId: 'evt-1',
    name: 'Hari',
    designation: 'AI Engineer',
    company: 'DeepTech Labs',
    linkedinUrl: '',
    description: 'LLM agents',
    contactNumber: '+91 98765 43210',
    tags: ['AI', 'LLMs'],
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
    linkedinUrl: '',
    description: 'Design systems',
    contactNumber: '+91 98765 43211',
    tags: ['UI/UX', 'Figma'],
    relationshipType: 'outbound',
    lastContactDate: new Date().toISOString(),
    callCount: 0,
    messageCount: 0,
    createdAt: new Date().toISOString()
  }
];

describe('PipelineTab Component', () => {
  it('should render inbound and outbound sections with contact cards', () => {
    render(
      <PipelineTab
        people={MOCK_PEOPLE}
        events={MOCK_EVENTS}
        onToggleRelationship={vi.fn()}
        onDeleteContact={vi.fn()}
      />
    );

    expect(screen.getByText(/Inbound vs. Outbound/i)).toBeInTheDocument();
    expect(screen.getByText('Hari')).toBeInTheDocument();
    expect(screen.getByText('Sepideh Yazdi')).toBeInTheDocument();
  });

  it('should generate AI follow-up pitch when clicking AI Pitch button on outbound contact', async () => {
    render(
      <PipelineTab
        people={MOCK_PEOPLE}
        events={MOCK_EVENTS}
        onToggleRelationship={vi.fn()}
        onDeleteContact={vi.fn()}
      />
    );

    const pitchButtons = screen.getAllByText(/AI Pitch/i);
    expect(pitchButtons.length).toBeGreaterThan(0);
    fireEvent.click(pitchButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Gemini Re-engagement Pitch/i)).toBeInTheDocument();
    });
  });
});
