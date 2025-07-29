import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export useUser for backwards compatibility with existing components
export const useUser = () => {
  const { user, roles, hasRole, login, logout } = useAuth();
  return { user, roles, hasRole, login, logout };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roles, setRoles] = useState(['guest']); // Preserve existing role system
  const [userVersion, setUserVersion] = useState(0); // Force re-renders when user data changes

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
        withCredentials: true
      });
      
      // Set basic user data from validate endpoint
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Now fetch the full profile data which includes linked player info
      try {
        const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
          withCredentials: true
        });
        
        // Update user with complete profile data including player info
        const fullUserData = {
          ...response.data.user,
          ...profileResponse.data,
          // Map the player data to maintain backward compatibility
          player_id: profileResponse.data.player?.id || null
        };
        
        setUser(fullUserData);
      } catch (profileError) {
        console.log('Profile fetch failed, using basic user data:', profileError);
        // Continue with basic user data if profile fetch fails
      }
      
      setUserVersion(prev => prev + 1); // Force re-renders
      
      // Preserve existing role system
      const userRoles = response.data.user?.roles || ['player'];
      setRoles(userRoles);
      localStorage.setItem("roles", JSON.stringify(userRoles));
      
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setRoles(['guest']);
      localStorage.removeItem("roles");
    } finally {
      setLoading(false);
    }
  };

  // Backwards compatibility - support old login method
  const legacyLogin = (newRoles) => {
    setRoles(newRoles);
    localStorage.setItem("roles", JSON.stringify(newRoles));
  };

  const login = async (emailOrUsername, password, isAdminLogin = false) => {
    try {
      const requestBody = isAdminLogin 
        ? { username: emailOrUsername, password }
        : { email: emailOrUsername, password };
        
      const response = await axios.post(`${API_BASE_URL}/auth/login`, requestBody, { 
        withCredentials: true 
      });
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Update roles
      const userRoles = response.data.user?.roles || ['player'];
      setRoles(userRoles);
      localStorage.setItem("roles", JSON.stringify(userRoles));
      
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName
      }, { withCredentials: true });
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      const userRoles = response.data.user?.roles || ['player'];
      setRoles(userRoles);
      localStorage.setItem("roles", JSON.stringify(userRoles));
      
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const requestMagicLink = async (email) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/magic-link`, {
        email
      }, { withCredentials: true });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to send magic link' 
      };
    }
  };

  const verifyMagicLink = async (token, email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/magic-verify`, {
        token,
        email
      }, { withCredentials: true });
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      const userRoles = response.data.user?.roles || ['player'];
      setRoles(userRoles);
      localStorage.setItem("roles", JSON.stringify(userRoles));
      
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid or expired magic link' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setRoles(['guest']);
      localStorage.removeItem("roles");
    }
  };

  const linkPlayer = async (playerId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/link-player`,
        { playerId },
        { withCredentials: true }
      );
      
      if (response.data.message) {
        // Refresh user data after linking to get updated profile with player info
        await checkAuthStatus();
        return { success: true };
      }
      
      return { success: false, error: 'Failed to link player' };
    } catch (error) {
      console.error('Error linking player:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to link player' 
      };
    }
  };  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, profileData, {
        withCredentials: true
      });
      
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update profile' 
      };
    }
  };

  const uploadProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await axios.post(`${API_BASE_URL}/auth/profile/picture`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update user data with new profile picture
      setUser(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));
      
      // Force re-renders in components that depend on user data
      setUserVersion(prev => prev + 1);
      
      return { success: true, profilePicture: response.data.profilePicture };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to upload profile picture' 
      };
    }
  };

  const getProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        withCredentials: true
      });
      return { success: true, profile: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get profile' 
      };
    }
  };

  const signUpForEvent = async (eventId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/events/${eventId}/signup`, {}, {
        withCredentials: true
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to sign up for event' 
      };
    }
  };

  const withdrawFromEvent = async (eventId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/auth/events/${eventId}/signup`, {
        withCredentials: true
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to withdraw from event' 
      };
    }
  };

  // Role checking function (preserves existing functionality)
  const hasRole = (role) => roles.includes(role);

  const value = {
    // New auth system
    user,
    isAuthenticated,
    loading,
    userVersion, // Force re-renders when user data changes
    login,
    register,
    logout,
    requestMagicLink,
    verifyMagicLink,
    linkPlayer,
    updateProfile,
    uploadProfilePicture,
    getProfile,
    signUpForEvent,
    withdrawFromEvent,
    checkAuthStatus,
    
    // Backwards compatibility for existing components
    roles,
    hasRole,
    legacyLogin, // Support old login method
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
