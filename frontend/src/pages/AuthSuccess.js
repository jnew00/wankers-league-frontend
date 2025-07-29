import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/UnifiedAuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      // Check auth status to refresh user data
      await checkAuthStatus();
      
      // Redirect to home page
      setTimeout(() => {
        navigate('/');
      }, 2000);
    };

    handleAuthSuccess();
  }, [checkAuthStatus, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Login Successful!</h2>
        <p className="text-gray-600 mb-4">You've been successfully logged in. Redirecting to home page...</p>
        <div className="animate-pulse">
          <div className="h-2 bg-green-200 rounded-full">
            <div className="h-2 bg-green-600 rounded-full transition-all duration-2000" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
