import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/UnifiedAuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MagicLinkVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLink } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false); // Prevent multiple verification attempts

  const verify = useCallback(async (token, email) => {
    if (hasVerified.current) {
      console.log('Magic link verification already attempted, skipping...');
      return;
    }
    
    hasVerified.current = true;
    console.log('Starting magic link verification...');
    
    const result = await verifyMagicLink(token, email);
    
    if (result.success) {
      setStatus('success');
      setMessage('Successfully logged in! Redirecting...');
      setTimeout(() => {
        navigate('/fantasy');
      }, 2000);
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed to verify magic link');
    }
  }, [verifyMagicLink, navigate]);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid magic link. Missing token or email.');
      return;
    }

    verify(token, email);
  }, [searchParams, verify]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Magic Link</h2>
              <p className="text-gray-600">Please wait while we log you in...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Login Successful!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="animate-pulse">
                <div className="h-2 bg-green-200 rounded-full">
                  <div className="h-2 bg-green-600 rounded-full transition-all duration-2000" style={{width: '100%'}}></div>
                </div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Login Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/fantasy')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Fantasy Golf
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MagicLinkVerification;
