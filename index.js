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

// CORS Configuration
const corsOptions = {
  origin: [
    'http:/localhost:8080',
    'http:/localhost:5173',
    'https:/trsv.vercel.app',
    'https:/trsvbackend.vercel.app'
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

// Handle preflight requests
app.options('*', cors(corsOptions));

// MongoDB Connection
const connectDB = async () => {
  try {
    const MONGODB_URI = 'mongodb+srv://vivekdixit48313:UaSonIQubZp55sPQ@travel.yu4rxyc.mongodb.net/Uttrakhand_booking_services?retryWrites=true&w=majority&appName=travel';
    
    const conn = await mongoose.connect(MONGODB_URI, {
      retryWrites: true,
      w: 'majority'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
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
      const smsResult = await sendSMS('Test SMS to verify SMS service is working.');
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
          phoneNumber: '+918726257552'
        }
      },
      server: {
        uptime: `${Math.floor(uptime)} seconds`,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        },
        environment: 'production',
        port: 3000
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

// Export the Express app for Vercel
module.exports = app;