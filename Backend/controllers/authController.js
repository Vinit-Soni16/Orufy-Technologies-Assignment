const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
const { sendOTPSMS } = require('../utils/smsService');

const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

function isEmail(str) {
  return typeof str === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

function isPhone(str) {
  if (typeof str !== 'string') return false;
  const digits = str.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function normalizeEmail(str) {
  if (!str || typeof str !== 'string') return '';
  const t = str.trim();
  return isEmail(t) ? t.toLowerCase() : '';
}

function normalizePhone(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/\s/g, '');
}

async function findUserByIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return null;
  const trimmed = identifier.trim();
  if (isEmail(trimmed)) {
    const lower = trimmed.toLowerCase();
    return await User.findOne({ email: lower });
  }
  if (isPhone(trimmed)) {
    const phoneNorm = normalizePhone(trimmed);
    return await User.findOne({ phone: phoneNorm });
  }
  return null;
}

// POST /api/signup - Email/phone + password, no OTP. Welcome email. Dashboard.
exports.signup = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const emailStr = typeof email === 'string' ? email.trim() : '';
    const phoneStr = typeof phone === 'string' ? phone.trim() : '';
    const passwordStr = typeof password === 'string' ? password : '';

    if (!emailStr && !phoneStr) {
      return res.status(400).json({ success: false, message: 'Please enter email or phone number.' });
    }
    if (!passwordStr || passwordStr.length < 1) {
      return res.status(400).json({ success: false, message: 'Please enter a password.' });
    }
    if (emailStr && !isEmail(emailStr)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
    }
    if (phoneStr && !isPhone(phoneStr)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    const emailNorm = emailStr ? emailStr.toLowerCase() : null;
    const phoneNorm = phoneStr ? normalizePhone(phoneStr) : null;

    if (emailNorm) {
      const existing = await User.findOne({ email: emailNorm });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login.' });
      }
    }
    if (phoneNorm) {
      const existing = await User.findOne({ phone: phoneNorm });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this phone already exists. Please login.' });
      }
    }

    const hashedPassword = await bcrypt.hash(passwordStr, 10);
    const user = await User.create({
      email: emailNorm || undefined,
      // Fix: Ensure we send undefined (not null) if phone is empty, to avoid unique index issues
      phone: phoneNorm || undefined,
      password: hashedPassword,
      isVerified: true,
    });

    const sendTo = emailNorm;
    if (sendTo && isEmail(sendTo)) {
      sendWelcomeEmail(sendTo).catch(err => console.error('[Auth] Welcome email error:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Account created. You can now login.',
      user: { email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// POST /api/login/send-otp - Email → OTP to inbox; Phone → OTP via SMS
exports.sendLoginOTP = async (req, res) => {
  try {
    const raw = req.body && (req.body.email ?? req.body.phone ?? req.body.identifier);
    const identifier = typeof raw === 'string' ? String(raw).trim() : '';
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please enter the email or phone number you used at signup.' });
    }
    if (!isEmail(identifier) && !isPhone(identifier)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email (e.g. you@mail.com) or 10-digit phone number.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email/phone. Please sign up first.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.updatedAt = new Date();
    await user.save();

    if (isEmail(identifier)) {
      const sendToEmail = user.email && isEmail(user.email) ? user.email.trim().toLowerCase() : null;
      if (!sendToEmail) {
        return res.status(400).json({
          success: false,
          message: 'We need your email to send OTP. Please sign up with email.',
        });
      }
      const result = await sendOTPEmail(sendToEmail, otp);
      const { sent, error, devOtp } = result;
      if (sent === false && error) {
        console.error('Email send failed:', error);
        return res.status(500).json({
          success: false,
          message: `Email Error: ${error} (Check Render Logs for details)`,
        });
      }
      if (sent) {
        return res.status(200).json({ success: true, message: 'OTP sent to your email. Check inbox (and spam).' });
      }
      return res.status(500).json({
        success: false,
        message: 'Email service not configured correctly.',
      });
    }

    if (isPhone(identifier)) {
      const result = await sendOTPSMS(identifier, otp);
      const { sent, error, devOtp } = result;
      if (sent === false && error && !devOtp) {
        console.error('SMS send failed (Dev Mode fallback):', error);
        return res.status(200).json({
          success: true,
          message: `SMS Failed (${error}). Dev Mode: OTP is ${otp}`,
          devOtp: otp,
        });
      }
      if (sent) {
        return res.status(200).json({ success: true, message: 'OTP sent to your phone (SMS).' });
      }
      return res.status(200).json({
        success: true,
        message: 'SMS Not Configured? (Dev Mode): OTP is ' + otp,
        devOtp: otp,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid input.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/login/verify-otp
exports.verifyLoginOTP = async (req, res) => {
  try {
    const raw = req.body && (req.body.email ?? req.body.phone ?? req.body.identifier);
    const identifier = typeof raw === 'string' ? String(raw).trim() : '';
    const otp = req.body && (req.body.otp ?? req.body.otpCode);
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Email/phone and OTP are required.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (!user.otp || user.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Please Enter Valid OTP' });
    }
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: { email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const raw = req.body && (req.body.email ?? req.body.phone ?? req.body.identifier);
    const identifier = typeof raw === 'string' ? String(raw).trim() : '';
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please enter your email or phone number.' });
    }
    if (!isEmail(identifier) && !isPhone(identifier)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email or phone number.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found. Please sign up.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.updatedAt = new Date();
    await user.save();

    if (isEmail(identifier)) {
      const sendToEmail = user.email && isEmail(user.email) ? user.email.trim().toLowerCase() : null;
      if (!sendToEmail) {
        return res.status(400).json({ success: false, message: 'We need your email to send OTP.' });
      }
      const result = await sendOTPEmail(sendToEmail, otp);
      const { sent, error, devOtp } = result;
      if (sent === false && error) {
        if (sent === false && error) {
          console.error('Email send failed (Strict Mode):', error);
          return res.status(500).json({
            success: false,
            message: 'Unable to send OTP email. Please contact support.'
          });
        }
      }
      if (sent) {
        return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
      }
      return res.status(503).json({
        success: false,
        message: 'Add GMAIL_USER and GMAIL_APP_PASSWORD in Backend .env so OTP reaches your email.',
      });
    }

    if (isPhone(identifier)) {
      const result = await sendOTPSMS(identifier, otp);
      const { sent, error } = result;
      if (sent === false && error) {
        console.error('SMS send failed (Dev Mode fallback):', error);
        return res.status(200).json({
          success: true,
          message: `SMS Failed (${error}). Dev Mode: OTP is ${otp}`,
          devOtp: otp,
        });
      }
      if (sent) {
        return res.status(200).json({ success: true, message: 'OTP sent to your phone.' });
      }
      return res.status(503).json({
        success: false,
        message: 'Add TWILIO_* in Backend .env so OTP reaches your phone (SMS).',
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid input.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
