const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTPEmail(toEmail, otp) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: toEmail,
      subject: "Your Productr OTP",
      html: `<p>Your OTP is <strong>${otp}</strong></p>`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[Email] Resend failed:", err.message);
    return { sent: false, error: err.message };
  }
}

async function sendWelcomeEmail(toEmail) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: toEmail,
      subject: "Welcome to Productr",
      html: `<p>Your Productr account has been created.</p>`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[Email] Welcome failed:", err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendOTPEmail, sendWelcomeEmail };
