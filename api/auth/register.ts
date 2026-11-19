import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory / serverless mock DB store for demonstration
// In production with Vercel, this connects to KV, Supabase, Neon Postgres, or MongoDB
const globalUsers: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { name, email, password, role, company, phone, linkedin, bio } = req.body || {};

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required fields.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPhone = String(phone || '').trim().replace(/[\s-]/g, '');

  // Check for duplicate account
  const existing = globalUsers.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail ||
      (cleanPhone && u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone)
  );

  if (existing) {
    return res.status(409).json({
      error: 'An account with this email or phone number is already registered. Please sign in.'
    });
  }

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: String(name).trim(),
    email: cleanEmail,
    role: String(role || 'Attendee').trim(),
    company: String(company || '').trim(),
    phone: String(phone || '').trim(),
    linkedin: String(linkedin || '').trim(),
    bio: String(bio || '').trim(),
    createdAt: new Date().toISOString()
  };

  globalUsers.push(newUser);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully with zero duplicates.',
    user: newUser
  });
}
