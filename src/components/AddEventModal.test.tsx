import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AddEventModal } from './AddEventModal';
import { Event } from '../types';

describe('AddEventModal Component', () => {
  const mockExistingEvents: Event[] = [
    {
      id: 'event-1',
      title: 'Google Buildathon 2026',
      date: '2026-11-15',
      location: 'Google Tech Center, Bengaluru',
      description: 'AI & Cloud Summit',
      peopleCount: 4,
      createdAt: new Date().toISOString()
    }
  ];

  it('should not render anything when isOpen is false', () => {
    const { container } = render(
      <AddEventModal
        isOpen={false}
        onClose={vi.fn()}
        onSaveEvent={vi.fn()}
        existingEvents={mockExistingEvents}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render event form inputs when isOpen is true', () => {
    render(
      <AddEventModal
        isOpen={true}
        onClose={vi.fn()}
        onSaveEvent={vi.fn()}
        existingEvents={mockExistingEvents}
      />
    );

    expect(screen.getByText('Create Event Space')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. Google Buildathon 2026')).toBeTruthy();
    expect(screen.getByText('Create Event')).toBeTruthy();
  });

  it('should prevent submission and show error when event title is only whitespace', () => {
    const onSave = vi.fn();
    render(
      <AddEventModal
        isOpen={true}
        onClose={vi.fn()}
        onSaveEvent={onSave}
        existingEvents={mockExistingEvents}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Google Buildathon 2026');
    fireEvent.change(titleInput, { target: { value: '   ' } });

    const submitBtn = screen.getByText('Create Event');
    fireEvent.click(submitBtn);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter an event name.')).toBeTruthy();
  });

  it('should prevent duplicate event title and display error banner', () => {
    const onSave = vi.fn();
    render(
      <AddEventModal
        isOpen={true}
        onClose={vi.fn()}
        onSaveEvent={onSave}
        existingEvents={mockExistingEvents}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Google Buildathon 2026');
    fireEvent.change(titleInput, { target: { value: 'google buildathon 2026' } });

    const submitBtn = screen.getByText('Create Event');
    fireEvent.click(submitBtn);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/already exists/i)).toBeTruthy();
  });

  it('should successfully submit new event when details are valid', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <AddEventModal
        isOpen={true}
        onClose={onClose}
        onSaveEvent={onSave}
        existingEvents={mockExistingEvents}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Google Buildathon 2026');
    fireEvent.change(titleInput, { target: { value: 'AI Geeks Hackathon 2026' } });

    const venueInput = screen.getByPlaceholderText('e.g. Chennai Trade Centre, Hall 3');
    fireEvent.change(venueInput, { target: { value: 'Hall 3' } });

    const submitBtn = screen.getByText('Create Event');
    fireEvent.click(submitBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'AI Geeks Hackathon 2026',
        location: 'Hall 3'
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
