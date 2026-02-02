require('dotenv').config();
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3001;



const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' }
});

app.use(generalLimiter);


// Middleware
app.use(cors({
  origin: 'http://localhost:3002'
}));
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clinic Management API',
      version: '1.0.0',
      description: 'API for clinic management system',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js', './server.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
const patientsRouter = require('./routes/patients');
const doctorsRouter = require('./routes/doctors');
const appointmentsRouter = require('./routes/appointments');
const authRouter = require('./routes/auth');

app.use('/api/patients', patientsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
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
    // Test Supabase connection
    const supabase = require('./config/supabase');
    const { data, error } = await supabase.from('patients').select('count', { count: 'exact', head: true });
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      supabase: error ? 'disconnected' : 'connected',
      database: error ? error.message : 'accessible'
    });
  } catch (err) {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      supabase: 'error',
      database: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
