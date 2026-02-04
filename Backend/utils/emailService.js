const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') : '';
  if (!user || !pass) return null;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    // Fail fast if connection hangs (common in free hosting)
   connectionTimeout: 10000,
greetingTimeout: 10000,
socketTimeout: 20000,

  });
  return transporter;
}

async function sendOTPEmail(toEmail, otp) {
  const to = typeof toEmail === 'string' ? toEmail.trim().toLowerCase() : '';
  if (!to) {
    return { sent: false, error: 'Invalid email address.' };
  }
  const transport = getTransporter();
  if (!transport) {
  return { sent: false, error: "Email service not configured" };
}

  try {
    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: 'Your Productr OTP',
      text: `Your One-Time Password (OTP) is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      html: `<p>Your One-Time Password (OTP) is: <strong>${otp}</strong>.</p><p>Valid for 10 minutes. Do not share with anyone.</p>`,
    });
    return { sent: true };
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

async function sendWelcomeEmail(toEmail) {
  const transport = getTransporter();
  if (!transport) return { sent: false, dev: true };
  try {
    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject: 'Welcome to Productr',
      text: 'Your Productr account has been created. You can login with your email or phone number; we will send you an OTP to verify.',
      html: '<p>Your Productr account has been created.</p><p>You can login with your email or phone number; we will send you an OTP to verify.</p>',
    });
    return { sent: true };
  } catch (err) {
    console.error('[Email] Welcome send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendOTPEmail, sendWelcomeEmail };
