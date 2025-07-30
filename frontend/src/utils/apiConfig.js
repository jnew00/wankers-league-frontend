// Dynamic API URL utility - use tunnel domain if accessing via tunnel
export const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // If we're on the tunnel domain, use tunnel for API
  if (hostname === 'signin.gulfcoasthackers.com') {
    return 'https://signin.gulfcoasthackers.com/api';
  }
  
  // Always use the tunnel domain
  return 'https://signin.gulfcoasthackers.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Debug logging
console.log('=== API BASE URL DEBUG (utils) ===');
console.log('Window hostname:', window.location.hostname);
console.log('REACT_APP_API_BASE_URL env var:', process.env.REACT_APP_API_BASE_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);
