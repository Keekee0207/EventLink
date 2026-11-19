import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ContactCard } from './ContactCard';
import { Person } from '../types';

const MOCK_PERSON: Person = {
  id: 'p-1',
  eventId: 'evt-1',
  name: 'Hari',
  designation: 'AI Engineer • DeepTech Labs',
  company: 'DeepTech Labs',
  linkedinUrl: 'https://linkedin.com/in/hari-deeptech',
  description: 'Building autonomous LLM agents.',
  contactNumber: '+91 98765 43210',
  tags: ['AI Engineer', 'LLMs', 'Python'],
  relationshipType: 'inbound',
  lastContactDate: new Date().toISOString(),
  callCount: 2,
  messageCount: 5,
  createdAt: new Date().toISOString()
};

describe('ContactCard Component', () => {
  it('should render contact name, designation, and skills', () => {
    const onDelete = vi.fn();
    const onToggle = vi.fn();

    render(
      <ContactCard
        person={MOCK_PERSON}
        eventTitle="Google Buildathon 2026"
        onDeleteContact={onDelete}
        onToggleRelationship={onToggle}
      />
    );

    expect(screen.getByText('Hari')).toBeInTheDocument();
    expect(screen.getByText('AI Engineer • DeepTech Labs')).toBeInTheDocument();
    expect(screen.getByText('LLMs')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('should call onDeleteContact when delete button is clicked', () => {
    const onDelete = vi.fn();
    const onToggle = vi.fn();
    window.confirm = vi.fn(() => true);

    render(
      <ContactCard
        person={MOCK_PERSON}
        eventTitle="Google Buildathon 2026"
        onDeleteContact={onDelete}
        onToggleRelationship={onToggle}
      />
    );

    const deleteButton = screen.getByTitle('Delete Contact');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('p-1');
  });

  it('should toggle relationship type between inbound and outbound', () => {
    const onDelete = vi.fn();
    const onToggle = vi.fn();

    render(
      <ContactCard
        person={MOCK_PERSON}
        eventTitle="Google Buildathon 2026"
        onDeleteContact={onDelete}
        onToggleRelationship={onToggle}
      />
    );

    const toggleButton = screen.getByText(/inbound/i);
    fireEvent.click(toggleButton);
    expect(onToggle).toHaveBeenCalledWith(MOCK_PERSON);
  });
});
