import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/UnifiedAuthContext";
import AuthModal from "./AuthModal";
import PlayerProfileModal from "./PlayerProfileModal";
import { API_BASE_URL } from '../utils/apiConfig';

const API_BACKEND_URL = API_BASE_URL.replace('/api', '');

const Navbar = () => {
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isFantasyDropdownOpen, setIsFantasyDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  
  const { user, isAuthenticated, hasRole, logout, userVersion } = useAuth();
  
  const adminTimeoutRef = useRef(null);
  const userTimeoutRef = useRef(null);
  const fantasyTimeoutRef = useRef(null);

  // Update playerData when user's player_id changes (e.g., after linking)
  useEffect(() => {
    const userPlayerId = user?.player_id || user?.player?.id;
    if (isProfileModalOpen && userPlayerId && (!playerData || playerData.id !== userPlayerId)) {
      // User has been linked, fetch the new player data
      const fetchPlayerData = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/players/${userPlayerId}`, {
            credentials: 'include'
          });
          if (response.ok) {
            const player = await response.json();
            setPlayerData(player);
          }
        } catch (error) {
          console.error('Error fetching updated player data:', error);
        }
      };
      fetchPlayerData();
    }
  }, [user?.player_id, user?.player?.id, userVersion, isProfileModalOpen, playerData]);

  const navLinks = [
    { name: 'Leaderboard', href: '/', current: false },
    { name: 'Score Stats', href: '/quotas', current: false },
    { name: 'Events', href: '/events', current: false },
    { name: 'Rules', href: '/rules', current: false },
    { name: 'Recaps', href: '/recaps', current: false },
    { 
      name: 'Fantasy Golf', 
      href: '#', 
      current: false,
      dropdown: [
        { name: 'Submit Picks', href: '/fantasy-golf' },
        { name: 'Leaderboard', href: '/fantasy-leaderboard' }
      ]
    },
  ];

  const adminLinks = [
    { name: 'Record Results', href: '/admin/record-results' },
    { name: 'Manage Events', href: '/admin/manage-event' },
    { name: 'Manage Players', href: '/admin/manage-players' },
    { name: 'Manage Courses', href: '/admin/manage-course' }
  ];

  const isAdminPage = location.pathname.startsWith("/admin");
  const isFantasyPage = location.pathname.startsWith("/fantasy");

  const handleMouseEnter = () => {
    if (adminTimeoutRef.current) {
      clearTimeout(adminTimeoutRef.current);
    }
    setIsAdminDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    adminTimeoutRef.current = setTimeout(() => {
      setIsAdminDropdownOpen(false);
    }, 300);
  };

  const handleUserMouseEnter = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
    }
    setIsUserDropdownOpen(true);
  };

  const handleUserMouseLeave = () => {
    userTimeoutRef.current = setTimeout(() => {
      setIsUserDropdownOpen(false);
    }, 300);
  };

  // Mouse hover handlers for Fantasy Golf dropdown
  const handleFantasyMouseEnter = () => {
    if (fantasyTimeoutRef.current) {
      clearTimeout(fantasyTimeoutRef.current);
    }
    setIsFantasyDropdownOpen(true);
  };

  const handleFantasyMouseLeave = () => {
    fantasyTimeoutRef.current = setTimeout(() => {
      setIsFantasyDropdownOpen(false);
    }, 300);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (adminTimeoutRef.current) clearTimeout(adminTimeoutRef.current);
      if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current);
      if (fantasyTimeoutRef.current) clearTimeout(fantasyTimeoutRef.current);
    };
  }, []);

  // Helper function to get display name for user
  const getDisplayName = () => {
    // Try to get full name from linked player first
    if (user?.player?.name) {
      return user.player.name;
    }
    
    // Try to construct from first_name and last_name
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    
    // Try firstName and lastName (alternative naming)
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    
    // Extract name from email if available
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Convert email username to a more readable format
      return emailName
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }
    
    return 'User';
  };

  // Helper function to get user profile picture URL
  const getProfilePictureUrl = () => {
    // Try to get profile picture from linked player
    if (user?.player?.image_path) {
      return `${API_BACKEND_URL}${user.player.image_path}`;
    }
    
    // Try to get from user's profile picture field
    if (user?.profilePicture) {
      return `${API_BACKEND_URL}${user.profilePicture}`;
    }
    
    // Try to get from image_path field directly on user
    if (user?.image_path) {
      return `${API_BACKEND_URL}${user.image_path}`;
    }
    
    return null;
  };

  // Helper function to get user initials for avatar fallback
  const getUserInitials = () => {
    const displayName = getDisplayName();
    if (displayName === 'User') return 'U';
    
    const nameParts = displayName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

  // Component for user avatar (with fallback to initials)
  const UserAvatar = ({ size = 'w-8 h-8', textSize = 'text-sm' }) => {
    const profilePicUrl = getProfilePictureUrl();
    const [imageError, setImageError] = useState(false);
    
    if (profilePicUrl && !imageError) {
      return (
        <div className="relative">
          <img
            src={profilePicUrl}
            alt={getDisplayName()}
            className={`${size} rounded-full object-cover border-2 border-white shadow-sm`}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        </div>
      );
    }
    
    // Fallback to initials avatar
    return (
      <div className={`${size} bg-blue-600 text-white rounded-full flex items-center justify-center ${textSize} font-medium shadow-sm`}>
        {getUserInitials()}
      </div>
    );
  };

  const handleProfileClick = async () => {
    // Fetch player data if user has a linked player
    const userPlayerId = user?.player_id || user?.player?.id;
    if (userPlayerId) {
      try {
        const response = await fetch(`${API_BASE_URL}/players/${userPlayerId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const player = await response.json();
          setPlayerData(player);
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
      }
    } else {
      // Create a dummy player object for unlinked users
      setPlayerData({
        id: null,
        name: user?.first_name || user?.firstName || user?.email || 'Unknown User',
        email: user?.email,
        current_quota: null
      });
    }
    setIsProfileModalOpen(true);
    setIsUserDropdownOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        
        {/* General Navigation Links */}
        <div className="flex-1 flex justify-center space-x-8">
          {navLinks.map((link) => {
            if (link.dropdown) {
              // Handle dropdown links
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={handleFantasyMouseEnter}
                  onMouseLeave={handleFantasyMouseLeave}
                >
                  <button
                    className={`relative py-3 text-lg font-medium ${
                      isFantasyPage
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link.name}
                    {isFantasyPage && (
                      <span className="absolute bottom-0 left-1/2 w-4/5 h-[3px] bg-blue-600 rounded-full transform -translate-x-1/2" />
                    )}
                  </button>
                  {isFantasyDropdownOpen && (
                    <div className="absolute top-full w-48 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {link.dropdown.map((dropdownLink) => (
                        <Link
                          key={dropdownLink.name}
                          to={dropdownLink.href}
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                        >
                          {dropdownLink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              // Handle regular links
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative py-3 text-lg font-medium ${
                    location.pathname === link.href
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.href && (
                    <span className="absolute bottom-0 left-1/2 w-4/5 h-[3px] bg-blue-600 rounded-full transform -translate-x-1/2" />
                  )}
                </Link>
              );
            }
          })}

          {/* Admin Dropdown (Visible to Admins Only) */}
          {(hasRole("admin") || hasRole("moderator")) && (
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`relative py-3 text-lg font-medium ${
                  isAdminPage
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Admin
                {isAdminPage && (
                  <span className="absolute bottom-0 left-1/2 w-4/5 h-[3px] bg-blue-600 rounded-full transform -translate-x-1/2" />
                )}
              </button>
              {isAdminDropdownOpen && (
                <div className="absolute top-full w-48 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {adminLinks.map((adminLink) => {
                    // "Record Results" is only visible to Admin
                    if (adminLink.name === 'Record Results' && !hasRole("admin")) {
                      return null;
                    }
                    return (
                      <Link
                        key={adminLink.name}
                        to={adminLink.href}
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                      >
                        {adminLink.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Authentication Section */}
        <div className="ml-4">
          {!isAuthenticated ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          ) : (
            <div
              className="relative"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              <button className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50">
                {/* User Avatar with Profile Picture */}
                <UserAvatar />
                {/* User Name */}
                <span className="font-medium text-gray-900">{getDisplayName()}</span>
                {/* Dropdown Arrow */}
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <UserAvatar size="w-10 h-10" textSize="text-sm" />
                      <div>
                        <div className="font-medium text-gray-900">{getDisplayName()}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      onClick={handleProfileClick}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </button>
                    <button
                      className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      onClick={logout}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && playerData && (
        <PlayerProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          player={playerData}
          onUpdate={(updatedPlayer) => setPlayerData(updatedPlayer)}
        />
      )}
    </nav>
  );
};

export default Navbar;
