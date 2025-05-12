const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Middleware to handle CORS preflight
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://www.uttarakhandroadtrips.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Get all feedbacks with their status
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .select('_id name email phone rating message status createdAt')
      .sort({ createdAt: -1 });

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'https://www.uttarakhandroadtrips.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

// Update feedback status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'https://www.uttarakhandroadtrips.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

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

module.exports = router; 