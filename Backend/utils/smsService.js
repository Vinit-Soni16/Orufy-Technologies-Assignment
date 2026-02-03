function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  try {
    const twilio = require('twilio');
    return twilio(accountSid, authToken);
  } catch (e) {
    return null;
  }
}

function toE164(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '+91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  if (digits.length >= 10 && digits.length <= 15) return '+91' + digits.slice(-10);
  return '';
}

async function sendOTPSMS(phoneNumber, otp) {
  const to = toE164(phoneNumber);
  if (!to || to.length < 10) {
    return { sent: false, error: 'Invalid phone number.' };
  }
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!client || !from) {
    return { sent: false, error: 'SMS not configured. Add TWILIO_* in .env', devOtp: otp };
  }
  try {
    await client.messages.create({
      body: `Your Productr OTP is: ${otp}. Valid for 10 minutes. Do not share.`,
      from,
      to,
    });
    return { sent: true };
  } catch (err) {
    console.error('[SMS] Send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendOTPSMS, toE164 };
