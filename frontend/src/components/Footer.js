import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-300 shadow-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        {/* Left Section */}
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Wankers United. All rights reserved.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex space-x-6">
          <a
            href="/leaderboard"
            className="text-gray-600 hover:text-blue-600 text-sm font-medium"
          >
            About
          </a>
          <a
            href="/leaderboard"
            className="text-gray-600 hover:text-blue-600 text-sm font-medium"
          >
            Contact
          </a>
          <a href="https://www.facebook.com/paigereneespiranac/" target="_blank" rel="noopener noreferrer">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                >
                   <path
      d="M22.675 0H1.325C.594 0 0 .594 0 1.326v21.348C0 23.406.594 24 1.325 24h11.49v-9.294H9.692v-3.622h3.123V8.41c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.796.143v3.24h-1.919c-1.504 0-1.795.715-1.795 1.764v2.313h3.588l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.594 1.324-1.326V1.326C24 .594 23.406 0 22.675 0z"
    />
                </svg>
            </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
