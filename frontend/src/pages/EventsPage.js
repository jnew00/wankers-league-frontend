import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import CourseModal from "../components/CourseModal";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

tippy('.tooltip', {
  content: 'Remove',
});

const EventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState({});
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [eventPlayers, setEventPlayers] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
  
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 -> 12 for midnight
    return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };
  

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/events`);
        const now = new Date();

        const upcoming = response.data.filter(
          (event) => new Date(event.date) > now
        );
        const past = response.data.filter(
          (event) => new Date(event.date) <= now
        );

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };
    
    const fetchAllPlayers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/players`);
        setAllPlayers(response.data);
      } catch (error) {
        console.error("Error fetching players:", error.message);
      }
    };

    fetchEvents();
    fetchAllPlayers();
  }, [API_BASE_URL]);

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/events/${eventId}/details`);
      const event = response.data;
      setEventDetails({...event.details, total_yardage: event.total_yardage,});

      const playersResponse = await axios.get(
        `${API_BASE_URL}/admin/events/${eventId}/players`
      );
      setEventPlayers(playersResponse.data);
    } catch (error) {
      console.error("Error fetching event details:", error.message);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/events/${selectedEvent}/player/${playerId}`);
      alert("Player removed successfully!");
      fetchEventDetails(selectedEvent); // Refresh the list
    } catch (error) {
      console.error("Error deleting player:", error.message);
      alert("Failed to remove player.");
    }
  };

  const closeModal = () => {
    setSelectedCourseDetails(null);
    setShowModal(false);
  };

  const handleViewCourse = async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/courses/${courseId}`);
      setSelectedCourseDetails(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching course details:", error.message);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedPlayer || !selectedEvent) {
      alert("Please select a player to add.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/admin/events/${selectedEvent}/players`, {
        playerId: selectedPlayer,
      });

      alert("Player added successfully!");
      setSelectedPlayer("");
      fetchEventDetails(selectedEvent);
    } catch (error) {
      console.error("Error adding player:", error.message);
      alert("Failed to add player. Please try again.");
    }
  };

  const toggleEventDetails = (eventId) => {
    if (selectedEvent === eventId) {
      setSelectedEvent(null);
      setEventDetails({});
      setEventPlayers([]);
      return;
    }

    setSelectedEvent(eventId);
    fetchEventDetails(eventId);
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
                <div
                  className="cursor-pointer font-bold text-lg py-2 px-4 bg-gray-50 flex justify-between items-center"
                  onClick={() => toggleEventDetails(event.id)}
                >
                  <div className="flex items-center">
                    <span>
                    {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      })} -{" "}
                      {formatTime(event.tee_time)} -{" "}
                      {event.course_name}
                    </span>
                    {event.is_major && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        Major
                      </span>
                    )}
                  </div>
                </div>

                {selectedEvent === event.id && (
  <div className="mt-4 p-6 bg-white rounded-lg shadow-lg">
    <h3 className="text-xl font-bold mb-4 text-blue-600">1st Tee Time: <span className="text-red-600">{formatTime(eventDetails.tee_time)}</span></h3>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p className="text-gray-700">
        <span className="font-semibold">Course:</span>{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => handleViewCourse(eventDetails.course_id)}
          >
            {eventDetails.course_name}
          </span>        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Address:</span>{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              eventDetails.course_address
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {eventDetails.course_address}
          </a>
        </p>
      </div>
      <div>

        <p className="text-gray-700">
          <span className="font-semibold">Tees:</span> {eventDetails.front_tee} /{" "}
          {eventDetails.back_tee}
          <br />
          <span className="text-gray-700">
            <span className="font-semibold">Total Yardage:</span>{" "}
            {eventDetails.total_yardage} yards
          </span>
        </p>
      </div>
    </div>

    <h3 className="text-lg font-bold text-gray-700 mb-2">Wankers Signed Up</h3>
    <table className="table-auto border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-1 text-left"></th>
          <th className="border p-1 text-left">Name</th>
          <th className="border p-1 text-left">Quota</th>
          <th className="border p-1 text-left"></th>

        </tr>
      </thead>
      <tbody>
        {eventPlayers.map((player, index) => (
          <tr key={player.player_id}>
            <td className="border p-1">{index + 1}</td>
            <td className="border p-1">{player.name}</td>
            <td className="border p-1">{player.quota}</td>
            <td className="border p-1 text-right">
            <button
                onClick={() => handleDeletePlayer(player.player_id)}
                className="tooltip bg-red-500 text-white hover:bg-red-700 font-bold w-5 h-5 flex items-center justify-center rounded border border-red-700"
                >
                X
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3 className="text-lg font-bold text-gray-700 mt-6">Add Player</h3>
    <div className="flex items-center space-x-4">
      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 flex-grow"
      >
        <option value="">-- Select a Player --</option>
        {allPlayers.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddPlayer}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        Add Player
      </button>
    </div>
  </div>
)}

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
                  onClick={() => toggleEventDetails(event.id)}
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
                          <th className="p-4 text-center">Place</th>
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
                        {eventPlayers.map((player, index) => (
                          <tr key={player.player_id}>
                            <td className="p-4 text-center">
                              {player.rank || "N/A"}
                            </td>
                            <td className="p-4 text-left">{player.player_name}</td>
                            <td className="p-4 text-center">{player.quota}</td>
                            <td className="p-4 text-center">{player.score}</td>
                            <td className="p-4 text-center">
                              {player.score - player.quota > 0 ? (
                                <span className="text-green-500">
                                  +{player.score - player.quota}
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  {player.score - player.quota}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">{player.ctps}</td>
                            <td className="p-4 text-center">{player.skins}</td>
                            <td className="p-4 text-center">
                              ${parseFloat(player.money_won).toFixed(2)}
                            </td>
                            <td className="p-4 text-center">{player.total_points}</td>
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
      </div>{showModal && selectedCourseDetails && (
  <CourseModal course={selectedCourseDetails} onClose={closeModal} />
)}

    </div>
  );
};

export default EventsPage;
