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
      to: ['sachinkumat1988@gmail.com', 'uttrakhandroadtrip@gmail.com'],
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

    // Send confirmation email to the customer with beautiful template
    await sendEmail({
      to: booking.email || 'vivekdixit48313@gmail.com',
      subject: 'Booking Confirmation - Uttarakhand Travel Services',
      templateData: {
        title: 'Booking Confirmation',
        greeting: `Hello ${booking.name || 'Valued Customer'}!`,
        content: `
          <p>Thank you for choosing Uttarakhand Travel Services. Your booking has been confirmed!</p>
          <div class="highlight">
            <p><strong>From:</strong> ${booking.from}</p>
            <p><strong>To:</strong> ${booking.to}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(booking.date).toLocaleTimeString()}</p>
            <p><strong>Passengers:</strong> ${booking.passengers}</p>
            <p><strong>Car Type:</strong> ${booking.carType}</p>
          </div>
          <p>Our team will contact you shortly to confirm your booking details.</p>
          <p>If you have any questions, please don't hesitate to contact us at +91 7905354305.</p>
        `,
        buttonText: 'View Booking Details',
        buttonLink: 'https://trsv.vercel.app/booking-details'
      }
    });

    res.status(201).json({ 
      success: true, 
      data: booking,
      message: 'Booking saved and confirmation emails sent successfully'
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