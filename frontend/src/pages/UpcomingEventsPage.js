import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import axios from "axios";

const UpcomingEventsPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvent = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/upcoming-events`
        );
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching upcoming events:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvent();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>No upcoming events found.</p>;

  return (
    <div>
      <Navbar />
      <PageHeader title="Upcoming Event" />
      <div className="max-w-4xl mx-auto mt-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{event.course_name}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Date: {new Date(event.event_date).toLocaleDateString()}
        </p>
        <p className="mb-2">
          Address:{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              event.address
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {event.address}
          </a>
        </p>
        <p className="mb-2">
          Website:{" "}
          <a
            href={event.website}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {event.website}
          </a>
        </p>
        <p className="mb-2">Front Tee: {event.front_tee}</p>
        <p>Back Tee: {event.back_tee}</p>
      </div>
    </div>
  );
};

export default UpcomingEventsPage;
