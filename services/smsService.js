const axios = require('axios');

const SMS_API_URL = 'https://api.sms-gate.app/3rdparty/v1/message';
const SMS_USERNAME = 'CRVBJX';
const SMS_PASSWORD = 'l2tzqzjcuqjsbf';

const sendSMS = async (message) => {
  try {
    if (!message) {
      console.error('Message is required');
      return false;
    }

    console.log('Sending SMS to admin...');
    console.log('Message:', message);

    const response = await axios({
      method: 'post',
      url: SMS_API_URL,
      data: {
        message: message,
        phoneNumbers: ['+918726257552']
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
      console.log('SMS sent successfully:', response.data);
      return true;
    } else {
      console.error('SMS API returned non-200 status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    if (error.response) {
      console.error('SMS API Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('SMS API No Response Received');
    }
    return false;
  }
};

module.exports = { sendSMS }; 