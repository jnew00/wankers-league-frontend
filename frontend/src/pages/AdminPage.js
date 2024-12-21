import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import PointsAllocation from "../components/PointsAllocation";
import EventSelector from "../components/EventSelector";
import PlayerList from "../components/PlayerList";
import { labelMapping } from "../components/PointsAllocation";
import { calculateTotalPoints, MAJOR_MULTIPLIER } from "../utils/pointsUtils";

import axios from "axios";

const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pointsConfig, setPointsConfig] = useState({});
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [eventsRes, pointsConfigRes, playersRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/events`),
          axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/admin/points/config`
          ),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/players`),
        ]);

        setEvents(
          eventsRes.data.map((event) => ({
            ...event,
            displayName: `${event.date} - ${event.course_name}`,
          }))
        );
        setPointsConfig(
          pointsConfigRes.data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {})
        );
        setAllPlayers(playersRes.data); // Store all players for dropdown
      } catch (error) {
        console.error("Error fetching initial data:", error.message);
      }
    };

    fetchInitialData();
  }, []);

  const handleEventChange = async (eventId) => {
    if (!eventId) {
      setSelectedEvent(null);
      setPlayers([]);
      return;
    }

    try {
      const eventRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/events/${eventId}`
      );

      const { id, is_major: isMajor, course, players } = eventRes.data;

      setSelectedEvent({
        id,
        isMajor,
        course,
      });

      setPlayers(
        players
          .map((player) => ({
            ...player,
            isEditing: false,
          }))
          .sort(
            (a, b) =>
              (a.rank || Number.MAX_SAFE_INTEGER) -
              (b.rank || Number.MAX_SAFE_INTEGER)
          )
      );
    } catch (error) {
      console.error("Error fetching players:", error.message);
    }
  };

  const handleCancelEdit = (index) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === index
          ? {
              ...player,
              isEditing: false, // Exit edit mode
              ctps: player.originalCtps || player.ctps,
              skins: player.originalSkins || player.skins,
              money_won: player.originalMoneyWon || player.money_won,
              rank: player.originalRank || player.rank,
            }
          : player
      )
    );
  };

  const handleSavePlayer = async (player, index) => {
    try {
      if (!selectedEvent || !selectedEvent.id) {
        throw new Error("Invalid event ID.");
      }

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/events/${selectedEvent.id}/player/${player.player_id}`,
        {
          ctps: player.ctps || 0,
          skins: player.skins || 0,
          money_won: player.money_won || 0,
          total_points: player.total_points || 0,
          rank: player.rank || null,
        }
      );

      alert(`Player ${player.name}'s data saved successfully!`);
      // Exit edit mode
      setPlayers((prevPlayers) =>
        prevPlayers.map((p, i) =>
          i === index ? { ...p, isEditing: false } : p
        )
      );
    } catch (error) {
      console.error("Error saving player data:", error.message);
      alert("Failed to save player data.");
    }
  };

  const handleDeletePlayer = async (index, playerId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/events/${selectedEvent.id}/player/${playerId}`
      );
      setPlayers((prevPlayers) => prevPlayers.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting player:", error.message);
      alert("Failed to delete player.");
    }
  };

  const toggleEditMode = (index) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === index ? { ...player, isEditing: !player.isEditing } : player
      )
    );
  };

  const handleAddPlayer = () => {
    setPlayers((prevPlayers) => [
      ...prevPlayers,
      {
        player_id: null,
        name: "",
        ctps: 0,
        skins: 0,
        money_won: 0,
        total_points: 0,
        rank: null,
        isEditing: true,
      },
    ]);
  };

  const handleAddEvent = () => {
    navigate("/admin/add-event");
  };

  const handlePlayerChange = (index, field, value) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      const player = updatedPlayers[index];

      player[field] =
        field === "player_id" || field === "rank" ? Number(value) : value;

      player.total_points = calculateTotalPoints(
        player,
        pointsConfig,
        selectedEvent?.isMajor
      );

      return updatedPlayers;
    });
  };

  const savePointsConfig = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/points/config`,
        pointsConfig
      );
      setIsEditingPoints(false);
      alert("Points configuration saved successfully!");
    } catch (error) {
      console.error("Error saving points configuration:", error.message);
      alert("Failed to save points configuration.");
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleClickOutsideDrawer = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      setIsDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.addEventListener("mousedown", handleClickOutsideDrawer);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideDrawer);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDrawer);
    };
  }, [isDrawerOpen]);

  return (
    <div className="relative">
      <Navbar />
      <PageHeader title="Admin: Manage Event" />
      <div className="max-w-7xl mx-auto px-4 py-8 flex relative">
        <div className="flex-1 bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
          <div
            className="absolute -top-12 right-0 group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <button
              onClick={toggleDrawer}
              className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-l-lg ${
                isDrawerOpen ? "" : "opacity-75 hover:opacity-100"
              }`}
              style={{ zIndex: 10 }}
            >
              {isDrawerOpen ? "→" : "←"}
            </button>
            {isHovering && !isDrawerOpen && (
              <div
                className="absolute top-1/2 -translate-y-1/2 right-full bg-white p-3 text-xs rounded-lg shadow-lg border border-gray-200"
                style={{ whiteSpace: "nowrap", maxWidth: "250px" }}
              >
                <table className="w-full text-left text-gray-700">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(pointsConfig).map(([key, value]) => (
                      <tr key={key}>
                        <td>{labelMapping[key] || key}</td>
                        <td className="text-right">
                          {selectedEvent?.isMajor
                            ? Math.ceil(value * MAJOR_MULTIPLIER).toFixed(2)
                            : value.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
            {/* {selectedEvent && (
              <div className="mt-4">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  onClick={handleAddPlayer}
                >
                  Add Player
                </button>
              </div>
            )} */}
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={handleAddEvent}
            >
              Add Event
            </button>
          </div>

          <EventSelector
            events={events.map((event) => ({
              ...event,
              displayName: `${event.date} - ${event.course_name}`, // Customize display
            }))}
            selectedEvent={selectedEvent}
            handleEventChange={handleEventChange}
          />
          {selectedEvent?.isMajor && (
            <div className="bg-yellow-300 text-yellow-800 text-sm font-semibold rounded-lg px-2 py-1 mt-2 inline-block">
              Major Event
            </div>
          )}
          <PlayerList
            players={players}
            toggleEditMode={toggleEditMode}
            handlePlayerChange={handlePlayerChange}
            handleDeletePlayer={handleDeletePlayer}
            handleSavePlayer={handleSavePlayer}
            allPlayers={allPlayers}
            selectedEvent={selectedEvent}
            handleAddPlayer={handleAddPlayer}
            handleCancelEdit={handleCancelEdit}
          />
        </div>

        <div
          ref={drawerRef}
          className={`fixed top-0 right-0 h-full bg-gray-50 shadow-md border-l border-gray-200 transition-transform transform ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ width: "400px", overflowY: "auto" }}
        >
          <PointsAllocation
            pointsConfig={pointsConfig}
            isEditingPoints={isEditingPoints}
            toggleEditPoints={() => setIsEditingPoints(!isEditingPoints)}
            handlePointsChange={(key, value) =>
              setPointsConfig((prevConfig) => ({
                ...prevConfig,
                [key]: value,
              }))
            }
            savePointsConfig={savePointsConfig}
            isMajor={selectedEvent?.isMajor}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
