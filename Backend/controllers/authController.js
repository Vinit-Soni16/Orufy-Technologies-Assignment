const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
const { sendOTPSMS } = require('../utils/smsService');

/* -------------------- HELPERS -------------------- */

const generateOTP = () =>
  Math.floor(10000 + Math.random() * 90000).toString();

function isEmail(str) {
  return typeof str === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

function isPhone(str) {
  if (typeof str !== 'string') return false;
  const digits = str.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function normalizePhone(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/\s/g, '');
}

async function findUserByIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return null;
  const trimmed = identifier.trim();

  if (isEmail(trimmed)) {
    return User.findOne({ email: trimmed.toLowerCase() });
  }

  if (isPhone(trimmed)) {
    return User.findOne({ phone: normalizePhone(trimmed) });
  }

  return null;
}

/* -------------------- SIGNUP -------------------- */

exports.signup = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email or phone number.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a password.',
      });
    }

    if (email && !isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email.',
      });
    }

    if (phone && !isPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.',
      });
    }

    if (email && (await User.findOne({ email: email.toLowerCase() }))) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    if (phone && (await User.findOne({ phone: normalizePhone(phone) }))) {
      return res.status(400).json({
        success: false,
        message: 'An account with this phone already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email ? email.toLowerCase() : undefined,
      phone: phone ? normalizePhone(phone) : undefined,
      password: hashedPassword,
      isVerified: true,
    });

    if (email) {
      sendWelcomeEmail(email.toLowerCase()).catch(() => {});
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created. You can now login.',
      user: { email: user.email, phone: user.phone },
      token,
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/* -------------------- SEND LOGIN OTP -------------------- */

exports.sendLoginOTP = async (req, res) => {
  try {
    const identifier =
      req.body?.email ?? req.body?.phone ?? req.body?.identifier;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email or phone number.',
      });
    }

    if (!isEmail(identifier) && !isPhone(identifier)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email or phone number.',
      });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found. Please sign up first.',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    /* -------- EMAIL OTP -------- */
    if (isEmail(identifier)) {
      const result = await sendOTPEmail(user.email, otp);

      if (!result.sent) {
        console.error('Email OTP failed:', result.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please try again.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please check inbox or spam.',
      });
    }

    /* -------- SMS OTP (OPTIONAL) -------- */
    if (isPhone(identifier)) {
      const result = await sendOTPSMS(identifier, otp);

      if (!result.sent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP SMS.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your phone.',
      });
    }
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/* -------------------- VERIFY OTP -------------------- */

exports.verifyLoginOTP = async (req, res) => {
  try {
    const identifier =
      req.body?.email ?? req.body?.phone ?? req.body?.identifier;
    const otp = req.body?.otp;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email/phone and OTP are required.',
      });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user || user.otp !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: { email: user.email, phone: user.phone },
      token,
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/* -------------------- RESEND OTP -------------------- */

exports.resendOTP = async (req, res) => {
  try {
    const identifier =
      req.body?.email ?? req.body?.phone ?? req.body?.identifier;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email or phone number.',
      });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found.',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    if (isEmail(identifier)) {
      const result = await sendOTPEmail(user.email, otp);

      if (!result.sent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to resend OTP email.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'OTP resent to your email.',
      });
    }

    if (isPhone(identifier)) {
      const result = await sendOTPSMS(identifier, otp);

      if (!result.sent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to resend OTP SMS.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'OTP resent to your phone.',
      });
    }
  } catch (err) {
    console.error('Resend OTP Error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
