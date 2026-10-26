const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// SQLite Database Setup
const dbPath = path.resolve(process.env.DATABASE_PATH || './messages.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Initialize Messages Table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      ip TEXT
    )
  `);
});

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

// Transporter Factory
const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false';

  if (!user || !pass) {
    return null; // Local development mode without active SMTP credentials
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
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

  // Save to SQLite Database
  const sql = `INSERT INTO messages (id, name, email, message, createdAt, status, ip) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [id, name, email, message, createdAt, status, clientIp], async function (err) {
    if (err) {
      console.error('Database Error:', err.message);
      return res.status(500).json({ error: 'Failed to persist message to database. Please try again.' });
    }

    // Broadcast Realtime SSE Event
    broadcastNewMessage(messageRecord);

    // Send Email Notification to Gmail
    const ownerEmail = process.env.OWNER_EMAIL || 'manojabburi24@gmail.com';
    const portfolioUrl = process.env.PORTFOLIO_URL || 'http://localhost:8080';
    const formattedDate = new Date(createdAt).toLocaleString();

    const transporter = createTransporter();

    const emailSubject = `New Portfolio Message — ${name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">New Message from Portfolio</h2>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Received:</strong> ${formattedDate}</p>
        <p><strong>Portfolio URL:</strong> <a href="${portfolioUrl}">${portfolioUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p><strong>Message:</strong></p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #0f172a; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        <br />
        <a href="mailto:${email}?subject=Re:%20Portfolio%20Message" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 10px 18px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Reply to Visitor &rarr;</a>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Portfolio Messaging" <${process.env.SMTP_USER}>`,
          to: ownerEmail,
          replyTo: email,
          subject: emailSubject,
          html: emailHtml,
        });
        console.log(`[Email Delivered] Notification sent to ${ownerEmail} for message ${id}`);
      } catch (mailErr) {
        console.error('[Email Warning] Failed to send email via SMTP:', mailErr.message);
        // Message is safely stored in DB
      }
    } else {
      console.log(`[Local Simulation Mode] SMTP credentials not set in .env. Message ${id} saved to DB successfully.`);
    }

    return res.status(201).json({
      success: true,
      message: 'Message Sent ✓',
      data: { id, createdAt }
    });
  });
});

// 2. GET All Messages (Admin Endpoint)
app.get('/api/messages', requireAdmin, (req, res) => {
  const { status } = req.query;
  let sql = `SELECT * FROM messages ORDER BY createdAt DESC`;
  let params = [];

  if (status) {
    sql = `SELECT * FROM messages WHERE status = ? ORDER BY createdAt DESC`;
    params.push(status);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    res.json({ success: true, count: rows.length, messages: rows });
  });
});

// 3. PATCH Update Message Status (Admin Endpoint)
app.patch('/api/messages/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'read', 'replied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be new, read, or replied.' });
  }

  db.run(`UPDATE messages SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update message status' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, id, status });
  });
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

// Start Express Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Portfolio Messaging Server running on port ${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/contact`);
  console.log(`Database: ${dbPath}`);
  console.log(`==================================================`);
});
