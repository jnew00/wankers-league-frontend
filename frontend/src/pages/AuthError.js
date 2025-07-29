import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthError = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Login Failed</h2>
        <p className="text-gray-600 mb-6">
          There was an error during the login process. This could be due to:
        </p>
        <ul className="text-sm text-gray-500 mb-6 text-left">
          <li>• OAuth provider configuration issues</li>
          <li>• Network connectivity problems</li>
          <li>• Cancelled login process</li>
        </ul>
        <button
          onClick={handleRetry}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default AuthError;
