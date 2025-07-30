import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import recaps from "../utils/recapsData";

const RecapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(600);

  useEffect(() => {
    function handleMessage(event) {
      if (
        event.data &&
        event.data.type === "recapHeight" &&
        typeof event.data.height === "number"
      ) {
        setIframeHeight(event.data.height);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [id]);

  const currentIndex = recaps.findIndex((r) => r.id === id);

  if (currentIndex === -1) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-xl font-bold mb-4">Recap Not Found</h2>
          <button
            onClick={() => navigate("/past-events")}
            className="text-blue-600 hover:underline"
          >
            Back to Recaps
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
          <button
            disabled={currentIndex === 0}
            onClick={() => navigate(`/recaps/${recaps[currentIndex - 1].id}`)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              currentIndex === 0 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <FaArrowLeft /> Previous
          </button>
          <h2 className="text-2xl font-bold text-blue-700">{recaps[currentIndex].title}</h2>
          <button
            disabled={currentIndex === recaps.length - 1}
            onClick={() => navigate(`/recaps/${recaps[currentIndex + 1].id}`)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              currentIndex === recaps.length - 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next <FaArrowRight />
          </button>
        </div>
        <div className="flex-1 px-6 py-6">
          <div
            style={{
              border: "1.5px solid #d1d5db", // subtle gray border
              borderRadius: "12px",
              background: "#fff",
              boxShadow: "0 6px 24px rgba(37,99,235,0.18)", // darker blue shadow
              padding: "0",
              overflow: "hidden"
            }}
          >
            <iframe
              ref={iframeRef}
              src={`/recaps/${id}.html`}
              title={recaps[currentIndex].title}
              width="100%"
              height={iframeHeight}
              style={{
                border: "none",
                borderRadius: "8px",
                background: "#fff",
                display: "block",
                margin: "0 auto",
                transition: "height 0.2s"
              }}
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-white shadow">
          <button
            onClick={() => navigate("/past-events")}
            className="text-blue-600 hover:underline"
          >
            Back to Recaps List
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecapDetail;
