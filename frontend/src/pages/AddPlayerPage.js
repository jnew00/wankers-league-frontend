import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";

const AdminManagePlayerPage = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    startingQuota: "",
    new_player: "",
    image: null,
  });
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://signin.gulfcoasthackers.com/api';

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/admin-players`);
        setPlayers(response.data);
      } catch (error) {
        console.error("Error fetching players:", error.message);
      }
    };
    fetchPlayers();
  }, [API_BASE_URL]);

  const handlePlayerChange = (e) => {
    const playerId = e.target.value;
    const player = players.find((p) => p.id === parseInt(playerId));
    setSelectedPlayer(player);

    if (player) {
      setFormData({
        name: player.name,
        email: player.email,
        phone: player.phone_number,
        startingQuota: player.current_quota,
        new_player: player.new_player,
        image: null, // Reset image input for editing
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        startingQuota: "",
        new_player: "",
        image: null,
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) formPayload.append(key, formData[key]);
      });

      if (selectedPlayer) {
        // Update existing player
        await axios.put(
          `${API_BASE_URL}/admin/admin-players/${selectedPlayer.id}`,
          formPayload,
          {
            headers: { "Content-Type": "multipart/form-data", 

            },
            withCredentials: true,
          }
        );
        setFeedbackMessage({
          type: "success",
          text: `Player "${formData.name}" updated successfully!`,
        });
      } else {
        // Add new player
        await axios.post(`${API_BASE_URL}/admin/admin-players`, formPayload, {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
            withCredentials: true,
          }
        );
        setFeedbackMessage({
          type: "success",
          text: `Player "${formData.name}" added successfully!`,
        });
      }

      // Refresh player list
      const response = await axios.get(`${API_BASE_URL}/admin/admin-players`);
      setPlayers(response.data);
      setSelectedPlayer(null); // Clear selected player
      setFormData({
        name: "",
        email: "",
        phone: "",
        startingQuota: "",
        new_player: "",
        image: null,
      });
    } catch (error) {
      console.error("Error saving player:", error.message);
      setFeedbackMessage({
        type: "error",
        text: "Failed to save player. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedPlayer) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/admin-players/${selectedPlayer.id}`,
        {
          withCredentials: true, 
        }
      );
      setFeedbackMessage({
        type: "success",
        text: `Player "${selectedPlayer.name}" deleted successfully!`,
      });

      // Refresh player list
      const response = await axios.get(`${API_BASE_URL}/admin/admin-players`);
      setPlayers(response.data);
      setSelectedPlayer(null); // Clear selected player
      setFormData({
        name: "",
        email: "",
        phone: "",
        startingQuota: "",
        new_player: "",
        image: null,
      });
    } catch (error) {
      console.error("Error deleting player:", error.message);
      setFeedbackMessage({
        type: "error",
        text: "Failed to delete player. Please try again.",
      });
    }
  };

  return (
    <div>
      <Navbar />
        <PageHeader title="Admin: Manage Players" />
        <div className="max-w-3xl mx-auto px-4 py-8 bg-white shadow-md rounded-lg border border-gray-300">

          <h2 className="text-lg font-bold mb-4">
            {selectedPlayer ? "Edit Player" : "Add New Player"}
          </h2>

          {feedbackMessage && (
            <div
              className={`p-4 mb-4 rounded-lg ${
                feedbackMessage.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {feedbackMessage.text}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="playerSelector"
              className="block font-medium text-gray-700"
            >
              Select Player to Edit
            </label>
            <select
              id="playerSelector"
              onChange={handlePlayerChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              value={selectedPlayer?.id || ""}
            >
              <option value="">-- Add New Player --</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label
                htmlFor="startingQuota"
                className="block font-medium text-gray-700"
              >
                Starting Quota
              </label>
              <input
                type="number"
                id="startingQuota"
                name="startingQuota"
                value={formData.startingQuota}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="new_player"
                className="block font-medium text-gray-700"
              >
                New Player to Group?
              </label>
              <input
                type="checkbox"
                checked={formData.new_player}
                id="new_player"
                name="new_player"
                onChange={handleFormChange}
                // onChange={(e) => setIsMajor(e.target.checked)}
                className="form-checkbox text-blue-600"
              />
            </div>


            <div>
              <label htmlFor="image" className="block font-medium text-gray-700">
                Player Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFormChange}
                className="w-full"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                {selectedPlayer ? "Save Changes" : "Add Player"}
              </button>
              {selectedPlayer && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete Player
                </button>
              )}
            </div>
          </form>
        </div>
        <Footer />
      </div>
 
  );
};

export default AdminManagePlayerPage;
