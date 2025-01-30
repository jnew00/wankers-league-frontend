import React, { useEffect } from "react";

const ImageModal = ({ imageSrc, onClose }) => {
  useEffect(() => {
    // Close modal when Escape key is pressed
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopyImage = async () => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const data = [new ClipboardItem({ [blob.type]: blob })];
      await navigator.clipboard.write(data);
      alert("Image copied to clipboard! You can paste it into an editor or email.");
    } catch (error) {
      console.error("Failed to copy image to clipboard:", error);
      alert("Failed to copy image. Please try again.");
    }
  };

  if (!imageSrc) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} // Clicking outside the modal closes it
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
      >
        {/* Close Button - More Prominent */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-gray-900 p-2 rounded-full text-lg"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4">Generated Email Image</h3>
          {/* Image - Ensures it fits inside modal with scrolling */}
          <img src={imageSrc} alt="Generated Email" className="max-w-full max-h-[75vh] rounded-lg" />
          
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleCopyImage}
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
