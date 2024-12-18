import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal"; // Ensure this component exists

const LeaderboardPage = () => {
  const [players, setPlayers] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "total_points",
    direction: "desc",
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Fetch leaderboard data from the backend
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/leaderboard"
        );
        setPlayers(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, []);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedPlayers = [...players].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setPlayers(sortedPlayers);
  };

  // Handle image click to show modal
  const handleImageClick = async (playerId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/player/${playerId}`
      );
      setSelectedPlayer(response.data);
    } catch (error) {
      console.error("Error fetching player details:", error);
    }
  };

  // Close the modal
  const closeModal = () => {
    setSelectedPlayer(null);
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Leaderboard" />
      <div className="max-w-7xl mx-auto px-4">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th className="p-4 text-center">Rank</th>
              <th className="p-4 text-center">Picture</th>
              <th
                className="p-4 text-left cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortConfig.key === "name"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("current_quota")}
              >
                Quota{" "}
                {sortConfig.key === "current_quota"
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
                onClick={() => handleSort("participation_points")}
              >
                Participation Points{" "}
                {sortConfig.key === "participation_points"
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
                onClick={() => handleSort("placed_points")}
              >
                Placed Points{" "}
                {sortConfig.key === "placed_points"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("total_points")}
              >
                Total Points{" "}
                {sortConfig.key === "total_points"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={player.id}
                className={`${
                  index % 2 === 0 ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100 border-b ${
                  sortConfig.key === "total_points" &&
                  sortConfig.direction === "desc" &&
                  index === 7
                    ? "border-b-4 border-black"
                    : ""
                }`}
              >
                <td className="p-4 text-center font-semibold">{index + 1}</td>
                <td className="p-4 text-center">
                  <img
                    src={`http://localhost:4000${player.image_path}`}
                    alt={player.name}
                    className="w-8 h-8 rounded-full cursor-pointer"
                    onClick={() => handleImageClick(player.id)}
                  />
                </td>
                <td className="p-4 text-left">{player.name}</td>
                <td className="p-4 text-center">{player.current_quota}</td>
                <td className="p-4 text-center">${player.money_won}</td>
                <td className="p-4 text-center">
                  {player.participation_points}
                </td>
                <td className="p-4 text-center">{player.skins}</td>
                <td className="p-4 text-center">{player.placed_points}</td>
                <td className="p-4 text-center font-bold">
                  {player.total_points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPlayer && (
        <Modal onClose={closeModal}>
          <div className="relative p-6">
            <div className="absolute top-2 right-4 text-lg font-bold text-blue-600">
              Rank: #{selectedPlayer.rank}
            </div>
            <div className="text-center mb-6">
              <img
                src={`http://localhost:4000${selectedPlayer.image_path}`}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-bold">{selectedPlayer.name}</h2>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Contact Information
              </h3>
              <p>
                <strong>Email:</strong> {selectedPlayer.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedPlayer.phone_number || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Player Stats
              </h3>
              <p>
                <strong>Current Quota:</strong> {selectedPlayer.current_quota}
              </p>
              <p>
                <strong>Average Quota (Last 10):</strong>{" "}
                {selectedPlayer.averageQuota || "N/A"}
              </p>
              <p>
                <strong>Total Points:</strong> {selectedPlayer.total_points}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LeaderboardPage;
