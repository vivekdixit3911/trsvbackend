const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  from: {
    type: String,
    required: [true, 'Pickup location is required']
  },
  to: {
    type: String,
    required: [true, 'Drop-off location is required']
  },
  date: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  passengers: {
    type: Number,
    required: [true, 'Number of passengers is required'],
    min: 1,
    max: 20
  },
  carType: {
    type: String,
    required: [true, 'Car type is required'],
    enum: ['Sedan', 'SUV', 'Tempo', 'Bus'],
    message: 'Please select a valid car type'
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    default: 'vivekdixit48313@gmail.com'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema); 