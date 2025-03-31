const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Import services
const Booking = require('./models/Booking');
const { sendEmail } = require('./services/emailService');
const { sendSMS } = require('./services/smsService');
const bookingsRouter = require('./routes/bookings');

const app = express();

// Log environment
console.log('🚀 Starting server in environment:', process.env.NODE_ENV || 'development');

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://trsv.vercel.app',
    'https://trsvbackend.vercel.app',
    'https://trsv-black.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Handle preflight requests
app.options('*', cors(corsOptions));

// MongoDB Connection
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vivekdixit48313:UaSonIQubZp55sPQ@travel.yu4rxyc.mongodb.net/Uttrakhand_booking_services?retryWrites=true&w=majority&appName=travel';
    
    console.log('🔌 Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI, {
      retryWrites: true,
      w: 'majority'
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  console.log('📝 Root route accessed');
  res.json({
    status: 'success',
    message: 'Welcome to Uttarakhand Travel Services API',
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      email: 'nucleasitsolutions@gmail.com',
      sms: 'SMS-Gate.app'
    },
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      bookings: '/api/bookings'
    }
  });
});

// Routes
app.use('/api/bookings', bookingsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check requested');
  res.status(200).json({ 
    status: 'ok',
    message: 'All services are up and running! 🚀',
    timestamp: new Date().toISOString()
  });
});

// Server status endpoint
app.get('/api/status', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check email service
    let emailStatus = 'unknown';
    try {
      await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email to verify the email service.'
      });
      emailStatus = 'working';
    } catch (error) {
      emailStatus = 'error';
      console.error('Email service error:', error);
    }

    // Check SMS service
    let smsStatus = 'unknown';
    try {
      const smsResult = await sendSMS('SMS Service Test: Service is operational and ready to send booking notifications.');
      smsStatus = smsResult ? 'working' : 'error';
    } catch (error) {
      smsStatus = 'error';
      console.error('SMS service error:', error);
    }

    // Get server uptime
    const uptime = process.uptime();

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
      status: 'ok',
      message: 'All services are up and running! 🚀',
      services: {
        mongodb: {
          status: mongoStatus,
          database: mongoose.connection.name,
          host: mongoose.connection.host
        },
        email: {
          status: emailStatus,
          user: 'nucleasitsolutions@gmail.com'
        },
        sms: {
          status: smsStatus,
          gateway: 'SMS-Gate.app',
          phoneNumber: '+917905354305'
        }
      },
      server: {
        uptime: `${Math.floor(uptime)} seconds`,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        },
        environment: process.env.NODE_ENV || 'production',
        port: process.env.PORT || 3000
      }
    });
  } catch (error) {
    console.error('Error checking server status:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// CORS error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    console.error('CORS Error:', {
      origin: req.headers.origin,
      method: req.method,
      path: req.path
    });
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Access to this resource is not allowed from your origin',
      origin: req.headers.origin
    });
  }
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.url);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.url} was not found on this server.`
  });
});

// Start server only if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;