import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { API_BASE } from '../config';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']); // 5 boxes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState('');

  const otpInputRefs = React.useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setError('');
    if (!email.trim()) {
      setEmailError('Please enter your email or phone number.');
      return;
    }
    // Allow email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhone = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(email.replace(/\s/g, ''));
    if (!isEmail && !isPhone) {
      setEmailError('Please enter a valid email or phone number.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      let data;
      try {
        data = await res.json();
      } catch (_) {
        setEmailError('Server error. Is Backend running? Start it: npm run dev in Backend folder.');
        setLoading(false);
        return;
      }
      if (data.success) {
        setStep('otp');
        setOtp(['', '', '', '', '']);
        setResendTimer(20);
        if (data.devOtp) {
          setDevOtp(data.devOtp);
          const digits = String(data.devOtp).split('').slice(0, 5);
          setOtp(digits.concat(Array(5 - digits.length).fill('')));
        } else {
          setDevOtp('');
        }
        setEmailError('');
      } else {
        setEmailError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setEmailError('Backend is not running. Start it: open Backend folder and run npm run dev');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');
    if (value && index < 4) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    const next = [...otp];
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setOtp(next);
    setError('');
    const focusIdx = Math.min(pasted.length, 4);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    setError('');
    if (otpStr.length !== 5) {
      setError('Please Enter Valid OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpStr }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) login(data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Please Enter Valid OTP');
      }
    } catch (err) {
      setError('Please Enter Valid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setOtp(['', '', '', '', '']);
        setResendTimer(20);
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row rounded-lg overflow-hidden">
      {/* Left panel - Branding */}
      <div className="w-full lg:flex lg:w-1/2 relative overflow-hidden flex-shrink-0">
        {/* Abstract wavy background pattern */}
       
         
          {/* Central Image Card */}
          <div className="flex-1 flex items-center bg-[#fafbfd] justify-center">
              <div className="relative rounded-xl overflow-hidden ">
                <img
                  src="/Images/Frame%202.WebP"
                  alt="Uplist your product"
                  loading="lazy"
                  className="max-w-full w-auto h-auto object-contain"
                />
                
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#fafbfd] p-6 sm:p-10">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-[600] text-[#1A2B6D] mb-8 text-center">
            Login to your Productr Account
          </h1>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone number
                </label>
                <input
                  id="email"
                  type="text"
                  placeholder="Enter email or phone number"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors bg-white ${
                    emailError ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-[#1A2B6D] focus:border-[#1A2B6D]'
                  }`}
                  autoComplete="email"
                />
                {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1A2B6D] text-white font-semibold rounded-lg hover:bg-[#152a5a] transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Login'}
              </button>
              {/* Dashed border signup box */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white/50 mt-28">
                <p className="text-center text-gray-500 text-sm">
                  Don&apos;t have a Productr Account{' '}
                  <Link to="/signup" className="text-[#1A2B6D] font-semibold hover:underline">
                    SignUp Here
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <p className="text-gray-600 text-sm font-medium">Enter OTP</p>
              {devOtp && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                  Email not configured. Use this OTP: <strong>{devOtp}</strong>
                </p>
              )}
              <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-14 h-14 text-center text-xl font-semibold border rounded-lg outline-none transition-colors bg-white ${
                      error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-[#1A2B6D] focus:border-[#1A2B6D]'
                    }`}
                  />
                ))}
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1A2B6D] text-white font-semibold rounded-lg hover:bg-[#152a5a] transition-colors disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Enter your OTP'}
              </button>
              <p className="text-center text-gray-600 text-sm">
                Didn&apos;t receive OTP?{' '}
                {resendTimer > 0 ? (
                  <span className="text-[#FF6B6B] font-medium">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#FF6B6B] font-medium hover:underline disabled:opacity-60"
                  >
                    Resend OTP
                  </button>
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
