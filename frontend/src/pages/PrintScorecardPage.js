import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ScorecardSheet from "../components/ScoreCardSheet";
import PayoutTablePrint from "../components/PayoutTablePrint";

const PrintScorecardPage = () => {
  const [orientation, setOrientation] = useState("landscape"); // Default to landscape
  const { state } = useLocation();
  const { eventDetails, eventPlayers, scorecard } = state || {};

  useEffect(() => {
    // Dynamically update the @page rule for print orientation
    const styleTag = document.createElement("style");
    styleTag.type = "text/css";
    styleTag.id = "dynamic-print-style";
    styleTag.innerHTML = `
      @media print {
        @page {
          size: ${orientation};
        }
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      // Clean up the dynamically added style tag
      const existingStyleTag = document.getElementById("dynamic-print-style");
      if (existingStyleTag) {
        existingStyleTag.remove();
      }
    };
  }, [orientation]); // Re-run whenever orientation changes

  if (!eventDetails || !eventPlayers || !scorecard ) {
    return <div>No data provided for printing.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Orientation Selector */}
      <div className="p-4 flex space-x-4">
        <button
          onClick={() => setOrientation("landscape")}
          className={`px-4 py-2 rounded ${
            orientation === "landscape"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-black"
          }`}
        >
          Landscape
        </button>
        <button
          onClick={() => setOrientation("portrait")}
          className={`px-4 py-2 rounded ${
            orientation === "portrait"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-black"
          }`}
        >
          Portrait
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Print
        </button>
      </div>

      {/* Content to Print */}
      <div id="print-content" className="p-4">
        <div className="mb-8">
          <ScorecardSheet
            eventDetails={eventDetails}
            players={eventPlayers}
            scorecard={scorecard}
          />
        </div>

        <div className="page-break">
          <PayoutTablePrint />
        </div>
      </div>
    </div>
  );
};

export default PrintScorecardPage;
