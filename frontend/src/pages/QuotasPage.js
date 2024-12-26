import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import axios from "axios";

const QuotasPage = () => {
  const [quotas, setQuotas] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "current_quota", // Default sort column
    direction: "desc", // Default sort direction
  });
  const [latestUpdateTime, setLatestUpdateTime] = useState(null);
  const formatUpdatedText = (latestUpdateTime) => {
    return latestUpdateTime
      ? `Updated on: ${new Date(latestUpdateTime).toLocaleString()}`
      : "";
  };

  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/quotas`
        );

        const processedQuotas = response.data.quotas.map((player) => ({
          name: player.player_name || "N/A",
          current_quota: player.current_quota || 0,
          previous_quota: player.previous_quota || 0,
          best_season_score: player.best_season_score || 0,
          season_average: parseFloat(player.season_average) || 0,
        }));

        setQuotas(processedQuotas);
        setLatestUpdateTime(response.data.latest_update);
      } catch (error) {
        console.error("Error fetching quotas:", error.message);
      }
    };

    fetchQuotas();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  };

  const sortedQuotas = [...quotas].sort((a, b) => {
    const { key, direction } = sortConfig;

    // Ensure the values are valid for sorting
    const aValue = a[key] ?? 0;
    const bValue = b[key] ?? 0;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Fallback for string sorting
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <Navbar />
      <PageHeader
        title="Quotas Overview"
        updatedText={formatUpdatedText(latestUpdateTime)}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th
                className="p-4 text-left cursor-pointer"
                onClick={() => handleSort("player_name")}
              >
                Name{" "}
                {sortConfig.key === "player_name" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("current_quota")}
              >
                Current Quota{" "}
                {sortConfig.key === "current_quota" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("previous_quota")}
              >
                Previous Quota{" "}
                {sortConfig.key === "previous_quota" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("best_season_score")}
              >
                Best Season Score{" "}
                {sortConfig.key === "best_season_score" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("season_average")}
              >
                Season Average{" "}
                {sortConfig.key === "season_average" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedQuotas.map((player, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100 border-b`}
              >
                <td className="p-4 text-left">{player.name}</td>
                <td className="p-4 text-center font-bold">
                  {player.current_quota}
                </td>
                <td className="p-4 text-center">{player.previous_quota}</td>
                <td className="p-4 text-center">{player.best_season_score}</td>
                <td className="p-4 text-center">
                  {typeof player.season_average === "number"
                    ? player.season_average.toFixed(2)
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotasPage;
