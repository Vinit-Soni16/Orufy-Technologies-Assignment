const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    default: null,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: null,
    trim: true,
    index: { unique: true, sparse: true },
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty'],
    select: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
    // index: { expireAfterSeconds: 0 }  <-- REMOVED: This deletes the USER! 
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('User', userSchema);