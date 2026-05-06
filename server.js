const cron = require('node-cron');
const { notifyPatientReminder } = require('./services/emailService');

require('dotenv').config();
const http = require('http');
const { WebSocketServer } = require('ws');
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const pool = require('./config/db');
const setupChatWs = require('./ws/chatWs');

const app = express();

// Parse simple CLI args for --host and --port (e.g. `node server.js --host 0.0.0.0 --port 8001`)
const argv = process.argv.slice(2);
const argMap = argv.reduce((acc, cur, idx, arr) => {
  if (cur.startsWith('--')) {
    const key = cur.replace(/^--/, '');
    const next = arr[idx + 1];
    if (next && !next.startsWith('--')) acc[key] = next;
  }
  return acc;
}, {});

const PORT = argMap.port || process.env.PORT || 3001;
const HOST = argMap.host || process.env.HOST || '0.0.0.0';

// Middleware
// Allow all origins and enable credentials (reflect origin)
app.use(cors({ origin: true, credentials: true }));
// Enable pre-flight for all routes
app.options('*', cors({ origin: true, credentials: true }));
app.use(express.json());

// Handle malformed JSON
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

// Swagger configuration
// Allow setting hosted URL(s) via env var `SERVER_URLS` or single `SERVER_URL`.
// `SERVER_URLS` can be a comma-separated list (e.g. "https://api.prod.com,https://api.staging.com").
// If not provided, leave servers empty and let the dynamic `/api-docs.json`
// handler inject the request host as the server URL at runtime.
const rawServerUrls = process.env.SERVER_URLS || process.env.SERVER_URL || '';
const urlList = rawServerUrls ? rawServerUrls.split(',').map(s => s.trim()).filter(Boolean) : [];

const swaggerServers = urlList.length ? urlList.map((url) => {
  let desc = 'Server';
  if (process.env.SERVER_ENV_DESC) desc = process.env.SERVER_ENV_DESC;
  else if (url.includes('localhost')) desc = 'Local server';
  else if (process.env.NODE_ENV === 'production') desc = 'Production server';
  else desc = 'Staging/Dev server';
  return { url, description: desc };
}) : [];

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clinic Management API',
      version: '1.0.0',
      description: 'API for clinic management system',
    },
    // Only include static servers when explicitly provided via env.
    ...(swaggerServers.length ? { servers: swaggerServers } : {}),
  },
  apis: ['./routes/*.js', './server.js'],
};

const specsTemplate = swaggerJsdoc(swaggerOptions);

// Serve a dynamic swagger JSON that uses either SERVER_URL(S) env or the
// actual host from the incoming request so the UI won't always show localhost.
app.get('/api-docs.json', (req, res) => {
  try {
    const hostFromReq = `${req.protocol}://${req.get('host')}`;
    const serverUrls = (process.env.SERVER_URLS || process.env.SERVER_URL)
      ? (process.env.SERVER_URLS || process.env.SERVER_URL).split(',').map(s => s.trim()).filter(Boolean)
      : [hostFromReq];

    const servers = serverUrls.map(url => ({ url, description: url.includes('localhost') ? 'Local server' : 'Server' }));

    // Build dynamic spec from template but do NOT include `servers`.
    const dynamicSpec = Object.assign({}, specsTemplate);
    // Ensure any servers field is removed so Swagger UI does not display Servers list
    if (dynamicSpec.servers) delete dynamicSpec.servers;
    res.json(dynamicSpec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: '/api-docs.json' }));

// Routes
const authRouter = require('./routes/auth');
const appointmentsRouter = require('./routes/appointments');
const symptomsRouter = require('./routes/symptoms');
const prescriptionsRouter = require('./routes/prescriptions');
const medicalsRouter = require('./routes/medicals');
const vitalsRouter = require('./routes/vitals');
const devicesRouter = require('./routes/devices');
const clinicsRouter = require('./routes/clinics');
const callsRouter = require('./routes/calls');
const chatRouter = require('./routes/chat');
const medicalRecordsRouter = require('./routes/medicalRecords');
const doctorsRouter = require('./routes/doctors');
const doctorRequestsRouter = require('./routes/doctorRequests');
const uploadRouter = require('./routes/upload');
const notificationsRouter = require('./routes/notifications');
const paymentsRouter = require('./routes/payments');
const usersRouter = require('./routes/users');
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/medicals', medicalsRouter);
app.use('/api/vitals', vitalsRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/clinics', clinicsRouter);
app.use('/api/calls', callsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/medical-records', medicalRecordsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/doctor-requests', doctorRequestsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/users', usersRouter);
app.use('/uploads', express.static('uploads'));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   example: 2024-01-01T00:00:00.000Z
 */
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

const server = http.createServer(app);

// WebSocket: /ws/chat/:channelId  (channelId is used as the userId key)
const chatWss = new WebSocketServer({ noServer: true });
setupChatWs(chatWss);

server.on('upgrade', (req, socket, head) => {
  if (req.url && req.url.startsWith('/ws/chat/')) {
    chatWss.handleUpgrade(req, socket, head, (ws) => {
      chatWss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Swagger UI available at http://${HOST}:${PORT}/api-docs`);
});

// Daily reminder: runs at 9 AM — emails patients with appointments tomorrow
cron.schedule('0 9 * * *', async () => {
  try {
    const { rows } = await pool.query(
      `SELECT u.email FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.date = CURRENT_DATE + INTERVAL '1 day'
         AND a.status = 'approved'`
    );
    rows.forEach(r => notifyPatientReminder(r.email));
  } catch (err) {
    console.error('Reminder cron error:', err);
  }
});
