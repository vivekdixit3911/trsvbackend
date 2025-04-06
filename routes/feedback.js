const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { sendEmail } = require('../services/emailService');

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, rating, message } = req.body;

    // Create new feedback
    const feedback = new Feedback({
      name,
      email,
      phone,
      rating,
      message
    });

    // Save feedback
    await feedback.save();

    // Send notification email to admin with beautiful template
    await sendEmail({
      to: 'nucleasitsolutions@gmail.com',
      subject: 'New Feedback Received',
      templateData: {
        title: 'New Feedback Received',
        greeting: 'Hello Admin!',
        content: `
          <p>A new feedback has been received from a customer:</p>
          <div class="highlight">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Rating:</strong> ${rating}/5</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          <p>You can view all feedback in the admin dashboard.</p>
        `,
        buttonText: 'View All Feedback',
        buttonLink: 'https://trsv.vercel.app/admin/feedback'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// Get all feedback (admin only)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
});

// Update feedback status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback status',
      error: error.message
    });
  }
});

// Delete feedback (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
});

module.exports = router; 