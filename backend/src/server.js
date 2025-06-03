// Add additional logging at the beginning of the file
console.log('Starting server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Load env vars - ensure this is at the very top
require('dotenv').config();
console.log('Loaded environment variables');

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  process.exit(1);
}

// Connect to database
console.log('Attempting to connect to MongoDB...');
connectDB()
  .then(() => console.log('Database connection successful'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

const app = express();

// Security middleware
app.use(helmet());
console.log('Helmet middleware initialized');

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://timetable-frontend.onrender.com', 'https://timetable-backend.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:80'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
console.log('CORS configuration:', corsOptions);
app.use(cors(corsOptions));

// Health check route - IMPORTANT: Must be defined BEFORE the rate limiter
// This ensures health checks are not rate limited
app.get('/api/health', (req, res) => {
  console.log('Health check requested at:', new Date().toISOString());
  res.status(200).json({ 
    status: 'success', 
    message: 'Server is running',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);
console.log('Rate limiter initialized');

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
console.log('Body parsers initialized');

// Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/schedules', require('./routes/schedules'));
  app.use('/api/subjects', require('./routes/subjects'));
  app.use('/api/classes', require('./routes/classes'));
  app.use('/api/substitutions', require('./routes/substitutions'));
  app.use('/api/timetables', require('./routes/timetables'));
  app.use('/api/special-classes', require('./routes/specialClasses'));
  app.use('/api/notifications', require('./routes/notifications'));
  console.log('Routes initialized successfully');
} catch (err) {
  console.error('Failed to initialize routes:', err);
}

// Add a root route for easier testing
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Smart Timetable API is running',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error('🔥 Error:', err);
  console.error('Stack trace:', err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Handle unhandled routes
app.use('*', (req, res) => {
  console.log(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log('🚀 Server Information:');
  console.log(`   📡 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`   🌐 Port: ${PORT}`);
  console.log(`   🔗 URL: http://localhost:${PORT}`);
  console.log(`   🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   📂 Routes: ${app._router.stack.filter(r => r.route).map(r => r.route.path).join(', ')}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  console.error('Stack trace:', err.stack);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; 