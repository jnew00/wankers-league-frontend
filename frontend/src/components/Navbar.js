import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);
  const { hasRole, logout } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  

  const navLinks = [
    { name: "Leaderboard", href: "/" },
    { name: "Score Stats", href: "/quotas" },
    { name: "Events", href: "/events" },
    { name: "Rules", href: "/rules" },
  ];

  const isAdminPage = location.pathname.startsWith("/admin");

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsAdminDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsAdminDropdownOpen(false);
    }, 300);
  };

  return (
    <nav className="bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
      {/* General Navigation Links */}
      <div className="flex-1 flex justify-center space-x-8">
      {navLinks.map((link) => (
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
            ))}
       

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
                  <Link
                    to="/admin/manage-event"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                  >
                    Manage Events
                  </Link>
                  <Link
                    to="/admin/manage-players"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                  >
                    Manage Players
                  </Link>
                  <Link
                    to="/admin/manage-course"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                  >
                    Manage Courses
                  </Link>
            {/* "Record Results" is only visible to Admin */}
            {hasRole("admin") && (
                  <Link
                    to="/admin/record-results"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                  >
                    Record Results
                  </Link>
            )}
                </div>
              )}
            </div>
          )}
   </div>
          {/* User Account Links */}
          <div className="flex justify-end">
          {hasRole("guest") ? (
            <button
              onClick={openLogin}
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="text-red-600 font-medium hover:underline"
            >
              Logout
            </button>
            )}
          </div>
        </div>
        <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
 
    </nav>
  );
};

export default Navbar;
