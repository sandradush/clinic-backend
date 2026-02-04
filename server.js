require('dotenv').config();
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Allow all origins and enable credentials (reflect origin)
app.use(cors({ origin: true, credentials: true }));
// Enable pre-flight for all routes
app.options('*', cors({ origin: true, credentials: true }));
app.use(express.json());

// Swagger configuration
// Allow setting hosted URL(s) via env var `SERVER_URLS` or single `SERVER_URL`.
// `SERVER_URLS` can be a comma-separated list (e.g. "https://api.prod.com,https://api.staging.com").
const rawServerUrls = process.env.SERVER_URLS || process.env.SERVER_URL || `http://localhost:${PORT}`;
const urlList = rawServerUrls.split(',').map(s => s.trim()).filter(Boolean);

const swaggerServers = urlList.map((url) => {
  let desc = 'Server';
  if (process.env.SERVER_ENV_DESC) desc = process.env.SERVER_ENV_DESC;
  else if (url.includes('localhost')) desc = 'Local server';
  else if (process.env.NODE_ENV === 'production') desc = 'Production server';
  else desc = 'Staging/Dev server';
  return { url, description: desc };
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clinic Management API',
      version: '1.0.0',
      description: 'API for clinic management system',
    },
    servers: swaggerServers,
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

    const dynamicSpec = Object.assign({}, specsTemplate, { servers });
    res.json(dynamicSpec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: '/api-docs.json' }));

// Routes
const patientsRouter = require('./routes/patients');
const doctorsRouter = require('./routes/doctors');
const appointmentsRouter = require('./routes/appointments');
const prescriptionsRouter = require('./routes/prescriptions');
const authRouter = require('./routes/auth');

app.use('/api/patients', patientsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/auth', authRouter);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
