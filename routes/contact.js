const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendEmail } = require('../services/emailService');

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Create new contact submission
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    // Save contact submission
    await contact.save();

    // Send notification email to admin with beautiful template
    await sendEmail({
      to: 'nucleasitsolutions@gmail.com',
      subject: 'New Contact Form Submission',
      templateData: {
        title: 'New Contact Form Submission',
        greeting: 'Hello Admin!',
        content: `
          <p>A new contact form submission has been received:</p>
          <div class="highlight">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          <p>You can view all contact submissions in the admin dashboard.</p>
        `,
        // buttonText: 'View All Contact Submissions',
        // buttonLink: 'https://trsv.vercel.app/admin/contact'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form',
      error: error.message
    });
  }
});

// Get all contact submissions (admin only)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact submissions',
      error: error.message
    });
  }
});

// Update contact submission status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact submission status updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact submission status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact submission status',
      error: error.message
    });
  }
});

// Delete contact submission (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact submission',
      error: error.message
    });
  }
});

module.exports = router; 