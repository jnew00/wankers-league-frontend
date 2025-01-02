import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import PointsAllocation from "../components/PointsAllocation";
import EventSelector from "../components/EventSelector";
import PlayerList from "../components/PlayerList";
import { labelMapping } from "../components/PointsAllocation";
import { calculateTotalPoints, MAJOR_MULTIPLIER } from "../utils/pointsUtils";
import calculateQuota from "../utils/calculateQuota";
import Modal from "../components/Modal"; 
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
  const location = useLocation();
  const navigate = useNavigate();
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);


  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get("eventId"); // Get the eventId from the query string
  
  const handleOpenSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const handleCloseSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [eventsRes, pointsConfigRes, allPlayersRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/admin/events?type=upcoming`),
          axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/admin/points/config`
          ),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/players`),
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
  
        setAllPlayers(allPlayersRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error.message);
      }
    };
  
    fetchInitialData();
  }, []);
  
  const memoizedAllPlayers = useMemo(() => allPlayers, [allPlayers]);
  const memoizedPlayers = useMemo(() => players, [players]);

  const handleCloseEvent = async () => {
    if (!selectedEvent) {
      alert("No event selected.");
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/admin/events/${selectedEvent.id}/close`,
        { closed: true }
      );

      setSelectedEvent((prev) => ({
        ...prev,
        isClosed: true,
      }));

      alert("Event successfully closed!");
      navigate("/events");
    } catch (error) {
      console.error("Error closing event:", error.message);
      alert("Failed to close event. Please try again.");
    } finally {
      setIsSubmitModalOpen(false);
    }
  };

  const handleEventChange = useCallback(
    async (eventId) => {
      const selected = events.find((e) => e.id === eventId);
      if (!selected) {
        console.error("Event not found");
        return;
      }
  
      try {
        const eventResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/admin/events/${eventId}`
        );
  
        const { players = [], details } = eventResponse.data;
  
        if (Array.isArray(players)) {
          setPlayers(
            players.map((player) => ({
              player_id: player.player_id,
              name: player.name || "N/A",
              image: player.image_path || null,
              quota: player.quota || 0,
              score: player.score || 0,
              rank: player.rank || null,
              ctps: player.ctps || 0,
              skins: player.skins || 0,
              money_won: player.money_won || 0,
              total_points: player.total_points || 0,
              isEditing: false,
            }))
          );
        } else {
          console.error("Unexpected format for players:", players);
        }
  
        setSelectedEvent({
          id: details.id,
          date: details.date,
          courseName: details.course_name,
          isMajor: details.is_major,
        });
      } catch (error) {
        console.error("Error fetching event data:", error.message);
      }
    },
    [events]
  );
  

  useEffect(() => {
    if (eventId) {
      handleEventChange(Number(eventId)); // Convert to number if necessary
    }
  }, [eventId, handleEventChange]);

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

      const calculatedQuota = calculateQuota(player.quota, player.score);

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/admin/events/${selectedEvent.id}/player/${player.player_id}`,
        {
          ctps: player.ctps || 0,
          skins: player.skins || 0,
          moneyWon: player.money_won || 0,
          rank: player.rank || null,
          totalPoints: player.total_points || 0,
          score: player.score || 0,
          previousQuota: player.quota,
          calculatedQuota
        }
      );

   
      setPlayers((prevPlayers) =>
        prevPlayers.map((p, i) =>
          i === index ? { ...p, isEditing: false } : p
        )
      );

      setFeedbackMessage({
        type: "success",
        text: `Player "${player.name}" updated successfully!`,
      });

    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: "Failed to save player data. Please try again or contact Jason!",
      });
      console.error("Error saving player data:", error.message);
    }
  };

  const handleDeletePlayer = async (index, playerId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/admin/events/${selectedEvent.id}/players/${playerId}`
      );
      setPlayers((prevPlayers) => prevPlayers.filter((_, i) => i !== index));

      setFeedbackMessage({
        type: "success",
        text: `Player deleted successfully!`,
      });
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: "Failed to delete player data. Please try again or contact Jason!",
      });
    }
  };

  const toggleEditMode = useCallback((index) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      updatedPlayers[index] = {
        ...updatedPlayers[index],
        isEditing: !updatedPlayers[index].isEditing,
      };
      return updatedPlayers;
    });
  }, []);

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
        quota: 0,
        isEditing: true,
      },
    ]);
  };

  const handlePlayerChange = useCallback(
    (index, field, value) => {
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
    },
    [pointsConfig, selectedEvent?.isMajor] // Only recalculate if these dependencies change
  );

  const savePointsConfig = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/admin/points/config`,
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
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };
  const handleHover = debounce((hovering) => setIsHovering(hovering), 200);

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
      <PageHeader title="Admin: Record Results" />
      <div className="max-w-7xl mx-auto px-4 py-8 flex relative">
        <div className="flex-1 bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
          <div
            className="absolute -top-12 right-0 group"
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
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

          </div>
          <EventSelector
            events={events}
            selectedEvent={selectedEvent}
            handleEventChange={handleEventChange}
          />
          {selectedEvent?.isMajor && (
            <div className="bg-yellow-300 text-yellow-800 text-sm font-semibold rounded-lg px-2 py-1 mt-2 inline-block">
              Major Event
            </div>
          )}
          {selectedEvent && (
            <PlayerList
              players={memoizedPlayers}
              toggleEditMode={toggleEditMode}
              handlePlayerChange={handlePlayerChange}
              handleDeletePlayer={handleDeletePlayer}
              handleSavePlayer={handleSavePlayer}
              allPlayers={memoizedAllPlayers}
              selectedEvent={selectedEvent}
              handleAddPlayer={handleAddPlayer}
              handleCancelEdit={handleCancelEdit}
            />
          )}
            <button
              className="bg-green-500 hover:bg-green-600 text-white text-right px-4 py-2 rounded-lg"
              onClick={handleOpenSubmitModal}
            >
              Submit
            </button>
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
  
      {isSubmitModalOpen && (
        <Modal onClose={handleCloseSubmitModal}>
          <div>
            <h2 className="text-lg font-bold mb-4">Review Results</h2>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                 <th className="text-left py-2 px-4">Place</th>
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-center py-2 px-4">Score</th>
                  <th className="text-center py-2 px-4">CTPs</th>
                  <th className="text-center py-2 px-4">Skins</th>
                  <th className="text-center py-2 px-4">Money Won</th>
                  <th className="text-center py-2 px-4">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {memoizedPlayers.map((player) => (
                  <tr key={player.player_id}>
                    <td className="text-center py-2 px-4">{player.rank}</td>
                    <td className="text-center py-2 px-4">{player.name}</td>
                    <td className="text-center py-2 px-4">{player.score}</td>
                    <td className="text-center py-2 px-4">{player.ctps}</td>
                    <td className="text-center py-2 px-4">{player.skins}</td>
                    <td className="text-center py-2 px-4">
                      ${Number(player.money_won).toFixed(2)}
                    </td>
                    <td className="text-center py-2 px-4">
                      {player.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4 space-x-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={handleCloseSubmitModal}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                onClick={handleCloseEvent}
              >
                Close Event
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
  
};

export default AdminPage;
