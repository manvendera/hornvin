/**
 * Utility to send SMS via external gateways (Twilio, Fast2SMS, MSG91)
 */

const sendSMS = async (phoneNumber, message) => {
  try {
    // -------------------------------------------------------------------------
    // MOCK IMPLEMENTATION (Console Log)
    // -------------------------------------------------------------------------
    console.log(`\n📱 [SMS SERVICE] Sending to ${phoneNumber}:`);
    console.log(`   Message: "${message}"`);
    console.log(`   Timestamp: ${new Date().toISOString()}\n`);

    // -------------------------------------------------------------------------
    // EXAMPLE: TWILIO IMPLEMENTATION (Uncomment and add credentials in .env)
    // -------------------------------------------------------------------------
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    */

    // -------------------------------------------------------------------------
    // EXAMPLE: FAST2SMS IMPLEMENTATION (India)
    // -------------------------------------------------------------------------
    /*
    const axios = require('axios');
    await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'otp',
      variables_values: message.match(/\d+/)[0], // extract OTP
      numbers: phoneNumber
    }, {
      headers: { 'authorization': process.env.FAST2SMS_API_KEY }
    });
    */

    return { success: true };
  } catch (error) {
    console.error(`❌ SMS Send Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP for Phone Verification
 */
const sendPhoneOTP = async (phoneNumber, otp) => {
  const message = `Your Hornvin verification code is: ${otp}. It expires in 5 minutes.`;
  return await sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendPhoneOTP
};
