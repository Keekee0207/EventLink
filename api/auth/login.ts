import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  return res.status(200).json({
    success: true,
    message: 'User authentication verified.',
    user: {
      id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      role: 'Attendee',
      createdAt: new Date().toISOString()
    }
  });
}
