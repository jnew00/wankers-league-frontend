import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation(); // Get the current route path
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Leaderboard", href: "/" },
    { name: "Upcoming Events", href: "/upcoming-events" },
    { name: "Current Quotas", href: "/quotas" },
    { name: "Past Events", href: "/past-events" },
  ];

  return (
    <nav className="bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`relative py-3 text-sm font-medium ${
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
          <div className="relative">
            <button
              className="relative py-3 text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
            >
              Admin
            </button>
            {isAdminDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <Link
                  to="/admin/add-event"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                  onClick={() => setIsAdminDropdownOpen(false)}
                >
                  Add Event
                </Link>
                <Link
                  to="/admin/add-course"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                  onClick={() => setIsAdminDropdownOpen(false)}
                >
                  Add Course
                </Link>
                <Link
                  to="/admin/manage-events"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                  onClick={() => setIsAdminDropdownOpen(false)}
                >
                  Manage Events
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
