const axios = require('axios');

const SMS_API_URL = process.env.SMS_API_URL || 'https://api.sms-gate.app/3rdparty/v1/message';
const SMS_USERNAME = process.env.SMS_USERNAME || 'CRVBJX';
const SMS_PASSWORD = process.env.SMS_PASSWORD || 'l2tzqzjcuqjsbf';
const ADMIN_PHONE = '+917905354305';

// Log that SMS service is active
console.log('🚀 SMS Service is active and ready to send messages');
console.log('📱 SMS Gateway URL:', SMS_API_URL);
console.log('🔑 SMS Service configured with username:', SMS_USERNAME);
console.log('📞 SMS will be sent to:', ADMIN_PHONE);

const sendSMS = async (message) => {
  try {
    if (!message) {
      console.error('❌ Message is required for SMS service');
      return false;
    }

    console.log('📤 Attempting to send SMS to admin...');
    console.log('📝 Message content:', message);

    const response = await axios({
      method: 'post',
      url: SMS_API_URL,
      data: {
        message: message,
        phoneNumbers: [ADMIN_PHONE]
      },
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: SMS_USERNAME,
        password: SMS_PASSWORD
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.status === 200 || response.status === 201) {
      console.log('✅ SMS sent successfully:', response.data);
      return true;
    } else {
      console.error('❌ SMS API returned non-200 status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    if (error.response) {
      console.error('❌ SMS API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('❌ SMS API No Response Received');
      console.error('Request details:', {
        url: SMS_API_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    return false;
  }
};

module.exports = { sendSMS }; 