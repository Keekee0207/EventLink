import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AddContactModal } from './AddContactModal';
import { Event, Person } from '../types';

describe('AddContactModal Component', () => {
  const mockEvents: Event[] = [
    {
      id: 'event-101',
      title: 'PromptWars Hackathon',
      date: '2026-11-19',
      location: 'Auditorium 1, Bengaluru',
      description: 'Hackathon',
      peopleCount: 1,
      createdAt: new Date().toISOString()
    }
  ];

  const mockExistingPeople: Person[] = [
    {
      id: 'person-1',
      eventId: 'event-101',
      name: 'Aditi Rao',
      designation: 'Staff Engineer',
      company: 'Google',
      contactNumber: '9876543210',
      linkedinUrl: 'https://linkedin.com/in/aditirao',
      description: 'Met at AI booth',
      tags: ['AI', 'Python'],
      relationshipType: 'inbound',
      createdAt: new Date().toISOString()
    }
  ];

  it('should not render anything when isOpen is false', () => {
    const { container } = render(
      <AddContactModal
        isOpen={false}
        onClose={vi.fn()}
        onSaveContact={vi.fn()}
        events={mockEvents}
        existingPeople={mockExistingPeople}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render form fields when isOpen is true', () => {
    render(
      <AddContactModal
        isOpen={true}
        onClose={vi.fn()}
        onSaveContact={vi.fn()}
        events={mockEvents}
        existingPeople={mockExistingPeople}
        selectedEventId="event-101"
      />
    );

    expect(screen.getByText('Add Person Met')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. Hari')).toBeTruthy();
    expect(screen.getByText('Save Contact')).toBeTruthy();
  });

  it('should reject submission with error when name is only whitespace', () => {
    const onSave = vi.fn();
    render(
      <AddContactModal
        isOpen={true}
        onClose={vi.fn()}
        onSaveContact={onSave}
        events={mockEvents}
        existingPeople={mockExistingPeople}
        selectedEventId="event-101"
      />
    );

    const nameInput = screen.getByPlaceholderText('e.g. Hari');
    fireEvent.change(nameInput, { target: { value: '   ' } });

    const saveBtn = screen.getByText('Save Contact');
    fireEvent.click(saveBtn);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter a contact name.')).toBeTruthy();
  });

  it('should prevent adding duplicate contact in the same event', () => {
    const onSave = vi.fn();
    render(
      <AddContactModal
        isOpen={true}
        onClose={vi.fn()}
        onSaveContact={onSave}
        events={mockEvents}
        existingPeople={mockExistingPeople}
        selectedEventId="event-101"
      />
    );

    const nameInput = screen.getByPlaceholderText('e.g. Hari');
    fireEvent.change(nameInput, { target: { value: 'aditi rao' } });

    const saveBtn = screen.getByText('Save Contact');
    fireEvent.click(saveBtn);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/already exists for this event/i)).toBeTruthy();
  });

  it('should submit contact successfully when inputs are valid', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <AddContactModal
        isOpen={true}
        onClose={onClose}
        onSaveContact={onSave}
        events={mockEvents}
        existingPeople={mockExistingPeople}
        selectedEventId="event-101"
      />
    );

    const nameInput = screen.getByPlaceholderText('e.g. Hari');
    fireEvent.change(nameInput, { target: { value: 'Karan Mehra' } });

    const designationInput = screen.getByPlaceholderText('AI Engineer');
    fireEvent.change(designationInput, { target: { value: 'Founding Engineer' } });

    const companyInput = screen.getByPlaceholderText('e.g. DeepTech Labs');
    fireEvent.change(companyInput, { target: { value: 'FinTech Labs' } });

    const phoneInput = screen.getByPlaceholderText('+91 98765 43210');
    fireEvent.change(phoneInput, { target: { value: '9988776655' } });

    const tagsInput = screen.getByPlaceholderText('LLMs, Python, Flutter, Founder, Deep Tech');
    fireEvent.change(tagsInput, { target: { value: 'Rust, Docker, Cloud' } });

    const saveBtn = screen.getByText('Save Contact');
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Karan Mehra',
        designation: 'Founding Engineer',
        company: 'FinTech Labs',
        contactNumber: '9988776655',
        tags: ['Rust', 'Docker', 'Cloud'],
        relationshipType: 'inbound'
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
