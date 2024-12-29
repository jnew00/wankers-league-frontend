import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const EventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "rank",
    direction: "asc",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/admin/events`
        );

        const upcoming = response.data.filter((event) => !event.has_scores);
        const past = response.data.filter((event) => event.has_scores);

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };
    fetchEvents();
  }, []);

  const fetchEventDetails = async (eventId) => {
    if (selectedEvent === eventId) {
      setSelectedEvent(null); // Collapse if clicked again
      setEventDetails([]);
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admin/events/${eventId}`
      );
      const sortedDetails = response.data.sort((a, b) => {
        if (a.rank === null || a.rank === 0) return 1;
        if (b.rank === null || b.rank === 0) return -1;
        return a.rank - b.rank;
      });
      setSelectedEvent(eventId);
      setEventDetails(sortedDetails);
    } catch (error) {
      console.error("Error fetching event details:", error.message);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedPlayers = [...eventDetails].sort((a, b) => {
      if (key === "rank") {
        if (a.rank === null || a.rank === 0)
          return direction === "asc" ? 1 : -1;
        if (b.rank === null || b.rank === 0)
          return direction === "asc" ? -1 : 1;
        return direction === "asc" ? a.rank - b.rank : b.rank - a.rank;
      }

      if (key === "money_won") {
        const aValue = parseFloat(a[key]) || 0;
        const bValue = parseFloat(b[key]) || 0;
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (a[key] === null || a[key] === undefined) return 1;
      if (b[key] === null || b[key] === undefined) return -1;
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setEventDetails(sortedPlayers);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/admin/manage-events?eventId=${eventId}`);
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Events" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Upcoming Events Section */}
        <div className="upcoming-section py-6 px-4 rounded-lg shadow-md bg-blue-50 mb-16">
          <h2 className="text-2xl font-bold border-b-4 border-blue-600 inline-block mb-4">
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500">No upcoming events available.</p>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className={`border border-gray-300 rounded-lg mb-4 shadow-md ${
                  event.is_major ? "bg-yellow-50" : ""
                }`}
              >
                <div className="font-bold text-lg py-2 px-4 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center">
                    <span>
                      {new Date(event.date).toLocaleDateString()} -{" "}
                      {event.course_name}
                    </span>
                    {event.is_major && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        Major
                      </span>
                    )}
                  </div>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-lg"
                    onClick={() => handleEditEvent(event.id)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Past Events Section */}
        <div className="past-section py-6 px-4 rounded-lg shadow-md bg-gray-100">
          <h2 className="text-2xl font-bold border-b-4 border-gray-600 inline-block mb-4">
            Past Events
          </h2>
          {pastEvents.length === 0 ? (
            <p className="text-gray-500">No past events available.</p>
          ) : (
            pastEvents.map((event) => (
              <div
                key={event.id}
                className={`border border-gray-300 rounded-lg mb-4 shadow-md ${
                  event.is_major ? "bg-yellow-50" : ""
                }`}
              >
                <div
                  className="cursor-pointer font-bold text-lg py-2 px-4 bg-gray-50 flex justify-between items-center"
                  onClick={() => fetchEventDetails(event.id)}
                >
                  <div className="flex items-center">
                    <span>
                      {new Date(event.date).toLocaleDateString()} -{" "}
                      {event.course_name}
                    </span>
                    {event.is_major && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        Major
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600 text-sm italic">
                    {event.winner_name
                      ? `Winner: ${event.winner_name}`
                      : "Winner: N/A"}
                  </div>
                </div>

                {selectedEvent === event.id && (
                  <div className="mt-4 p-4">
                    <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                        <tr>
                          <th
                            className="p-4 text-center cursor-pointer"
                            onClick={() => handleSort("rank")}
                          >
                            Place{" "}
                            {sortConfig.key === "rank"
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : ""}
                          </th>
                          <th className="p-4 text-left">Player</th>
                          <th className="p-4 text-center">Quota</th>
                          <th className="p-4 text-center">Score</th>
                          <th className="p-4 text-center">+/-</th>
                          <th className="p-4 text-center">CTPs</th>
                          <th className="p-4 text-center">Skins</th>
                          <th className="p-4 text-center">Money Won</th>
                          <th className="p-4 text-center">Points Gained</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventDetails.map((player, index) => (
                          <tr
                            key={player.player_id}
                            className={`${
                              index % 2 === 0 ? "bg-blue-50" : "bg-white"
                            } hover:bg-blue-100 border-b`}
                          >
                            <td className="p-4 text-center">
                              {player.rank || "N/A"}
                            </td>
                            <td className="p-4 text-left">
                              {player.player_name}
                            </td>
                            <td className="p-4 text-center">
                              {player.quota || "N/A"}
                            </td>
                            <td className="p-4 text-center">
                              {player.score || "N/A"}
                            </td>
                            <td className="p-4 text-center font-bold">
                              {player.score !== null &&
                              player.quota !== null ? (
                                <>
                                  {player.score - player.quota > 0 && (
                                    <span className="text-green-500">
                                      +{player.score - player.quota}
                                    </span>
                                  )}
                                  {player.score - player.quota < 0 && (
                                    <span className="text-red-500">
                                      {player.score - player.quota}
                                    </span>
                                  )}
                                  {player.score - player.quota === 0 && "0"}
                                </>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="p-4 text-center">{player.ctps}</td>
                            <td className="p-4 text-center">{player.skins}</td>
                            <td className="p-4 text-center">
                              ${parseFloat(player.money_won).toFixed(2)}
                            </td>
                            <td className="p-4 text-center">
                              {player.total_points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
