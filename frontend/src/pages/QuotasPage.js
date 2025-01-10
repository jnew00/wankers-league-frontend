import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import axios from "axios";
import Footer from "../components/Footer";
import Select from "react-select";

const QuotasPage = () => {
  const currentYear = new Date().getFullYear().toString();
  const [quotas, setQuotas] = useState([]);
  const [filteredQuotas, setFilteredQuotas] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "current_quota",
    direction: "desc",
  });
  const [latestUpdateTime, setLatestUpdateTime] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch available years from the backend
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/quotas/years`
        );
        const years = response.data.years.map((year) => ({
          value: year.toString(),
          label: year.toString(),
        }));
        setAvailableYears([{ value: "All Time", label: "All Time" }, ...years]);
      } catch (error) {
        console.error("Error fetching years:", error.message);
      }
    };

    fetchYears();
  }, []);

  // Fetch quotas based on the selected season
  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        const startDate =
          selectedSeason === "All Time" ? null : `${selectedSeason}-01-01`;
        const endDate =
          selectedSeason === "All Time" ? null : `${selectedSeason}-12-31`;

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/quotas`,
          {
            params: { startDate, endDate },
          }
        );

        const processedQuotas = response.data.quotas.map((player) => ({
          name: player.player_name || "N/A",
          current_quota: player.current_quota || 0,
          previous_quota: player.previous_quota || 0,
          best_season_score: player.best_season_score || 0,
          season_average: parseFloat(player.season_average) || 0,
          date: new Date(player.date),
        }));

        setQuotas(processedQuotas);
        setFilteredQuotas(processedQuotas);
        setLatestUpdateTime(response.data.latest_update);
      } catch (error) {
        console.error("Error fetching quotas:", error.message);
      }
    };

    fetchQuotas();
  }, [selectedSeason]);

  const handleSeasonChange = (selectedOption) => {
    setSelectedSeason(selectedOption.value);
    const filteredData =
      selectedOption.value === "All Time"
        ? quotas
        : quotas.filter(
            (quota) =>
              quota.date >= new Date(`${selectedOption.value}-01-01`) &&
              quota.date <= new Date(`${selectedOption.value}-12-31`)
          );
    setFilteredQuotas(filteredData);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  };

  const sortedQuotas = [...filteredQuotas].sort((a, b) => {
    const { key, direction } = sortConfig;
    const aValue = a[key] ?? 0;
    const bValue = b[key] ?? 0;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Dynamic labels based on selected season
  const isAllTime = selectedSeason === "All Time";
  const scoreLabel = isAllTime
    ? "All Time Best Score"
    : `${selectedSeason} Best Score`;
  const averageLabel = isAllTime
    ? "All Time Average"
    : `${selectedSeason} Average`;

  // Custom styles for smaller select dropdown
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "32px",
      fontSize: "14px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "4px",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: "4px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "4px 8px",
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "14px",
      backgroundColor: state.isSelected ? "#cbd5e1" : "white",
      color: "black",
      "&:hover": {
        backgroundColor: "#e2e8f0",
      },
    }),
  };

  return (
    <div>
      <Navbar />
      <PageHeader
        title="Quotas Overview"
        updatedText={latestUpdateTime ? `Updated on: ${new Date(latestUpdateTime).toLocaleString()}` : ""}
      />
      <div className="max-w-7xl mx-auto px-4 py-1">
      <div className="flex items-center mb-4 space-x-2">
          <label htmlFor="season-selector" className="block text-lg font-medium">
            Select Season
            </label>
          <Select
            id="season-selector"
            options={availableYears}
            value={availableYears.find((option) => option.value === selectedSeason)}
            onChange={handleSeasonChange}
            className="w-28"
            styles={customStyles}
          />
         
        </div>
        <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th
                className="p-2 text-left cursor-pointer"
                onClick={() => handleSort("player_name")}
              >
                Name {sortConfig.key === "player_name" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-2 text-center cursor-pointer"
                onClick={() => handleSort("current_quota")}
              >
                Current Quota {sortConfig.key === "current_quota" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-2 text-center cursor-pointer"
                onClick={() => handleSort("previous_quota")}
              >
                Previous Quota {sortConfig.key === "previous_quota" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-2 text-center cursor-pointer"
                onClick={() => handleSort("best_season_score")}
              >
                {scoreLabel} {sortConfig.key === "best_season_score" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-2 text-center cursor-pointer"
                onClick={() => handleSort("season_average")}
              >
                {averageLabel} {sortConfig.key === "season_average" && (sortConfig.direction === "asc" ? "▲" : "▼")}
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
                <td className="p-4 text-center font-bold">{player.current_quota}</td>
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
      <Footer />
    </div>
  );
};

export default QuotasPage;
