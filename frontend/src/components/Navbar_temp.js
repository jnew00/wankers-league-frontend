import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/UnifiedAuthContext";
import AuthModal from "./AuthModal";
import PlayerProfileModal from "./PlayerProfileModal";

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
    if (isProfileModalOpen && user?.player_id && (!playerData || playerData.id !== user.player_id)) {
      // User has been linked, fetch the new player data
      const fetchPlayerData = async () => {
        try {
          const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://signin.gulfcoasthackers.com/api';
          const response = await fetch(`${API_BASE_URL}/players/${user.player_id}`, {
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
  }, [user?.player_id, userVersion, isProfileModalOpen, playerData]);

  const navLinks = [
    { name: 'Home', href: '/', current: false },
    { name: 'Leaderboard', href: '/leaderboard', current: false },
    { name: 'Events', href: '/events', current: false },
    { name: 'Past Events', href: '/past-events', current: false },
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
    { name: 'Manage Events', href: '/admin/manage-event' },
    { name: 'Manage Players', href: '/admin/manage-players' },
    { name: 'Admin Panel', href: '/admin' }
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
    if (user?.first_name) return user.first_name;
    if (user?.firstName) return user.firstName;
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  };

  const handleProfileClick = async () => {
    // Fetch player data if user has a linked player
    if (user?.player_id) {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://signin.gulfcoasthackers.com/api';
        const response = await fetch(`${API_BASE_URL}/players/${user.player_id}`, {
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
                  {adminLinks.map((adminLink) => (
                    <Link
                      key={adminLink.name}
                      to={adminLink.href}
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                    >
                      {adminLink.name}
                    </Link>
                  ))}
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          ) : (
            <div
              className="relative"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              <button className="text-gray-700 hover:text-blue-600 transition-colors">
                {getDisplayName()}
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full w-48 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                    onClick={handleProfileClick}
                  >
                    Profile
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                    onClick={logout}
                  >
                    Logout
                  </button>
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
