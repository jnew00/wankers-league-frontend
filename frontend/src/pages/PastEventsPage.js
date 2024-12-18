import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const PastEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "rank", // Default sorting by Place
    direction: "asc", // Ascending order
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/past-events`
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
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
        `${process.env.REACT_APP_API_BASE_URL}/api/past-events/${eventId}`
      );
      const sortedDetails = response.data.sort((a, b) => {
        if (a.rank === null || a.rank === 0) return 1; // Place N/A at the bottom
        if (b.rank === null || b.rank === 0) return -1;
        return a.rank - b.rank; // Sort ascending
      });
      setSelectedEvent(eventId);
      setEventDetails(sortedDetails);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedPlayers = [...eventDetails].sort((a, b) => {
      // Handle Place sorting with N/A at the bottom
      if (key === "rank") {
        if (a.rank === null || a.rank === 0)
          return direction === "asc" ? 1 : -1;
        if (b.rank === null || b.rank === 0)
          return direction === "asc" ? -1 : 1;
        return direction === "asc" ? a.rank - b.rank : b.rank - a.rank;
      }

      // Special handling for numeric columns
      if (key === "money_won") {
        const aValue = parseFloat(a[key]) || 0; // Convert to number, fallback to 0
        const bValue = parseFloat(b[key]) || 0;
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // General sorting logic
      if (a[key] === null || a[key] === undefined) return 1;
      if (b[key] === null || b[key] === undefined) return -1;
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setEventDetails(sortedPlayers);
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Past Events" />
      <div className="max-w-7xl mx-auto px-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="border border-gray-300 rounded-lg mb-4 shadow-md"
          >
            <div
              className="cursor-pointer font-bold text-lg py-2 px-4 bg-gray-50"
              onClick={() => fetchEventDetails(event.id)}
            >
              {new Date(event.date).toLocaleDateString()} - {event.course_name}
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
                      <th
                        className="p-4 text-left cursor-pointer"
                        onClick={() => handleSort("player_name")}
                      >
                        Player{" "}
                        {sortConfig.key === "player_name"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </th>
                      <th
                        className="p-4 text-center cursor-pointer"
                        onClick={() => handleSort("skins")}
                      >
                        Skins{" "}
                        {sortConfig.key === "skins"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </th>
                      <th
                        className="p-4 text-center cursor-pointer"
                        onClick={() => handleSort("ctps")}
                      >
                        CTPs{" "}
                        {sortConfig.key === "ctps"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </th>
                      <th
                        className="p-4 text-center cursor-pointer"
                        onClick={() => handleSort("money_won")}
                      >
                        Money Won{" "}
                        {sortConfig.key === "money_won"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </th>
                      <th
                        className="p-4 text-center cursor-pointer"
                        onClick={() => handleSort("total_points")}
                      >
                        Points Gained{" "}
                        {sortConfig.key === "total_points"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventDetails.map((player, index) => (
                      <tr
                        key={player.player_name}
                        className={`${
                          index % 2 === 0 ? "bg-blue-50" : "bg-white"
                        } hover:bg-blue-100 border-b`}
                      >
                        <td className="p-4 text-center">
                          {player.rank || "N/A"}
                        </td>
                        <td className="p-4 text-left">{player.player_name}</td>
                        <td className="p-4 text-center">{player.skins}</td>
                        <td className="p-4 text-center">{player.ctps}</td>
                        <td className="p-4 text-center">${player.money_won}</td>
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
        ))}
      </div>
    </div>
  );
};

export default PastEventsPage;
