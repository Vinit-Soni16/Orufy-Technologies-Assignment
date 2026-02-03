const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login/send-otp', authController.sendLoginOTP);
router.post('/login/verify-otp', authController.verifyLoginOTP);
router.post('/resend-otp', authController.resendOTP);

module.exports = router;
