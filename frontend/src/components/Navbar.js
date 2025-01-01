import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  const navLinks = [
    { name: "Leaderboard", href: "/" },
    { name: "Quota Stats", href: "/quotas" },
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center space-x-8 items-center">
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

          {/* Admin Dropdown */}
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
                  to="/admin/add-event"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                >
                  Add Events
                </Link>
                <Link
                  to="/admin/manage-players"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                >
                  Manage Players
                </Link>
                <Link
                  to="/admin/manage-events"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                >
                  Manage Events
                </Link>
                <Link
                  to="/admin/add-course"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-lg"
                >
                  Manage Courses
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;