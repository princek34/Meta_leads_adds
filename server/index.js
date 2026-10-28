
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.META_VERIFY_TOKEN;

// Temporary in-memory storage for this PoC.
// Data will be lost when the server restarts.
const leads = new Map();

// Health check
app.get('/', (req, res) => {
  res.send('LeadFlow PoC backend is running.');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Meta webhook verification (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (
    mode === 'subscribe' &&
    verifyToken &&
    token === verifyToken &&
    challenge !== undefined
  ) {
    return res.status(200).send(String(challenge));
  }

  return res.sendStatus(403);
});

// Receive Meta webhook notifications (POST)
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Reject malformed or unsupported payloads.
  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload',
    });
  }

  if (body.object !== 'page' || !Array.isArray(body.entry)) {
    console.warn('Ignoring unsupported webhook object:', body.object);
    return res.sendStatus(200);
  }

  // Acknowledge the notification promptly.
  // Production systems should persist/queue events before acknowledging.
  res.sendStatus(200);

  for (const entry of body.entry) {
    if (!Array.isArray(entry.changes)) continue;

    for (const change of entry.changes) {
      const eventType = change.field;
      const value = change.value || {};

      if (eventType !== 'leadgen' && eventType !== 'leadgen_update') {
        console.log('Ignoring webhook field:', eventType);
        continue;
      }

      const leadgenId = value.leadgen_id;

      console.log('Meta lead event received:', {
        eventType,
        leadgenId: leadgenId || null,
        formId: value.form_id || null,
        pageId: value.page_id || entry.id || null,
        adId: value.ad_id || null,
        createdTime: value.created_time || null,
      });

      if (!leadgenId) {
        console.warn('Lead event did not include leadgen_id');
        continue;
      }

      // Avoid duplicate entries in this in-memory PoC.
      const existing = leads.get(String(leadgenId));

      const lead = {
        leadgen_id: String(leadgenId),
        form_id: value.form_id || existing?.form_id || null,
        page_id: value.page_id || entry.id || existing?.page_id || null,
        ad_id: value.ad_id || existing?.ad_id || null,
        created_time: value.created_time || existing?.created_time || null,
        event_type: eventType,
        received_at: new Date().toISOString(),
        status: existing?.status || 'notification_received',
      };

      leads.set(String(leadgenId), lead);

      // Notify connected React Native clients.
      io.emit('lead:event', lead);
    }
  }
});

// List received lead notifications (IDs/metadata only).
// Protect this endpoint before exposing the backend publicly.
app.get('/api/leads', (req, res) => {
  res.json({
    status: 'success',
    count: leads.size,
    leads: Array.from(leads.values()),
  });
});

// Socket.IO connection status
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('leads:snapshot', Array.from(leads.values()));

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Handle malformed JSON payloads.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Malformed JSON',
    });
  }

  console.error('Unexpected server error:', err.message);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

server.listen(port, () => {
  console.log(`LeadFlow backend listening on port ${port}`);
});
