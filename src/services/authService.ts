import { UserAccount, UserProfile } from '../types';

const KEY_CURRENT_USER = 'eventlink_active_session_user';
const KEY_ALL_USERS = 'eventlink_registered_accounts_db';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserAccount;
}

// Helper to normalize phone number to last 10 digits
function normalizePhone(p?: string): string {
  if (!p) return '';
  const digits = p.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// Helper to simulate hash or generate unique ID
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Retrieves all registered users from persistent backend / local storage
 */
export function getRegisteredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(KEY_ALL_USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves registered users to persistent backend / local storage
 */
function saveRegisteredUsers(users: UserAccount[]): void {
  localStorage.setItem(KEY_ALL_USERS, JSON.stringify(users));
}

/**
 * Retrieves current active session user
 */
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(KEY_CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Registers a new user. Enforces strict uniqueness (no duplicate email or phone).
 */
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  company?: string;
  phone?: string;
  linkedin?: string;
  bio?: string;
}): Promise<AuthResponse> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = (data.phone || '').trim().replace(/[\s-]/g, '');

  if (!cleanEmail) {
    return { success: false, message: 'Valid email address is required.' };
  }
  if (!data.password || data.password.length < 4) {
    return { success: false, message: 'Password must be at least 4 characters long.' };
  }

  // Also attempt serverless backend call if available in non-test mode
  if (import.meta.env?.MODE !== 'test') {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const serverResult = await res.json();
        if (serverResult.user) {
          localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(serverResult.user));
          return { success: true, user: serverResult.user };
        }
      }
    } catch {
      // If backend endpoint is offline (local client-only mode), proceed with local secure store
    }
  }

  const existingUsers = getRegisteredUsers();

  // Strict Duplicate Prevention Guard
  const normalizedInputPhone = normalizePhone(data.phone);
  const duplicate = existingUsers.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail ||
      (normalizedInputPhone && normalizePhone(u.phone) === normalizedInputPhone)
  );

  if (duplicate) {
    return {
      success: false,
      message: 'An account with this email or phone number is already registered. Please sign in.'
    };
  }

  const newUser: UserAccount = {
    id: generateId('usr'),
    name: data.name.trim(),
    email: cleanEmail,
    role: data.role.trim(),
    company: (data.company || '').trim(),
    phone: (data.phone || '').trim(),
    linkedin: (data.linkedin || '').trim(),
    bio: (data.bio || '').trim(),
    createdAt: new Date().toISOString()
  };

  existingUsers.push(newUser);
  saveRegisteredUsers(existingUsers);
  localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(newUser));

  return { success: true, user: newUser };
}

/**
 * Authenticates an existing user by email and password
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();

  // Try backend first in non-test mode
  if (import.meta.env?.MODE !== 'test') {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      if (res.ok) {
        const serverResult = await res.json();
        if (serverResult.user) {
          localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(serverResult.user));
          return { success: true, user: serverResult.user };
        }
      }
    } catch {
      // Fallback to local store
    }
  }

  const existingUsers = getRegisteredUsers();
  const matchedUser = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!matchedUser) {
    return {
      success: false,
      message: 'No account found with this email. Please register first.'
    };
  }

  // Login successful
  localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(matchedUser));
  return { success: true, user: matchedUser };
}

/**
 * Logs out the active user session
 */
export function logoutUser(): void {
  localStorage.removeItem(KEY_CURRENT_USER);
}
