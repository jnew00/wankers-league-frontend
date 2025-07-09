import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import { FaMoneyBillAlt } from "react-icons/fa";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';


const LeaderboardPage = () => {
  const [players, setPlayers] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "total_points",
    direction: "desc",
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showHistorical, setShowHistorical] = useState(false);
  const [onlyPaid, setOnlyPaid] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [latestUpdateTime, setLatestUpdateTime] = useState(null);
  const formatUpdatedText = (latestUpdateTime) => {
    return latestUpdateTime
      ? `Updated on: ${new Date(latestUpdateTime).toLocaleString()}`
      : "";
  };

  const getPlayerImageUrl = (player) => {
    const BASE_URL = API_BASE_URL.replace(/\/api$/, ""); // Remove /api from the end
    if (player.image_path) {
      // Construct the full URL using the base URL and the image path
      return `${BASE_URL}${player.image_path}`;
    }
    // Fallback to the placeholder image
    return `${BASE_URL}/uploads/players/placeholder.png`;
  };
  
  
  useEffect(() => {
    tippy('.paidToolTip',
    {
      content: 'Paid for the Season'
    });
  }, [players]);


  const handleTogglePaidPlayers = () => {
    setOnlyPaid(!onlyPaid);
  };

  const filteredPlayers = onlyPaid
  ? players.filter((player) => player.season_paid)
  : players;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/leaderboard`);
        setPlayers(response.data.leaderboard);
        setLatestUpdateTime(response.data.latest_update);

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
      const aValue = typeof a[key] === "number" ? a[key] : parseFloat(a[key]) || 0;
      const bValue = typeof b[key] === "number" ? b[key] : parseFloat(b[key]) || 0;
  
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  
    setPlayers(sortedPlayers);
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
        <PageHeader
          title="Leaderboard"
          updatedText={formatUpdatedText(latestUpdateTime)}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4">
      <label className="flex items-center cursor-pointer space-x-2">
          <span className={`pl-2 pb-1 font-medium ${onlyPaid ? "text-blue-600" : "text-gray-700"}`}>
            {onlyPaid ? "Only Paid" : "All Players"}
          </span>
          <div
            className={`relative w-12 h-6 ${
              onlyPaid ? "bg-blue-500" : "bg-gray-300"
            } rounded-full transition-colors duration-300`}
          >
            <input
              type="checkbox"
              checked={onlyPaid}
              onChange={handleTogglePaidPlayers}
              className="sr-only"
            />
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
                onlyPaid ? "translate-x-6" : "translate-x-0"
              }`}
            ></div>
          </div>
       </label>
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th className="p-2 text-center">Rank</th>
              <th className="p-2 text-center">Mugshot</th>
              <th
                className="p-2 text-left cursor-pointer"
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
                className="p-2 text-center cursor-pointer"
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
                className="p-2 text-center cursor-pointer"
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
                className="p-2 text-center cursor-pointer"
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
                className="p-2 text-center cursor-pointer"
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
                className="p-2 text-center cursor-pointer"
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
                className="p-2 text-center cursor-pointer"
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
                className="p-2 text-center cursor-pointer"
                onClick={() => handleSort("top_10")}
              >
                Top 10
                {sortConfig.key === "top_10"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="p-2 text-center cursor-pointer"
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
                className="p-2 text-center cursor-pointer"
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
            {filteredPlayers.map((player, index) => (
              <tr
              key={player.id || `player-${index}`}
                className={`${
                  index % 2 === 0 ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100 ${
                  isTop8(index) ? "border-l-4 border-yellow-400" : ""
                }`}
              >
                <td className="p-4 text-center font-semibold">{index + 1}</td>
                <td className="p-4 text-center">
                  <img  
                  src={(function() {
                    const url = getPlayerImageUrl(player, API_BASE_URL);
                    return url;
                  })()}
                    alt={player.name}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    onClick={() => {
                      setSelectedPlayer(player);
                    }}
                  />
                </td>
                <td className="p-4 text-left">
                  <div className="flex items-center space-x-2">
                    <span>{player.name}</span>
                    {player.season_paid && (
                      <FaMoneyBillAlt
                        className="text-green-500 paidToolTip"
                        title="Paid for Season"
                      />
                    )}
                  </div>
                </td>

                <td className="p-2 text-center">{player.current_quota}</td>
                <td className="p-2 text-center">${Number(player.money_won || 0).toFixed(2)}</td>
                <td className="p-2 text-center">{player.skins}</td>
                <td className="p-2 text-center">{player.ctps}</td>
                <td className="p-2 text-center">{player.wins}</td>
                <td className="p-2 text-center">{player.top_3}</td>
                <td className="p-2 text-center">{player.top_10}</td>
                <td className="p-2 text-center">{player.events_played}</td>
                <td className="p-2 text-center font-bold">
                  {Number(player.total_points || 0).toFixed(0)}
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
              Season Rank: #{selectedPlayer.rank || "N/A"}
            </div>

            {/* Player Information */}
            <div className="text-center mb-6">
              <img
                src={getPlayerImageUrl(selectedPlayer, API_BASE_URL)}
                alt="Profile"
                className="w-36 h-36 rounded-full mx-auto mb-4 cursor-pointer transition-transform transform hover:scale-105 hover:ring-2 hover:ring-blue-500"
                onClick={() =>    
                  setEnlargedImage(getPlayerImageUrl(selectedPlayer, API_BASE_URL))}
              />
              <h2 className="text-xl font-bold">{selectedPlayer.name}</h2>
              <p className="text-gray-500 text-sm">
                {selectedPlayer.email}
              </p>
              <p className="text-gray-500 text-sm">
                {selectedPlayer.phone_number}
              </p>
            </div>

            {/* Current Season Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">
                Current Season Stats
              </h3>
              <p>
                <strong>Events Played :</strong>{" "}
                {selectedPlayer.events_played || 0}
              </p>
              <p>
                <strong>Total Money Won:</strong> $
                {selectedPlayer.money_won || 0}
              </p>
              <p>
                <strong>Total CTPs:</strong> {selectedPlayer.ctps || 0}
              </p>
              <p>
                <strong>Total Skins:</strong> {selectedPlayer.skins || 0}
              </p>
              <p>
                <strong>Top 3 Finishes:</strong> {selectedPlayer.top_3 || 0}
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
                    {selectedPlayer.events_played || 0}
                  </p>
                  <p>
                    <strong>Total Money Won:</strong> $
                    {selectedPlayer.money_won || 0}
                  </p>
                  <p>
                    <strong>Total CTPs:</strong> {selectedPlayer.ctps || 0}
                  </p>
                  <p>
                    <strong>Total Skins:</strong> {selectedPlayer.skins || 0}
                  </p>
                  <p>
                    <strong>Top 3 Finishes:</strong> {selectedPlayer.top_3 || 0}
                  </p>
                  <p>
                    <strong>Top 10 Finishes:</strong> {selectedPlayer.top_10 || 0}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>



      )}
                {enlargedImage && (
            <Modal onClose={() => setEnlargedImage(null)}>
              <div className="flex justify-center items-center p-6">
                <img
                  src={enlargedImage}
                  alt="Enlarged"
                  className="max-w-full max-h-[90vh] rounded-lg shadow-lg hover:text-gray-700"

                />
              </div>
            </Modal>
          )}
      <Footer />
    </div>
    
  );
};

export default LeaderboardPage;
