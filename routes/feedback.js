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

// Get all feedbacks
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all feedbacks...');
    const feedbacks = await Feedback.find()
      .select('_id name email phone rating message status createdAt')
      .sort({ createdAt: -1 });

    console.log(`Found ${feedbacks.length} feedbacks`);

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

// Get single feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// Update feedback status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating feedback ${id} status to ${status}`);

    // Validate status
    if (!['approved', 'not_approved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be approved or not_approved'
      });
    }

    // Check if trying to approve and count approved feedbacks
    if (status === 'approved') {
      const approvedCount = await Feedback.countDocuments({ status: 'approved' });
      console.log(`Current approved count: ${approvedCount}`);
      if (approvedCount >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum of 3 approved feedbacks allowed'
        });
      }
    }

    // Find and update feedback
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      console.log(`Feedback not found with id: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    console.log(`Successfully updated feedback ${id} status to ${status}`);

    res.status(200).json({
      success: true,
      message: `Feedback ${status === 'approved' ? 'approved' : 'not approved'} successfully`,
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

// Get approved feedbacks (for public display)
router.get('/approved', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ status: 'approved' })
      .select('_id name rating message createdAt')
      .sort({ createdAt: -1 })
      .limit(3);

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'https://www.uttarakhandroadtrips.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching approved feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approved feedbacks',
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