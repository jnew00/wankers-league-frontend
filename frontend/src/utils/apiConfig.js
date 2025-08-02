// Dynamic API URL utility - respects environment configuration
export const getApiBaseUrl = () => {
  // First priority: Use environment variable if set
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Fallback: Use tunnel domain for development
  return 'https://signin.gulfcoasthackers.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
