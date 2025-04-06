const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

// Create a new booking
router.post('/', async (req, res) => {
  try {
    // Create new booking in MongoDB
    const booking = new Booking(req.body);
    await booking.save();

    // Send SMS notification with booking details
    const smsMessage = `New Booking: From ${booking.from} to ${booking.to}, Date: ${new Date(booking.date).toLocaleDateString()}, Passengers: ${booking.passengers}, Phone: ${booking.phoneNumber}`;
    await sendSMS(smsMessage);

    // Send email notification to admin with beautiful template
    await sendEmail({
      to: ['vivekdixit48313@gmail.com'],
      subject: `New Booking from ${booking.from}`,
      templateData: {
        title: 'New Booking Received',
        greeting: 'Hello Admin!',
        content: `
          <p>A new booking has been received:</p>
          <div class="highlight">
            <p><strong>From:</strong> ${booking.from}</p>
            <p><strong>To:</strong> ${booking.to}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(booking.date).toLocaleTimeString()}</p>
            <p><strong>Passengers:</strong> ${booking.passengers}</p>
            <p><strong>Car Type:</strong> ${booking.carType}</p>
            <p><strong>Phone Number:</strong> ${booking.phoneNumber}</p>
          </div>
          <p>This booking has been automatically saved to our database.</p>
        `,
        buttonText: 'View All Bookings',
        buttonLink: 'https://trsv.vercel.app/admin/bookings'
      }
    });

    res.status(201).json({ 
      success: true, 
      data: booking,
      message: 'Booking saved successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router; 