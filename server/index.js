import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and JSON database exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function readUsers() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function normalizePhone(p) {
  if (!p) return '';
  const digits = String(p).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Health check endpoint
  if (pathname === '/api/health' && req.method === 'GET') {
    const users = readUsers();
    return sendJson(res, 200, {
      status: 'healthy',
      service: 'EventLink Auth Backend',
      registeredUsersCount: users.length,
      timestamp: new Date().toISOString()
    });
  }

  // Register endpoint
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { name, email, password, role, company, phone, linkedin, bio } = payload;

        if (!name || !email || !password) {
          return sendJson(res, 400, { error: 'Name, email, and password are required fields.' });
        }
        if (password.length < 4) {
          return sendJson(res, 400, { error: 'Password must be at least 4 characters long.' });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const normPhone = normalizePhone(phone);
        const users = readUsers();

        // Strict duplicate check across registered users
        const duplicate = users.find(u => 
          u.email.toLowerCase() === cleanEmail ||
          (normPhone && normalizePhone(u.phone) === normPhone)
        );

        if (duplicate) {
          return sendJson(res, 409, {
            error: 'An account with this email or phone number is already registered. Please sign in.'
          });
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = hashPassword(password, salt);

        const newUser = {
          id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: String(name).trim(),
          email: cleanEmail,
          salt,
          passwordHash,
          role: String(role || 'Attendee').trim(),
          company: String(company || '').trim(),
          phone: String(phone || '').trim(),
          linkedin: String(linkedin || '').trim(),
          bio: String(bio || '').trim(),
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        // Omit password hash and salt from response
        const { salt: _, passwordHash: __, ...safeUser } = newUser;

        return sendJson(res, 201, {
          success: true,
          message: 'Account registered successfully with zero duplicates.',
          user: safeUser
        });
      } catch (err) {
        return sendJson(res, 400, { error: 'Invalid JSON payload: ' + err.message });
      }
    });
    return;
  }

  // Login endpoint
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { email, password } = payload;

        if (!email || !password) {
          return sendJson(res, 400, { error: 'Email and password are required.' });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const users = readUsers();

        const user = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (!user) {
          return sendJson(res, 401, { error: 'Account not found. Please register first.' });
        }

        const computedHash = hashPassword(password, user.salt);
        if (computedHash !== user.passwordHash) {
          return sendJson(res, 401, { error: 'Incorrect password. Please verify and try again.' });
        }

        const { salt: _, passwordHash: __, ...safeUser } = user;

        return sendJson(res, 200, {
          success: true,
          message: 'Authentication successful.',
          user: safeUser
        });
      } catch (err) {
        return sendJson(res, 400, { error: 'Invalid JSON payload: ' + err.message });
      }
    });
    return;
  }

  // Fallback 404
  sendJson(res, 404, { error: 'Endpoint not found.' });
});

server.listen(PORT, () => {
  console.log(`EventLink Auth Backend Server running on http://localhost:${PORT}`);
  console.log(`Persistent Database File: ${DB_FILE}`);
});
