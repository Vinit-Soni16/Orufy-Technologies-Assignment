const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.error("[Email] SMTP env variables missing");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: false, // TLS (587)
    auth: {
      user,
      pass,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
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
      from: `"Productr OTP" <${process.env.SMTP_FROM}>`, // VERIFIED SENDER
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
    await transport.sendMail({
      from: `"Productr" <${process.env.SMTP_FROM}>`,
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
