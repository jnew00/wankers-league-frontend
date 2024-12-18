import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Select from "react-select"; // For autocomplete

const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [availablePlaces, setAvailablePlaces] = useState([
    1, 2, 3, 4, 5, 6, 7, 8,
  ]);
  const [pointsConfig, setPointsConfig] = useState({});
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [editablePointsConfig, setEditablePointsConfig] = useState({}); // Local state for edits

  // Fetch events, players, and points configuration when the page loads
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

    const fetchAllPlayers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/players`
        );
        setAllPlayers(response.data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    const fetchPointsConfig = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/points-config`
        );
        const config = response.data.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {});
        setPointsConfig(config);
        setEditablePointsConfig(config); // Set local editable state
      } catch (error) {
        console.error("Error fetching points configuration:", error);
      }
    };

    fetchEvents();
    fetchAllPlayers();
    fetchPointsConfig();
  }, []);

  const handleAddPlayer = () => {
    setPlayers([
      ...players,
      {
        id: null,
        name: "",
        ctp: 0,
        skin: 0,
        place: null,
        money_won: 0,
        points: 0,
      },
    ]);
  };

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index][field] = value;

    if (field === "id") {
      const selectedPlayer = allPlayers.find((player) => player.id === value);
      updatedPlayers[index].name = selectedPlayer ? selectedPlayer.name : "";
    }

    if (field === "place") {
      setAvailablePlaces((prev) => {
        const newPlaces = [...prev];
        if (value !== null) newPlaces.splice(newPlaces.indexOf(value), 1);
        if (updatedPlayers[index].place !== null)
          newPlaces.push(updatedPlayers[index].place);
        return newPlaces.sort((a, b) => a - b);
      });
    }

    updatedPlayers[index].points = calculatePoints(updatedPlayers[index]);
    setPlayers(updatedPlayers);
  };

  const calculatePoints = (player) => {
    const placePoints =
      player.place && pointsConfig[`place${player.place}`]
        ? pointsConfig[`place${player.place}`]
        : 0;
    const ctpPoints = player.ctp * pointsConfig.ctp;
    const skinPoints = player.skin * pointsConfig.skin;
    return placePoints + ctpPoints + skinPoints + pointsConfig.participation;
  };

  const handlePointsEdit = (key, value) => {
    setEditablePointsConfig((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const savePointsConfig = async () => {
    try {
      for (const [key, value] of Object.entries(editablePointsConfig)) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/points-config`,
          { key, value }
        );
      }
      setPointsConfig(editablePointsConfig); // Update main state after saving
      setIsEditingPoints(false);
      alert("Points configuration updated successfully!");
    } catch (error) {
      console.error("Error updating points configuration:", error);
    }
  };

  const handlePlayerSelect = (index, selectedOption) => {
    handlePlayerChange(index, "id", selectedOption.value);
  };

  // Add this function definition after all other functions but before the return statement
  const handleSave = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/save-event`,
        {
          eventId: selectedEvent,
          players,
          pointsConfig,
        }
      );
      alert("Event data saved successfully!");
    } catch (error) {
      console.error("Error saving event data:", error);
      alert("Failed to save event data. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Admin: Manage Event" />
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="mb-6">
            <label htmlFor="event" className="block text-lg font-medium mb-2">
              Select Event
            </label>
            <select
              id="event"
              className="w-full border border-gray-300 rounded p-2"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="">-- Select Event --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {new Date(event.date).toLocaleDateString()} -{" "}
                  {event.course_name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            onClick={handleAddPlayer}
          >
            Add Player
          </button>
          {players.map((player, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-4 items-center mb-2 border-b pb-2"
            >
              <Select
                options={allPlayers.map((player) => ({
                  value: player.id,
                  label: player.name,
                }))}
                onChange={(selectedOption) =>
                  handlePlayerSelect(index, selectedOption)
                }
                placeholder="Search player..."
              />
              <input
                type="number"
                placeholder="CTPs"
                className="border border-gray-300 rounded p-2"
                value={player.ctp}
                onChange={(e) =>
                  handlePlayerChange(index, "ctp", Number(e.target.value))
                }
              />
              <input
                type="number"
                placeholder="Skins"
                className="border border-gray-300 rounded p-2"
                value={player.skin}
                onChange={(e) =>
                  handlePlayerChange(index, "skin", Number(e.target.value))
                }
              />
              <select
                className="border border-gray-300 rounded p-2"
                value={player.place || ""}
                onChange={(e) =>
                  handlePlayerChange(index, "place", Number(e.target.value))
                }
              >
                <option value="">-- Select Place --</option>
                {availablePlaces.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Money Won"
                className="border border-gray-300 rounded p-2"
                value={player.money_won}
                onChange={(e) =>
                  handlePlayerChange(index, "money_won", Number(e.target.value))
                }
              />
              <span>Points: {player.points}</span>
            </div>
          ))}
        </div>
        <div className="col-span-1 fixed top-4 right-4 w-64 p-4 border border-gray-300 rounded shadow-md bg-white">
          <h2 className="text-lg font-medium mb-2">Points Configuration</h2>
          {!isEditingPoints ? (
            <>
              {Object.entries(pointsConfig).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="font-medium">{key.replace(/_/g, " ")}:</span>{" "}
                  {value}
                </div>
              ))}
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                onClick={() => setIsEditingPoints(true)}
              >
                Edit Points
              </button>
            </>
          ) : (
            <>
              {Object.keys(editablePointsConfig).map((key) => (
                <div key={key} className="mb-2">
                  <label htmlFor={key} className="block text-sm font-medium">
                    {key.replace(/_/g, " ").toUpperCase()}
                  </label>
                  <input
                    id={key}
                    type="number"
                    className="w-full border border-gray-300 rounded p-2"
                    value={editablePointsConfig[key]}
                    onChange={(e) =>
                      handlePointsEdit(key, Number(e.target.value))
                    }
                  />
                </div>
              ))}
              <button
                className="bg-green-500 text-white px-4 py-2 rounded mt-4"
                onClick={savePointsConfig}
              >
                Save Points
              </button>
            </>
          )}
        </div>
      </div>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleSave}
        disabled={!selectedEvent || players.length === 0}
      >
        Save Event
      </button>
    </div>
  );
};

export default AdminPage;
