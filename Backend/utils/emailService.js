const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.GMAIL_USER;
  // FIX: Stripe spaces from password if present
  const pass = process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') : '';

  if (!user || !pass) return null;

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: { user, pass },
    // Fail fast if connection hangs
    connectionTimeout: 30000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    debug: true,
     logger: true,
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
    // If no credentials, we return error so frontend knows
    return { sent: false, error: "Email service not configured (Check GMAIL_USER/PASS)" };
  }

  try {
    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: 'Your Productr OTP',
      text: `Your One-Time Password (OTP) is: ${otp}. Valid for 10 minutes.`,
      html: `<p>Your One-Time Password (OTP) is: <strong>${otp}</strong>.</p><p>Valid for 10 minutes.</p>`,
    });
    return { sent: true };
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

async function sendWelcomeEmail(toEmail) {
  const transport = getTransporter();
  if (!transport) return { sent: false, error: "No Transport" };

  try {
    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject: 'Welcome to Productr',
      text: 'Your Productr account has been created.',
      html: '<p>Your Productr account has been created.</p>',
    });
    return { sent: true };
  } catch (err) {
    console.error('[Email] Welcome send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendOTPEmail, sendWelcomeEmail };
