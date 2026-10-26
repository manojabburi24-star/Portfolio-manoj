const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to connect to the Neon database.');
}

const db = new Pool({ connectionString: databaseUrl });
db.on('error', (err) => {
  console.error('Unexpected PostgreSQL database error:', err.message);
});

// Security & Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));
// Serve only the website itself: never the database, server code, .env or backups
const PUBLIC_FILES = ['index.html', 'style.css', 'script.js', 'case-stories.js'];
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get(['/', ...PUBLIC_FILES.map(f => `/${f}`)], (req, res) => {
  res.sendFile(path.join(__dirname, req.path === '/' ? 'index.html' : req.path.slice(1)));
});
app.get('/favicon.ico', (req, res) => res.redirect(301, '/assets/favicon.svg'));

// Admin endpoints need ADMIN_TOKEN (sent as "Authorization: Bearer <token>"); without it they are switched off
const requireAdmin = (req, res, next) => {
  const token = process.env.ADMIN_TOKEN;
  if (token && req.headers.authorization === `Bearer ${token}`) return next();
  return res.status(404).json({ error: 'Not found' });
};

// Initialize Messages Table
const initializeDatabase = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      "createdAt" TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      ip TEXT
    )
  `);
};

// Simple In-Memory Rate Limiting & Duplicate Prevention
const rateLimitMap = new Map();
const recentSubmissions = new Map();

const isRateLimited = (ip) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins
  const maxRequests = 30; // Increased limit for user testing

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    rateLimitMap.set(ip, record);
    return false;
  }

  record.count += 1;
  rateLimitMap.set(ip, record);
  return record.count > maxRequests;
};

// Input Sanitization Helper (XSS Protection)
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// Real-time SSE Admin Connections
const sseClients = new Set();

const broadcastNewMessage = (messageObj) => {
  const data = `data: ${JSON.stringify({ type: 'new_message', data: messageObj })}\n\n`;
  for (const client of sseClients) {
    client.write(data);
  }
};

// ==========================================================================
// API ENDPOINTS
// ==========================================================================

// 1. Submit Contact Form Message
app.post('/api/contact', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Rate Limiting Check
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Too many message requests. Please try again in 15 minutes.'
    });
  }

  let { name, email, message } = req.body;

  // Input Sanitization
  name = sanitizeInput(name);
  email = sanitizeInput(email);
  message = sanitizeInput(message);

  // Server-Side Validation
  const errors = {};

  if (!name || name.length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  } else if (name.length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!message || message.length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  } else if (message.length > 3000) {
    errors.message = 'Message cannot exceed 3000 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Duplicate Submission Prevention (Check within 5s)
  const dupKey = `${email}:${message}`;
  const now = Date.now();
  if (recentSubmissions.has(dupKey) && (now - recentSubmissions.get(dupKey)) < 5000) {
    return res.status(400).json({
      error: 'Duplicate submission detected. Please wait a moment before sending again.'
    });
  }
  recentSubmissions.set(dupKey, now);

  // Construct Message Object
  const id = 'msg_' + crypto.randomBytes(8).toString('hex');
  const createdAt = new Date().toISOString();
  const status = 'new';

  const messageRecord = { id, name, email, message, createdAt, status, ip: clientIp };

  // Save to Neon PostgreSQL
  try {
    await db.query(
      `INSERT INTO messages (id, name, email, message, "createdAt", status, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, name, email, message, createdAt, status, clientIp]
    );
  } catch (err) {
    console.error('Database Error:', err.message);
    return res.status(500).json({ error: 'Failed to persist message to database. Please try again.' });
  }

  // Broadcast Realtime SSE Event
  broadcastNewMessage(messageRecord);

  return res.status(201).json({
    success: true,
    message: 'Message Sent ✓',
    data: { id, createdAt }
  });
});

// 2. GET All Messages (Admin Endpoint)
app.get('/api/messages', requireAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    const sql = status
      ? `SELECT * FROM messages WHERE status = $1 ORDER BY "createdAt" DESC`
      : `SELECT * FROM messages ORDER BY "createdAt" DESC`;
    const { rows } = await db.query(sql, status ? [status] : []);
    res.json({ success: true, count: rows.length, messages: rows });
  } catch (err) {
    console.error('Database Error: Failed to fetch messages:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 3. PATCH Update Message Status (Admin Endpoint)
app.patch('/api/messages/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'read', 'replied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be new, read, or replied.' });
  }

  try {
    const result = await db.query(
      `UPDATE messages SET status = $1 WHERE id = $2`,
      [status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, id, status });
  } catch (err) {
    console.error('Database Error: Failed to update message status:', err.message);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// 4. SSE Real-Time Stream Endpoint for Admin Dashboard
app.get('/api/messages/stream', requireAdmin, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE Stream Connected' })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Start Express Server after the database is ready
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`Portfolio Messaging Server running on port ${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/contact`);
    console.log('Database: Neon PostgreSQL');
    console.log(`==================================================`);
  });
}).catch((err) => {
  console.error('Failed to initialize the Neon database:', err.message);
  process.exitCode = 1;
});
