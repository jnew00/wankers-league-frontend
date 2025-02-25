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
import Footer from "../components/Footer";
import Swal from 'sweetalert2';
import { calculateMoneyWonAndPot } from '../utils/moneyUtils';





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
  const [remainingPot, setRemainingPot] = useState(0);
  const [ctpPot, setCtpPot] = useState(0);
  const [skinPot, setSkinPot] = useState(0);
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get("eventId"); // Get the eventId from the query string
  
  const handleOpenSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const handleCloseSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };

 

  useEffect(() => {
    players.forEach((player, index) => {
      if (typeof player.player_id === "undefined" || player.player_id === null) {
        console.error(`Player at index ${index} is missing a valid player_id:`, player);
      }
    });
  }, [players]);
  

  useEffect(() => {
    let isMounted = true; 
    const fetchPotValues = async () => {
      if (selectedEvent?.id) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/admin/events/${selectedEvent.id}/pots`
          );
          const { remainingPot, remainingSkinPot, remainingCtpPot } = response.data;

          if (isMounted) {
            setRemainingPot(remainingPot);
            setSkinPot(remainingSkinPot);
            setCtpPot(remainingCtpPot);
          }
        } catch (error) {
          console.error("Error fetching pot values:", error);
        }
      }
    };
  
    fetchPotValues();
  }, [selectedEvent]);
  


  
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

  const memoizedPlayers = useMemo(() => {
    return [...players].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [players]);
  

  const handleCloseEvent = async () => {
    if (!selectedEvent) {
      alert("No event selected.");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/events/${selectedEvent.id}/close`,
        {},
        { withCredentials: true }
      );

      setSelectedEvent((prev) => ({
        ...prev,
        isClosed: true,
      }));

      Swal.fire({
        icon: 'success',
        title: 'Event Closed!',
        text: 'The event has recorded successfully.',
        confirmButtonText: 'Great!',
      }).then(() => {
        navigate('/events'); 
      });

    } catch (error) {
      console.error("Error closing event:", error.message);
      setFeedbackMessage({
        type: "error",
        text: `Failed to close event. Please try again or contact Jason!`,
      });
    } finally {
      setIsSubmitModalOpen(false);
    }
  };


  const syncPlayersToDatabase = async (players, eventId) => {
    if (!players.length) return; // No updates needed
  
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/admin/events/${eventId}/players`,
        { players },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed to sync players to database:", error.message);
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
          const updatedPlayers = players.map((player) => {
            const calculatedQuota = calculateQuota(player.current_quota ?? 0, player.score ?? 0);
    
    
            return {
              player_id: player.player_id,
              name: player.name || "N/A",
              image: player.image_path || null,
              current_quota: player.current_quota ?? 0,
              score: player.score ?? 0,
              calculated_quota: calculatedQuota, // ✅ Ensure it's always set
              rank: player.rank || null,
              ctps: player.ctps || 0,
              skins: player.skins || 0,
              money_won: player.money_won || 0,
              total_points: player.total_points || 0,
              isEditing: false,
              manualMoneyOverride: false,
              new_player: player.new_player || false,
              events_played: player.events_played || 0,
              season_paid: player.season_paid,
            };
          });
    

          setPlayers((prevPlayers) => {


            return prevPlayers.length > 0 ? prevPlayers.map((player) => {
              const newPlayer = updatedPlayers.find((p) => p.player_id === player.player_id);
              return newPlayer ? { ...player, ...newPlayer } : player;
            }) : updatedPlayers;
          });
          
          
          
        } else {
          console.error("Unexpected format for players:", players);
        }
          setSelectedEvent({
          id: details.id,
          date: details.date,
          courseName: details.course_name,
          isMajor: details.is_major,
          isFedupEligible: details.fedup_eligible
        });
      } catch (error) {
        console.error("Error fetching event data:", error.message);
      }
    },
    [events]
  );
  

  useEffect(() => {
    if (eventId && players.length === 0) { // ✅ Prevents redundant calls
      handleEventChange(Number(eventId));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, players.length]);
  
  

  const handleCancelEdit = (playerId) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.player_id === playerId) {
          if (!player.backup) {
            console.warn(`No backup found for player with ID ${playerId}`);
            return { ...player, isEditing: false }; // Exit edit mode gracefully
          }
  
          return {
            ...player.backup, // Restore all fields from the backup
            isEditing: false, // Exit edit mode
            backup: undefined, // Clear the backup after restoring
          };
        }
        return player; // Return other players unchanged
      })
    );
  };
  

  const handleSavePlayer = async () => {
    try {
      // Prepare all players for syncing
      const playersToSync = players.map((player) => ({
        player_id: player.player_id,
        ctps: player.ctps || 0,
        current_quota: player.current_quota,
        calculated_quota: calculateQuota(player.current_quota, player.score),
        skins: player.skins || 0,
        money_won: player.money_won || 0,
        rank: player.rank || null,
        total_points: player.total_points || 0,
        score: player.score || 0,
      }));
  
      // Sync all players to the backend
      await syncPlayersToDatabase(playersToSync, selectedEvent.id);
  
      // Update local state to exit edit mode
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => ({
          ...player,
          isEditing: false, // Exit edit mode
        }))
      );
  
      setFeedbackMessage({
        type: "success",
        text: "All players updated successfully!",
      });
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: "Failed to save players. Please try again or contact Jason!",
      });
      console.error("Error saving players:", error.message);
    }
  };
  
  

  const handleDeletePlayer = async (playerId) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action will remove the player from the event.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
  
    // If the user cancels, exit the function
    if (!confirmDelete.isConfirmed) return;
  
    try {
      // Make the API call to delete the player
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/admin/events/${selectedEvent.id}/players/${playerId}`,
        {
          withCredentials: true,
        }
      );
  
      // Remove player from state and recalculate pots
      setPlayers((prevPlayers) => {
        const updatedPlayers = prevPlayers.filter(
          (player) => player.player_id !== playerId
        );
  
        // Recalculate pots and money won
        const {
          updatedPlayers: playersWithMoney,
          remainingPot,
          remainingSkinPot,
          remainingCtpPot,
        } = calculateMoneyWonAndPot(updatedPlayers, updatedPlayers.length);
  
        // Update pots
        setRemainingPot(remainingPot);
        setSkinPot(remainingSkinPot);
        setCtpPot(remainingCtpPot);
  
        return playersWithMoney;
      });
  
      // Provide success feedback
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `The player was removed successfully.`,
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      console.error("Error deleting player:", error);
  
      // Provide error feedback
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: 'Failed to delete player data. Please try again or contact Jason!',
        confirmButtonColor: '#3085d6',
      });
    }
  };
  
  
  const toggleEditMode = useCallback(
    (playerId) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.player_id === playerId
            ? {
                ...player,
                isEditing: !player.isEditing,
                // Add backup only when entering edit mode
                backup: player.isEditing
                  ? undefined // Clear backup when exiting edit mode
                  : { ...player, remainingPot, skinPot, ctpPot },
              }
            : player
        )
      );
    },
    [remainingPot, skinPot, ctpPot]
  );
  
  
  

  const handleAddPlayer = () => {
    setPlayers((prevPlayers) => [
      
      ...prevPlayers,
      {
        
        // player_id: `temp-${Date.now()}`,
        player_id: null,
        name: "",
        ctps: 0,
        score: null,
        skins: 0,
        money_won: 0,
        total_points: 0,
        rank: null,
        current_quota: 0,
        isEditing: true,
        new_player: false,
        events_played: 0,
        season_paid: false,
      },
      
    ]);
  };

  const handlePlayerChange = useCallback(
    (playerId, updates) => {
  
      if (!playerId && !updates.player_id) {
        console.error(
          "Invalid player_id: Both playerId and updates.player_id are missing."
        );
        return;
      }
  
      setPlayers((prevPlayers) => {

        let playerUpdated = false;
  
        // Update players by mapping through the array
        let updatedPlayers = prevPlayers.map((player) => {
          // Handle case for blank row update
          if (player.player_id === null && updates.player_id) {
            const selectedPlayer = allPlayers.find((p) => p.id === updates.player_id);
  
            if (!selectedPlayer) {
              console.error("Selected player not found in allPlayers:", updates.player_id);
              return player;
            }

            if (updates.score !== undefined) {
              const newScore = Number(updates.score) || 0;
              updates.calculated_quota = calculateQuota(player.current_quota, newScore);
            }
  
            playerUpdated = true;
  
            return {
              ...player,
              player_id: selectedPlayer.id,
              name: selectedPlayer.name,
              current_quota: selectedPlayer.current_quota || 0,
              new_player: selectedPlayer.new_player,
              events_played: selectedPlayer.events_played,
              score: 0, // Default for new players
              rank: null,
              isEditing: true, // Allow immediate editing
              calculated_quota: calculateQuota(selectedPlayer.current_quota, 0), 
              season_paid: selectedPlayer.season_paid,             
            };
            
          }

          // Handle updates for existing players
          if (player.player_id === playerId || (player.player_id === null && updates.player_id)) {
            playerUpdated = true;
  

            const updatedPlayer = {
              ...player,
              ...updates,
              player_id: updates.player_id || player.player_id, // Replace temp ID if updates.player_id exists
              ...(updates.money_won !== undefined && { manualMoneyOverride: true }),
            };
  
            // Only recalculate total_points if not manually overridden
            if (!updatedPlayer.manualMoneyOverride) {
              updatedPlayer.total_points = calculateTotalPoints(
                updatedPlayer,
                pointsConfig,
                selectedEvent?.isMajor,
                selectedEvent?.isFedupEligible,
                prevPlayers
              );
            }
       
            return updatedPlayer;
          }
  
          return player; // Return unchanged player
        });
  
        if (!playerUpdated) {
          console.error("No matching player or blank row found to update for playerId:", playerId);
          return prevPlayers;
        }
    

              // Recalculate total_points for all players
      updatedPlayers = updatedPlayers.map((player) => ({
        ...player,
        total_points: calculateTotalPoints(
          player,
          pointsConfig,
          selectedEvent?.isMajor,
          selectedEvent?.isFedupEligible,
          updatedPlayers // Use the updated players array
        ),
      }));

        // Recalculate pots and return updated state
        const {
          updatedPlayers: playersWithMoney,
          remainingPot,
          remainingSkinPot,
          remainingCtpPot,
        } = calculateMoneyWonAndPot(updatedPlayers, updatedPlayers.length);
  
  
        setRemainingPot(remainingPot);
        setSkinPot(remainingSkinPot);
        setCtpPot(remainingCtpPot);
  
        return playersWithMoney;
      });
    },
    [allPlayers, pointsConfig, selectedEvent?.isMajor, selectedEvent?.isFedupEligible]
  );
  


  const savePointsConfig = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/admin/points/config`,
        pointsConfig,
        {
          withCredentials: true, // Correct placement
        }
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
              ctpPot={ctpPot}
              skinPot={skinPot}
              remainingPot={remainingPot}
            />
          )}
            <button
              className="bg-green-500 hover:bg-green-600 text-white text-right px-4 py-2 rounded-lg"
              onClick={handleOpenSubmitModal}
            >
              Close Event
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
        <Modal onClose={handleCloseSubmitModal} className="max-w-7xl mx-auto">
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
              <div className="relative max-w-6xl w-full bg-white p-6 rounded-lg shadow-lg">


            <h2 className="text-lg font-bold mb-4">Review Results</h2>
            <table className="w-full min-w-full bg-white table-auto">
              <thead>
                <tr>
                 <th className="text-left py-2 px-4 whitespace-nowrap">Place</th>
                  <th className="text-left py-2 px-4 whitespace-nowrap">Name</th>
                  <th className="text-center py-2 px-4 whitespace-nowrap">Score</th>
                  <th className="text-center py-2 px-4 whitespace-nowrap">CTPs</th>
                  <th className="text-center py-2 px-4 whitespace-nowrap">Skins</th>
                  <th className="text-center py-2 px-4 whitespace-nowrap">Money Won</th>
                  <th className="text-center py-2 px-4 whitespace-nowrap">Total Points</th>
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
                      {Number(player.total_points).toFixed(0)}
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
          </div>
        </Modal>
      )}
        <Footer />
    </div>
  );
  
};

export default AdminPage;
