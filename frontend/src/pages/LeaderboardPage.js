import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";

const LeaderboardPage = () => {
  const [players, setPlayers] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "total_points",
    direction: "desc",
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showHistorical, setShowHistorical] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leaderboard`);
        setPlayers(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error.message);
      }
    };
    fetchLeaderboard();
  }, [API_BASE_URL]);

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

  const handleImageClick = async (playerId) => {
    console.log("Player ID clicked:", playerId);
    if (!playerId) {
      console.error("Player ID is undefined.");
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/players/${playerId}`
      );
      setSelectedPlayer(response.data);
    } catch (error) {
      console.error("Error fetching player details:", error.message);
    }
  };

  const closeModal = () => {
    setSelectedPlayer(null);
  };

  const isTop8 = (index) =>
    sortConfig.key === "total_points" &&
    sortConfig.direction === "desc" &&
    index < 8;

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-start mb-4">
        <PageHeader title="Leaderboard" />
      </div>
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
                Name
                {sortConfig.key === "name"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("current_quota")}
              >
                Quota
                {sortConfig.key === "current_quota"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("money_won")}
              >
                Money
                {sortConfig.key === "money_won"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("skins")}
              >
                Skins
                {sortConfig.key === "skins"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("ctps")}
              >
                CTPs
                {sortConfig.key === "ctps"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("wins")}
              >
                Wins
                {sortConfig.key === "wins"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("top_3")}
              >
                Top 3
                {sortConfig.key === "top_3"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("events_played")}
              >
                Events
                {sortConfig.key === "events_played"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("total_points")}
              >
                Points
                {sortConfig.key === "total_points"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
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
                } hover:bg-blue-100 ${
                  isTop8(index) ? "border-l-4 border-yellow-400" : ""
                }`}
              >
                <td className="p-4 text-center font-semibold">{index + 1}</td>
                <td className="p-4 text-center">
                  <img
                    src={player.image_path || "/assets/players/placeholder.png"}
                    alt={player.name}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    onClick={() => handleImageClick(player.player_id)}
                  />
                </td>
                <td className="p-4 text-left">{player.name}</td>
                <td className="p-4 text-center">{player.current_quota}</td>
                <td className="p-4 text-center">${player.money_won}</td>
                <td className="p-4 text-center">{player.skins}</td>
                <td className="p-4 text-center">{player.ctps}</td>
                <td className="p-4 text-center">{player.wins}</td>
                <td className="p-4 text-center">{player.top_3}</td>
                <td className="p-4 text-center">{player.events_played}</td>
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
            {/* Rank */}
            <div className="absolute top-2 right-4 text-lg font-bold text-blue-600">
              Rank: #{selectedPlayer.rank || "N/A"}
            </div>

            {/* Player Information */}
            <div className="text-center mb-6">
              <img
                src={`http://localhost:4000${selectedPlayer.image_path}`}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-bold">{selectedPlayer.name}</h2>
              <p className="text-gray-500 text-sm">
                {selectedPlayer.email || "N/A"}
              </p>
              <p className="text-gray-500 text-sm">
                {selectedPlayer.phone_number || "N/A"}
              </p>
            </div>

            {/* Current Season Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">
                Current Season Stats
              </h3>
              <p>
                <strong>
                  <a
                    href="/past-events"
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    Events Played
                  </a>
                  :
                </strong>{" "}
                {selectedPlayer.currentSeasonStats.events_played || 0}
              </p>
              <p>
                <strong>Total Money Won:</strong> $
                {selectedPlayer.currentSeasonStats.total_money_won || 0}
              </p>
              <p>
                <strong>Total CTPs:</strong>{" "}
                {selectedPlayer.currentSeasonStats.total_ctps || 0}
              </p>
              <p>
                <strong>Total Skins:</strong>{" "}
                {selectedPlayer.currentSeasonStats.total_skins || 0}
              </p>
              <p>
                <strong>Total Places:</strong>{" "}
                {selectedPlayer.currentSeasonStats.total_places || 0}
              </p>
            </div>

            {/* Collapsible Historical Stats */}
            {/* Collapsible Historical Stats */}
            <div>
              <h3
                className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2 cursor-pointer flex items-center justify-between"
                onClick={() => setShowHistorical(!showHistorical)}
              >
                Historical Stats
                <span>{showHistorical ? "▼" : "►"}</span>
              </h3>
              {showHistorical && (
                <div className="mt-4">
                  <p>
                    <strong>Events Played:</strong>{" "}
                    {selectedPlayer.historicalStats.events_played || 0}
                  </p>
                  <p>
                    <strong>Total Money Won:</strong> $
                    {selectedPlayer.historicalStats.total_money_won || 0}
                  </p>
                  <p>
                    <strong>Total CTPs:</strong>{" "}
                    {selectedPlayer.historicalStats.total_ctps || 0}
                  </p>
                  <p>
                    <strong>Total Skins:</strong>{" "}
                    {selectedPlayer.historicalStats.total_skins || 0}
                  </p>
                  <p>
                    <strong>Total Places:</strong>{" "}
                    {selectedPlayer.historicalStats.total_places || 0}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LeaderboardPage;
