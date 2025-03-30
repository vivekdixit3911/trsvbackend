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

    // Create a detailed email HTML template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">New Booking Details</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Booking Information</h3>
          <p><strong>From:</strong> ${booking.from}</p>
          <p><strong>To:</strong> ${booking.to}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(booking.date).toLocaleTimeString()}</p>
          <p><strong>Passengers:</strong> ${booking.passengers}</p>
          <p><strong>Car Type:</strong> ${booking.carType}</p>
          <p><strong>Phone Number:</strong> ${booking.phoneNumber}</p>
        </div>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; color: #2c3e50;">This booking has been automatically saved to our database.</p>
        </div>
      </div>
    `;

    // Send email notification to admin
    await sendEmail({
      to: ['vivekdixit48313@gmail.com', 'priyamajhwar9648@gmail.com'],
      subject: `New Booking from ${booking.from}`,
      html: emailHtml
    });

    // Send confirmation email to the customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Booking Confirmation</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Your Booking Details</h3>
          <p><strong>From:</strong> ${booking.from}</p>
          <p><strong>To:</strong> ${booking.to}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(booking.date).toLocaleTimeString()}</p>
          <p><strong>Passengers:</strong> ${booking.passengers}</p>
          <p><strong>Car Type:</strong> ${booking.carType}</p>
        </div>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; color: #2c3e50;">Thank you for choosing our service. We will contact you shortly to confirm your booking.</p>
        </div>
      </div>
    `;

    // Send confirmation email to the customer
    await sendEmail({
      to: booking.email || 'vivekdixit48313@gmail.com',
      subject: 'Booking Confirmation - Uttarakhand Travel Services',
      html: customerEmailHtml
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

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 