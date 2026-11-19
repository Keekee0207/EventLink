import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getRegisteredUsers
} from './authService';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('User Registration & Duplicate Prevention', () => {
    it('should successfully register a new user', async () => {
      const res = await registerUser({
        name: 'Arjun Mehta',
        email: 'arjun@techcorp.io',
        password: 'securePassword123',
        role: 'AI Researcher',
        company: 'TechCorp',
        phone: '+91 9876543210'
      });

      expect(res.success).toBe(true);
      expect(res.user?.name).toBe('Arjun Mehta');
      expect(res.user?.email).toBe('arjun@techcorp.io');

      const currentUser = getCurrentUser();
      expect(currentUser?.email).toBe('arjun@techcorp.io');
    });

    it('should strictly reject duplicate user registration by email', async () => {
      await registerUser({
        name: 'Arjun Mehta',
        email: 'arjun@techcorp.io',
        password: 'securePassword123',
        role: 'AI Researcher'
      });

      const duplicateRes = await registerUser({
        name: 'Arjun M.',
        email: 'arjun@techcorp.io', // Duplicate email
        password: 'differentPassword',
        role: 'Founder'
      });

      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.message).toContain('already registered');
    });

    it('should strictly reject duplicate user registration by phone', async () => {
      await registerUser({
        name: 'Kavita Sen',
        email: 'kavita1@studio.com',
        password: 'password123',
        role: 'Lead Designer',
        phone: '9876543210'
      });

      const duplicateRes = await registerUser({
        name: 'Kavita Other',
        email: 'kavita2@studio.com',
        password: 'password123',
        role: 'Designer',
        phone: '+91 9876543210' // Same phone number
      });

      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.message).toContain('already registered');
    });
  });

  describe('User Authentication & Login', () => {
    it('should log in an existing registered user', async () => {
      await registerUser({
        name: 'Devika Ray',
        email: 'devika@deeptech.ai',
        password: 'mySecretPassword',
        role: 'Robotics Engineer'
      });

      // Clear session to test login
      logoutUser();
      expect(getCurrentUser()).toBeNull();

      const loginRes = await loginUser('devika@deeptech.ai', 'mySecretPassword');
      expect(loginRes.success).toBe(true);
      expect(loginRes.user?.name).toBe('Devika Ray');

      expect(getCurrentUser()?.email).toBe('devika@deeptech.ai');
    });

    it('should reject login for an unregistered email', async () => {
      const loginRes = await loginUser('unknown@domain.com', 'password');
      expect(loginRes.success).toBe(false);
      expect(loginRes.message).toContain('No account found');
    });
  });

  describe('Session Management', () => {
    it('should clear active session upon logout', async () => {
      await registerUser({
        name: 'Test User',
        email: 'test@eventlink.app',
        password: 'password123',
        role: 'Attendee'
      });

      expect(getCurrentUser()).not.toBeNull();
      logoutUser();
      expect(getCurrentUser()).toBeNull();
    });
  });
});
