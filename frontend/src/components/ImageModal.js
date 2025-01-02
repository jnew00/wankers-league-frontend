import React from "react";

const ImageModal = ({ imageSrc, onClose }) => {
  const copyToClipboard = () => {
    if (imageSrc) {
      navigator.clipboard.writeText(imageSrc);
      alert("Image data copied to clipboard! You can now paste it into an email.");
    }
  };

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4">Generated Email Image</h3>
          <img src={imageSrc} alt="Generated Email" className="max-w-full rounded-lg" />
          <div className="flex gap-4 mt-4">
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
