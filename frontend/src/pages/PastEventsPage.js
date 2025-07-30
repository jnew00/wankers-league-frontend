import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";

const PastEventsPage = () => {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/past-events`);
        setPastEvents(response.data);
      } catch (err) {
        console.error("Error fetching past events:", err);
        setError("Failed to load past events");
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <PageHeader title="Past Events" />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading past events...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <PageHeader title="Past Events" />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <PageHeader title="Past Events" />
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Event History</h2>
          
          {pastEvents.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No past events found.</p>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Event #{event.id}
                        {event.is_major && (
                          <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded">
                            MAJOR
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600">
                        Date: {new Date(event.date).toLocaleDateString()}
                      </p>
                      {event.winner_name && (
                        <p className="text-green-600 font-medium">
                          Winner: {event.winner_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          // Navigate to event details or show modal
                          window.location.href = `/events#event-${event.id}`;
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PastEventsPage;
