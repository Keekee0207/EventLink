import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { RegistrationModal } from './RegistrationModal';

describe('RegistrationModal Component', () => {
  it('should not render when isOpen is false', () => {
    const onRegister = vi.fn();
    const { container } = render(
      <RegistrationModal isOpen={false} onRegisterSuccess={onRegister} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render form fields when isOpen is true', () => {
    const onRegister = vi.fn();
    render(
      <RegistrationModal isOpen={true} onRegisterSuccess={onRegister} />
    );

    expect(screen.getByText('Register Your Profile')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Founder, AI Engineer')).toBeInTheDocument();
  });

  it('should submit registration and invoke callback with valid profile', async () => {
    const onRegister = vi.fn();
    render(
      <RegistrationModal isOpen={true} onRegisterSuccess={onRegister} />
    );

    const nameInput = screen.getByPlaceholderText('e.g. John Doe');
    const roleInput = screen.getByPlaceholderText('e.g. Founder, AI Engineer');
    const companyInput = screen.getByPlaceholderText('e.g. DeepTech Labs');

    fireEvent.change(nameInput, { target: { value: 'Maya Patel' } });
    fireEvent.change(roleInput, { target: { value: 'AI Research Lead' } });
    fireEvent.change(companyInput, { target: { value: 'Nexus AI' } });

    const submitButton = screen.getByText('Register Profile & Enter EventLink');
    fireEvent.submit(submitButton.closest('form')!);

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledTimes(1);
      expect(onRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Maya Patel',
          role: 'AI Research Lead',
          company: 'Nexus AI'
        })
      );
    });
  });
});
