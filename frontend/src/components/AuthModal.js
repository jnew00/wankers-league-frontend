import React, { useState } from 'react';
import { useAuth } from '../context/UnifiedAuthContext';
import { API_BASE_URL } from '../utils/apiConfig';

const AuthModal = ({ isOpen, onClose, initialMode = 'magic' }) => {
  const [mode, setMode] = useState(initialMode); // 'login', 'magic'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const { login, requestMagicLink } = useAuth();

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setMessage('');
    setMagicLinkSent(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await login(username, password, true); // Pass true for admin login
    
    if (result.success) {
      handleClose();
    } else {
      setMessage(result.error);
    }
    
    setLoading(false);
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await requestMagicLink(email);
    
    if (result.success) {
      setMagicLinkSent(true);
      setMessage('Check your email for the magic login link!');
    } else {
      setMessage(result.error);
    }
    
    setLoading(false);
  };

  const handleOAuthLogin = (provider) => {
    // Redirect to OAuth provider
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' && 'Admin Login'}
            {mode === 'magic' && 'Welcome to Gulf Coast Hackers League!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Magic Link Section - Prominent */}
        {mode === 'magic' && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                🚀 Quick & Secure Login
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Get instant access with a magic link sent to your email. No password needed!
              </p>
              <form onSubmit={handleMagicLink}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || magicLinkSent}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold text-lg shadow-lg"
                >
                  {loading ? '✨ Sending Magic Link...' : magicLinkSent ? '✅ Magic Link Sent!' : '✨ Send Magic Link'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </button>
          
          <button
            onClick={() => handleOAuthLogin('apple')}
            className="w-full flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 0c.054 0 .107.004.16.012 2.578.347 4.244 2.44 4.244 5.104 0 2.872-1.794 5.202-4.244 5.504-.053.008-.106.012-.16.012s-.107-.004-.16-.012c-2.45-.302-4.244-2.632-4.244-5.504 0-2.664 1.666-4.757 4.244-5.104.053-.008.106-.012.16-.012zm0 1.6c-1.846.25-3.244 1.91-3.244 3.516 0 1.797 1.195 3.266 3.244 3.504.049.007.098.01.148.01s.099-.003.148-.01c2.049-.238 3.244-1.707 3.244-3.504 0-1.606-1.398-3.266-3.244-3.516-.049-.007-.098-.01-.148-.01s-.099.003-.148.01z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setMode('magic')}
            className={`flex-1 py-2 px-4 text-center ${
              mode === 'magic' 
                ? 'border-b-2 border-purple-500 text-purple-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 text-center ${
              mode === 'login' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Forms */}
        {mode === 'login' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>🔐 Admin Access Only</strong>
            </p>
            <p className="text-xs text-yellow-700">
              This login is reserved for existing admin users (jason, nash, david). 
              New users should use the Magic Link option above.
            </p>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin username"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing In...' : 'Admin Sign In'}
            </button>
          </form>
        )}

        {mode === 'magic' && !magicLinkSent && (
          <div className="text-center text-gray-600">
            <p className="text-sm">
              ✨ Your magic link will be sent instantly to your email address.
            </p>
            <p className="text-xs mt-2">
              Check your inbox and spam folder for the login link.
            </p>
          </div>
        )}

        {/* Error/Success Messages */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('successful') || message.includes('Check your email')
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
