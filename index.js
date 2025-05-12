const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Import services
const Booking = require('./models/Booking');
const bookingsRouter = require('./routes/bookings');
const feedbackRouter = require('./routes/feedback');
const contactRouter = require('./routes/contact');
// const reviewsRouter = require('./routes/reviews');

// Import photo routes
const photoRoutes = require('./routes/photos');

const app = express();

// Log environment
console.log('🚀 Starting server in environment:', process.env.NODE_ENV || 'development');

// CORS Configuration
const corsOptions = {
  origin: ['https://www.uttarakhandroadtrips.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Apply other middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

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

// Routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/contact', contactRouter);
// app.use('/api/reviews', reviewsRouter);

// Add photo routes
app.use('/api/photos', photoRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
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