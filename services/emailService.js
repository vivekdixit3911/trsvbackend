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

// Create a beautiful HTML email template
const createEmailTemplate = (data) => {
  const { title, greeting, content, footer, buttonText, buttonLink } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || 'Uttarakhand Road Trips'}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .company-name {
          color: #22c55e;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .content {
          background-color: white;
          padding: 30px 20px;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #1e40af;
        }
        .message {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 14px;
          color: #666;
        }
        .footer p {
          margin: 5px 0;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 15px;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 20px 0;
        }
        .highlight {
          background-color: #f0f9ff;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .header {
            padding: 20px 15px;
          }
          .content {
            padding: 20px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-name">Uttarakhand Road Trips</div>
          <h1>${title || 'Uttarakhand Road Trips'}</h1>
        </div>
        <div class="content">
          <div class="greeting">${greeting || 'Hello!'}</div>
          <div class="message">
            ${content || ''}
          </div>
          ${buttonText && buttonLink ? `
            <div style="text-align: center;">
              <a href="${buttonLink}" class="button">${buttonText}</a>
            </div>
          ` : ''}
          <div class="divider"></div>
          <div class="footer">
            <p>Thank you for choosing Uttarakhand Road Trips</p>
            <p>For any queries, please contact us at +91 9454534818</p>
            <p>© ${new Date().getFullYear()} Uttarakhand Road Trips. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async ({ to, subject, text, html, templateData }) => {
  try {
    // Ensure 'to' is always an array
    const recipients = Array.isArray(to) ? to : [to];
    
    // Use template if templateData is provided
    const emailHtml = templateData ? createEmailTemplate(templateData) : html;

    // Add a unique identifier to the subject to prevent threading
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const uniqueSubject = `[${uniqueId}] ${subject}`;

    // Send email to each recipient
    const emailPromises = recipients.map(async (recipient) => {
      const mailOptions = {
        from: '"Uttarakhand Road Trips" <nucleasitsolutions@gmail.com>',
        to: recipient,
        subject: uniqueSubject,
        text: text,
        html: emailHtml,
        headers: {
          'X-Entity-Ref-ID': uniqueId,
          'In-Reply-To': uniqueId,
          'References': uniqueId
        }
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

module.exports = { sendEmail, createEmailTemplate }; 