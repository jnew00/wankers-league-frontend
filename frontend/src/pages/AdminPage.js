import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import PointsAllocation from "../components/PointsAllocation";
import EventSelector from "../components/EventSelector";
import PlayerList from "../components/PlayerList";
import { labelMapping } from "../components/PointsAllocation";

import axios from "axios";

const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pointsConfig, setPointsConfig] = useState({});
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [eventsRes, pointsConfigRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/past-events`),
          axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/admin/points-config`
          ),
        ]);

        setEvents(eventsRes.data);
        setPointsConfig(
          pointsConfigRes.data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Error fetching initial data:", error.message);
      }
    };

    fetchInitialData();
  }, []);

  const handleEventChange = async (eventId) => {
    setSelectedEvent(eventId);

    if (!eventId) {
      setPlayers([]);
      return;
    }

    try {
      const playersRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/event/${eventId}`
      );
      setPlayers(
        playersRes.data.map((player) => ({
          ...player,
          isEditing: false,
        }))
      );
    } catch (error) {
      console.error("Error fetching players:", error.message);
    }
  };

  const handleSavePlayer = async (player) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/event/${selectedEvent}/player/${player.player_id}`,
        {
          ctps: player.ctps || 0,
          skins: player.skins || 0,
          money_won: player.money_won || 0,
          total_points: player.total_points || 0,
          rank: player.rank || null,
        }
      );
      alert(`Player ${player.name}'s data saved successfully!`);
    } catch (error) {
      console.error("Error saving player data:", error.message);
      alert("Failed to save player data.");
    }
  };

  const handleDeletePlayer = async (index, playerId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/event/${selectedEvent}/player/${playerId}`
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

  const handlePlayerChange = (index, field, value) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      const player = updatedPlayers[index];

      // Update the specific field
      player[field] = value;

      // Recalculate total points
      const ctpPoints = Math.min(
        player.ctps * pointsConfig.ctp,
        pointsConfig.ctp_skin_cap
      );
      const skinPoints = Math.min(
        player.skins * pointsConfig.skin,
        pointsConfig.ctp_skin_cap
      );
      const rankPoints =
        player.rank && pointsConfig[`place${player.rank}`]
          ? pointsConfig[`place${player.rank}`]
          : 0;

      player.total_points =
        ctpPoints + skinPoints + rankPoints + pointsConfig.participation;

      return updatedPlayers;
    });
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
                        <td className="text-right">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <EventSelector
            events={events}
            selectedEvent={selectedEvent}
            handleEventChange={handleEventChange}
          />
          <PlayerList
            players={players}
            toggleEditMode={toggleEditMode}
            handlePlayerChange={handlePlayerChange}
            handleDeletePlayer={handleDeletePlayer}
            handleSavePlayer={handleSavePlayer}
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
            savePointsConfig={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
