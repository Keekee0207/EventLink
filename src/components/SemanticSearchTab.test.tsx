import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SemanticSearchTab } from './SemanticSearchTab';
import { Person } from '../types';

const MOCK_PEOPLE: Person[] = [
  {
    id: 'p1',
    eventId: 'evt-1',
    name: 'Hari',
    designation: 'AI Engineer • DeepTech Labs',
    company: 'DeepTech Labs',
    linkedinUrl: '',
    description: 'Building autonomous LLM agents',
    contactNumber: '+91 98765 43210',
    tags: ['AI Engineer', 'LLMs', 'Python'],
    relationshipType: 'inbound',
    lastContactDate: new Date().toISOString(),
    callCount: 2,
    messageCount: 5,
    createdAt: new Date().toISOString()
  }
];

describe('SemanticSearchTab Component', () => {
  it('should render search input and sample query pills', () => {
    render(<SemanticSearchTab people={MOCK_PEOPLE} />);

    expect(screen.getByPlaceholderText(/Ask anything/i)).toBeInTheDocument();
    expect(screen.getByText(/Who knows about LLMs\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Find Flutter \/ Dart developers/i)).toBeInTheDocument();
  });

  it('should execute semantic search and display contact match', async () => {
    render(<SemanticSearchTab people={MOCK_PEOPLE} />);

    const sampleButton = screen.getByText(/Who knows about LLMs\?/i);
    fireEvent.click(sampleButton);

    await waitFor(() => {
      expect(screen.getByText(/Hari/i)).toBeInTheDocument();
      expect(screen.getByText(/Top Recommended Match/i)).toBeInTheDocument();
    });
  });
});
