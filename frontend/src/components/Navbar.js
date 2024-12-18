import React, { useState } from "react";
import { Link } from "react-router-dom"; // Use Link for navigation

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("Leaderboard");

  const navLinks = [
    { name: "Leaderboard", href: "/" },
    { name: "Upcoming Events", href: "/upcoming" },
    { name: "Current Quotas", href: "/quotas" },
    { name: "Past Events", href: "/past-events" },
  ];

  return (
    <nav className="bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setActiveTab(link.name)}
              className={`relative py-3 text-sm font-medium ${
                activeTab === link.name
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.name}
              {activeTab === link.name && (
                <span className="absolute bottom-0 left-1/2 w-4/5 h-[3px] bg-blue-600 rounded-full transform -translate-x-1/2" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
