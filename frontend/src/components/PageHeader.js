import React, { useState } from "react";

const PageHeader = ({ title, updatedText }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-start px-4 max-w-7xl">
      <div className="flex items-center justify-start space-x-4">
        <img
          src="/assets/logo.png"
          alt="Leaderboard Logo"
          style={{ width: "150px", height: "150px", marginRight: "0px" }}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsModalOpen(true)}
        />
        <div className="text-left">
          <h1 className="text-4xl font-semibold text-gray-800">{title}</h1>
          {updatedText && (
            <p className="text-lg text-gray-500">{updatedText}</p>
          )}
        </div>
      </div>

      {/* Logo Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white p-4 rounded-lg shadow-xl max-w-3xl max-h-[90vh] relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src="/assets/logo.png"
              alt="Leaderboard Logo Large"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PageHeader;