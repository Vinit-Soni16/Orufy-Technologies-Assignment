import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { API_BASE } from '../config';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());
  const isPhone = (s) => {
    const d = (s || '').replace(/\D/g, '');
    return d.length >= 10 && d.length <= 15;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailTrim = email.trim();
    const phoneTrim = phone.trim();
    if (!emailTrim && !phoneTrim) {
      setError('Please enter email or phone number.');
      return;
    }
    if (emailTrim && !isEmail(emailTrim)) {
      setError('Please enter a valid email.');
      return;
    }
    if (phoneTrim && !isPhone(phoneTrim)) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!password || password.length < 1) {
      setError('Please enter a password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTrim || undefined,
          phone: phoneTrim || undefined,
          password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) login({ ...data.user, token: data.token });
        navigate('/dashboard');
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row rounded-lg overflow-hidden">
      <div className="w-full lg:flex lg:w-1/2 relative overflow-hidden flex-shrink-0">
        <div className="flex-1 flex items-center bg-[#fafbfd] justify-center">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src="/Images/Frame%202.WebP"
              alt="Uplist your product"
              loading="lazy"
              className="max-w-full w-auto h-auto object-contain"
            />
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#fafbfd] p-6 sm:p-10">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-[600] text-[#1A2B6D] mb-8 text-center">
            Sign up to your Productr Account
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="signup-email"
                type="text"
                placeholder="Enter email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1A2B6D] focus:border-[#1A2B6D] bg-white"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone (optional)
              </label>
              <input
                id="signup-phone"
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1A2B6D] focus:border-[#1A2B6D] bg-white"
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="Enter password (anything you like)"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1A2B6D] focus:border-[#1A2B6D] bg-white"
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1A2B6D] text-white font-semibold rounded-lg hover:bg-[#152a5a] transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white/50">
              <p className="text-center text-gray-500 text-sm">
                Already have a Productr Account?{' '}
                <Link to="/login" className="text-[#1A2B6D] font-semibold hover:underline">
                  Login Here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
