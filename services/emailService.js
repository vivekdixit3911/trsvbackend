const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: 'nucleasitsolutions@gmail.com',
    pass: 'zecklnnfpdqbwsgh'
  },
  tls: {
    rejectUnauthorized: false // Required for some environments
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email service configuration error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Ensure 'to' is always an array
    const recipients = Array.isArray(to) ? to : [to];

    // Send email to each recipient
    const emailPromises = recipients.map(async (recipient) => {
      const mailOptions = {
        from: '"Uttarakhand Travel Services" <nucleasitsolutions@gmail.com>',
        to: recipient,
        subject: subject,
        text: text,
        html: html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent to:', recipient, 'Message ID:', info.messageId);
      return info;
    });

    const results = await Promise.all(emailPromises);
    return { success: true, results };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { sendEmail }; 