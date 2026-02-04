const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error("[Email] GMAIL env variables missing");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail', // Built-in transport for Gmail
    auth: {
      user,
      pass,
    },
    // disable transporter debug/logger for quieter server output
  });

  return transporter;
}

/* ---------------- OTP EMAIL ---------------- */
async function sendOTPEmail(toEmail, otp) {
  const to = typeof toEmail === "string" ? toEmail.trim().toLowerCase() : "";
  if (!to) {
    return { sent: false, error: "Invalid email address" };
  }

  const transport = getTransporter();
  if (!transport) {
    return { sent: false, error: "Email service not configured" };
  }

  try {
    await transport.sendMail({
      from: `"Productr OTP" <${process.env.GMAIL_USER}>`, // VERIFIED SENDER
      to,
      subject: "Your Productr Login OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Your Login OTP</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
          <p>Please do not share it with anyone.</p>
        </div>
      `,
    });

    return { sent: true };
  } catch (err) {
    console.error("[Email] OTP send failed:", err.message);
    return { sent: false, error: err.message };
  }
}

/* ---------------- WELCOME EMAIL ---------------- */
async function sendWelcomeEmail(toEmail) {
  const to = typeof toEmail === "string" ? toEmail.trim().toLowerCase() : "";
  if (!to) return { sent: false, error: "Invalid email" };

  const transport = getTransporter();
  if (!transport) {
    return { sent: false, error: "Email service not configured" };
  }

  try {
    const fromAddress = process.env.SMTP_FROM || process.env.GMAIL_USER || '';
    await transport.sendMail({
      from: `"Productr" <${fromAddress}>`,
      to,
      subject: "Welcome to Productr 🎉",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to Productr</h2>
          <p>Your account has been created successfully.</p>
          <p>You can now log in using OTP.</p>
        </div>
      `,
    });

    return { sent: true };
  } catch (err) {
    console.error("[Email] Welcome send failed:", err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
};
