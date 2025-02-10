import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import CourseModal from "../components/CourseModal";
import PairingsModal from "../components/PairingsModal";
import EventDetailsImage from "../components/EventDetailsImage";
import EventDailyImage from "../components/EventDailyImage";
import ImageModal from "../components/ImageModal";
import ScorecardSheet from "../components/ScoreCardSheet";
import { useUser } from "../context/UserContext";
import Footer from "../components/Footer";
import { formatTime } from "../utils/formatTime";
import PayoutTablePrint from "../components/PayoutTablePrint";
import EventWeather from "../components/EventWeather";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import dayjs from "dayjs";



tippy('.Xtooltip', {
  content: 'Remove',
});

const EventsPage = () => {
  const { hasRole } = useUser();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [fedupEvents, setFedupEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState({});
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [eventPlayers, setEventPlayers] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPairingsModal, setShowPairingsModal] = useState(false);
  const [pairings, setPairings] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false); // Image modal visibility
  const eventDetailsRef = useRef(null);
  const eventDailyEmailRef = useRef(null);
  const [scorecard, setScorecard] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [loadingEventDetails, setLoadingEventDetails] = useState(false); // Add loading state


  useEffect(() => {
  }, [pairings]);

  useEffect(() => {
  }, [eventPlayers]);

  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/events`);

        const upcoming = response.data.filter((event) => !event.closed);
        const past = response.data.filter((event) => event.closed && !event.fedup_eligible);
        const fedupEvents = response.data.filter((event) => event.closed && event.fedup_eligible);

        const sortedUpcoming = [...upcoming].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
        const sortedPast = [...past].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
        const sortedFedupEvents = [...fedupEvents].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

         
        setUpcomingEvents(sortedUpcoming);
        setPastEvents(sortedPast);
        setFedupEvents(sortedFedupEvents);
         
        
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };
  
    
    const fetchAllPlayers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/players`);
        setAllPlayers(response.data);
      } catch (error) {
        console.error("Error fetching players:", error.message);
      }
    };

    fetchEvents();
    fetchAllPlayers();
  }, [API_BASE_URL]);


  const availablePlayers = (allPlayers || []).filter(
    (player) => !(eventPlayers || []).some((eventPlayer) => eventPlayer.player_id === player.id)
  );
  
  
  const handleGenerateImage = async () => {
    if (!eventDetailsRef.current) {
      console.error("Ref is not set. Ensure EventDetailsImage is rendered.");
      return;
    }
    try {
      const imageData = await eventDetailsRef.current.generateImage();
      setGeneratedImage(imageData);
      setShowImageModal(true);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const handleGenerateDailyImage = async () => {
    if (!eventDailyEmailRef.current) {
      console.error("Ref is not set. Ensure EventDetailsImage is rendered.");
      return;
    }
    try {
      const imageData = await eventDailyEmailRef.current.generateImage();
      setGeneratedImage(imageData);
      setShowImageModal(true);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };
  

  const closeImageModal = () => {
    setGeneratedImage(null);
    setShowImageModal(false); // Close the image modal
  };

  const savePairings = async (updatedPairings) => {
    try {
      await axios.post(`${API_BASE_URL}/pairings/${selectedEvent}`, { pairings: updatedPairings }, 
      {
        withCredentials: true, 
      });
      setPairings(updatedPairings);
    } catch (error) {
      console.error("Error saving pairings:", error.message);
      setFeedbackMessage({
        type: "error",
        text: `Failed to save pairings.`,
      });
    }
  };

  const addPlayerToPairings = async (newPlayer) => {
    const updatedPairings = [...pairings];


    let targetGroupIndex = -1;
    for (let i = updatedPairings.length - 1; i >= 0; i--) {
      if (updatedPairings[i].length < 4) {
        targetGroupIndex = i;
        break;
      }
    }
  
  
    if (targetGroupIndex !== -1) {
      // Add the player to the first group with space
      updatedPairings[targetGroupIndex].push(newPlayer);
    } else {
      // Create a new group if all groups are full
      updatedPairings.push([newPlayer]);
    }

    setPairings(updatedPairings);
  

    try {
      await axios.post(`${API_BASE_URL}/pairings/${selectedEvent}`, {
        pairings: updatedPairings,
      },
      {
        withCredentials: true,
      });

    } catch (error) {
      console.error("Error updating pairings in the database:", error.message);
    }
  };
  

  const openPairingsModal = () => {
    if (!eventPlayers || eventPlayers.length === 0) {
      alert("No players signed up for this event.");
      return;
    }
  
    const shuffledPlayers = [...eventPlayers].sort(() => Math.random() - 0.5);
    const newPairings = [];
    let i = 0;
  

    while (i < shuffledPlayers.length) {
      const remaining = shuffledPlayers.length - i;
  
      if (remaining >= 4 && (remaining % 4 === 0 || remaining % 4 >= 3)) {
        // Create a group of 4 if it fits
        newPairings.push(shuffledPlayers.slice(i, i + 4));
        i += 4;
      } else if (remaining >= 3) {
        // Create a group of 3 if 4 doesn't fit
        newPairings.push(shuffledPlayers.slice(i, i + 3));
        i += 3;
      } else {
        // Handle remaining players (<3 players left)
        newPairings.push(shuffledPlayers.slice(i));
        break;
      }
    }


  // Reorder pairings: Groups of 3 first, then groups of 4
  const reorderedPairings = [
    ...newPairings.filter((group) => group.length === 3),
    ...newPairings.filter((group) => group.length === 4),
  ];
  
    setPairings(reorderedPairings);
    setShowPairingsModal(true);
  };
  
  
  
  const closePairingsModal = () => {
    setShowPairingsModal(false);
  };

  const fetchEventDetails = async (eventId) => {
    setLoadingEventDetails(true); 
    try {

      // Fetch the event details from the API
      const response = await axios.get(`${API_BASE_URL}/admin/events/${eventId}`);
      const event = response.data;


      setEventDetails({
        ...event.details, 
        scorecard:event.scorecard, 
        teeTime: event.details?.tee_time,
        numTimes: event.details?.num_teetimes,
        total_yardage: event.total_yardage, 
        group_pairings: response.data.group_pairings,
      });
  

      const normalizedPlayers = event.players
      .map((player) => ({
        ...player,
        quota: player.player_quota || player.current_quota, // Normalize quota field
        scoreDiff: (player.score - player.event_quota), // Calculate score - quota
      
      }));
    
      if (upcomingEvents.some((event) => event.id === eventId)) {
        // Sort alphabetically for upcoming events
        setEventPlayers(normalizedPlayers.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        // Sort by score difference for past events
        setEventPlayers(normalizedPlayers.sort((a, b) => b.scoreDiff - a.scoreDiff));
      }

      setEventPlayers(normalizedPlayers);
      setScorecard(event.scorecard);

      const pairingsResponse = await axios.get(`${API_BASE_URL}/pairings/${eventId}`);
      setPairings(pairingsResponse.data || []); // Load pairings if they exist
  
    } catch (error) {
      console.error("Error fetching event details:", error.message);
      alert("Failed to load event details. Please try again.");
    }  finally {
       setLoadingEventDetails(false); 
    }
  };
  
  const handleDeletePlayer = async (playerId, playerName) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/events/${selectedEvent}/players/${playerId}`,{
        withCredentials: true,
      });
     
       setEventPlayers((prevPlayers) => {
        const updatedPlayers = prevPlayers.filter((player) => player.player_id !== playerId);
        return updatedPlayers.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Remove player from pairings
      const updatedPairings = pairings
      .map((group) => group.filter((player) => player.player_id !== playerId))
      .filter((group) => group.length > 0); // Remove empty groups

    setPairings(updatedPairings);

     // Save updated pairings to the database
     await savePairings(updatedPairings);

     setFeedbackMessage({
      type: "success",
      text: `Player ${playerName} removed from event.`,
    });

    } catch (error) {
      console.error("Error deleting player:", error.message);
      setFeedbackMessage({
        type: "error",
        text: `Failed to remove player.`,
      });
    }
  };

  const closeModal = () => {
    setSelectedCourseDetails(null);
    setShowModal(false);
  };

  const handleViewCourse = async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/courses/${courseId}`);
      setSelectedCourseDetails(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching course details:", error.message);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedPlayer || !selectedEvent) {
      alert("Please select a player to add.");
      return;
    }
  
    try {
      // Add the player to the event in the database
      const response = await axios.post(`${API_BASE_URL}/admin/events/${selectedEvent}/players`, {
        playerId: selectedPlayer,
      },
      {
        withCredentials: true, 
      });
  
      const newPlayer = response.data;
  
      const normalizedPlayer = {
        ...newPlayer,
        player_id: newPlayer.id,
        quota: newPlayer.current_quota
      };
  
      if (!normalizedPlayer.name || !normalizedPlayer.player_id) {
        console.error("New player data is incomplete:", normalizedPlayer);
        return;
      }

      setEventPlayers((prevPlayers) => {
        const updatedPlayers = [...prevPlayers, normalizedPlayer];
        return updatedPlayers.sort((a, b) => a.name.localeCompare(b.name));
      });


      if (pairings.length > 0) {
        await addPlayerToPairings(normalizedPlayer);
      }
  
      setSelectedPlayer("");

      setFeedbackMessage({
        type: "success",
        text: `Player "${normalizedPlayer.name}" added successfully!`,
      });
    } catch (error) {
      console.error("Error adding player:", error.message);
      setFeedbackMessage({
        type: "error",
        text: `Failed to add player. Please try again.`,
      });
     
    }
  };

  const clearPairings = async () => {
    try {
      // Reset pairings in the backend
      await axios.post(`${API_BASE_URL}/pairings/${selectedEvent}`, { pairings: [] },
        {
          withCredentials: true, 
        }
      );
  
      // Clear pairings in the frontend
      setPairings([]);
      setFeedbackMessage({
        type: "success",
        text: `Pairings cleared successfully!`,
      });
    } catch (error) {
      console.error("Error clearing pairings:", error.message);
      setFeedbackMessage({
        type: "error",
        text: `Failed to clear pairings`,
      });
    }
  };
  
  

  const toggleEventDetails = (eventId) => {
    if (selectedEvent === eventId) {
      setSelectedEvent(null);
      setEventDetails({});
      setEventPlayers([]);
      return;
    }

    setSelectedEvent(eventId);
    fetchEventDetails(eventId);
  };


  return (
    <div>
      <Navbar />
      <PageHeader title="Events" />
      <div className="max-w-7xl mx-auto px-4">
  
        {/* Upcoming Events Section */}
        <div className="upcoming-section py-6 px-4 rounded-lg shadow-md bg-blue-50 mb-16">
          <h2 className="text-2xl font-bold border-b-4 border-blue-600 inline-block mb-4">
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500">No upcoming events available.</p>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className={`border border-gray-300 rounded-lg mb-4 shadow-md ${
                  event.is_major ? "bg-yellow-50" : ""
                }`}
              >
                <div
                className="relative cursor-pointer font-bold text-lg py-2 px-4 bg-gray-50 hover:bg-blue-50 hover:shadow-md transition-colors duration-200 flex justify-between items-center border border-gray-300 hover:border-blue-500"
                onClick={() => toggleEventDetails(event.id)}
                >
                  <div className="flex items-center">
                    <span className="pr-2">
                    {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      })} 
                    </span>
                    <span className="text-red-600 pr-1">{formatTime(event.tee_time)}</span> - {" "}
                      {event.course_name}
                   
                    {event.is_major && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                        Major
                      </span>
                    )}
                      {!event?.fedup_eligible && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                          Non-FedUp Eligible
                        </span>
                         )}
                  </div>
                  <div className="flex items-center space-x-2 text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                </div>

                {selectedEvent === event.id && (
  <div className="mt-4 p-6 bg-white rounded-lg shadow-lg">


<div className="flex items-center justify-between">
<div
  className={`p-2 rounded-lg transition-all duration-300 h-10 ${
    feedbackMessage
      ? feedbackMessage.type === "success"
        ? "bg-green-100 text-green-800 opacity-100 visible"
        : "bg-red-100 text-red-800 opacity-100 visible"
      : "opacity-0 invisible"
  }`}
>
  {feedbackMessage?.text || ""}
</div>


          {/* Weather Component */}
          {!loadingEventDetails && eventDetails && eventDetails.teeTime && eventDetails.latitude && eventDetails.longitude ? (
  <EventWeather
    latitude={eventDetails.latitude}
    longitude={eventDetails.longitude}
    date={eventDetails.date}
    teeTime={eventDetails.teeTime}
  />
) : (
  <p>Loading weather...</p>
)}
          

          </div>
<div className="flex justify-between items-center mb-4">

<div>
    <h3 className="text-xl font-bold mb-4 text-blue-600">1<sup>st</sup> Tee Time of {eventDetails.numTimes} booked: 
      <span className="text-red-600 pl-1">{formatTime(eventDetails.teeTime)}</span><br />
      <span className="italic text-gray-600 ">${Number(eventDetails.cost).toFixed(2)}</span>

    </h3>


   
</div>

  
                

</div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      
      <div>
        <p className="text-gray-700">
        <span className="font-semibold">Course:</span>{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => handleViewCourse(eventDetails.course_id)}
          >
            {eventDetails.course_name}
          </span>        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Address:</span>{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              eventDetails.course_address
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {eventDetails.course_address}
          </a>
        </p>
        <p className="text-gray-700">
        <span className="font-semibold">Notes:</span>{" "}
          <span>
            {eventDetails.notes}
          </span>        
        </p>
      </div>
      <div>






        <p className="text-gray-700">
          <span className="font-semibold">Tees:</span> {eventDetails.front_tee} /{" "}
          {eventDetails.back_tee}
          <br />
          <span className="text-gray-700">
            <span className="font-semibold">Total Yardage:</span>{" "}
            {eventDetails.total_yardage} yards
          </span>
        </p>
      </div>
    </div>






    
    <div className="flex flex-wrap lg:flex-nowrap gap-4 mt-6 items-start">
  {/* Left: Player List */}
  <div className="flex-1">
    <h3 className="text-lg font-bold text-gray-700 mb-2">Wankers Signed Up</h3>
    <table className="table-auto border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-1 text-left">#</th>
          <th className="border p-1 text-left">Name</th>
          <th className="border p-1 text-left">Quota</th>
          <th className="border p-1 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {eventPlayers.map((player, index) => (
          <tr key={player.player_id}>
            <td className="border p-1">{index + 1}</td>
            <td className="border p-1">{player.name}</td>
            <td className="border p-1">{player.quota}</td>
            <td className="border p-1 text-right">
              <button
                onClick={() => handleDeletePlayer(player.player_id, player.name)}
                className="Xtooltip bg-red-500 text-white hover:bg-red-700 font-bold w-5 h-5 flex items-center justify-center rounded border border-red-700"
              >
                X
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Middle: Pairings Table */}
  <div className="flex-1">
    {pairings.length > 0 && (
      <>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Pairings</h3>
        <table className="table-auto border-collapse w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {pairings.map((_, index) => (
                <th key={index} className="border p-2 text-center">
                  Group {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(...pairings.map((g) => g.length)) }).map(
              (_, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  {pairings.map((group, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className="border p-2 text-center"
                    >
                      {group[rowIndex] ? group[rowIndex].name : ""}
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </>
    )}
  </div>

  {/* Right: Admin Actions */}
  {(hasRole("admin") || hasRole("moderator")) && (
   
    <div className="flex-1">
       <h3 className="text-lg font-bold text-gray-700 mb-2">Admin Actions</h3>
      {/* <h4 className="text-lg font-bold text-center mb-4">Admin Actions</h4> */}
      <div className="space-y-4 bg-gray-100 p-4 rounded-lg shadow-lg w-64">
      {hasRole("admin") && (
        <>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
          onClick={async () => {
            const response = await axios.get(`${API_BASE_URL}/pairings/${selectedEvent}`);
            const existingPairings = response.data;

            if (existingPairings.length > 0) {
              setPairings(existingPairings); // Load existing pairings
            } else {
              openPairingsModal(); // Generate new pairings
            }

            setShowPairingsModal(true);
          }}
        >
          {pairings.length > 0 ? "Update Pairings" : "Generate Pairings"}
        </button>

        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg w-full"
          onClick={clearPairings}
        >
          Clear Pairings
        </button>

        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full"
          onClick={handleGenerateImage}
        >
          Generate Email
        </button>


    
        
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg w-full"
          onClick={() =>
            navigate("/printScorecard", {
              state: { eventDetails, eventPlayers, scorecard },
            })
          }
        >
          Generate Scoresheet
        </button>
        </>
         )}
        {hasRole("moderator") && (
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg w-full"
          onClick={handleGenerateDailyImage}
        >
          Generate Daily Email Image
        </button>
          )}
      </div>
    </div>
    
  )}
</div>





{(hasRole("admin") || hasRole("moderator")) && (
   <>
    <h3 className="text-lg font-bold text-gray-700 mt-6">Add Player</h3>
    <div className="flex items-center space-x-4">
      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        className="border border-gray-300 rounded-lg p-2"
      >
        <option value="">-- Select a Player --</option>
        {availablePlayers.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddPlayer}
        className="bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded-lg"
      >
        Add Player
      </button>
    </div>
    </>
)}
  </div>
)}

              </div>
            ))
          )}
        </div>



 {/* Past Fedup Events Section */}
        <div className="past-section py-6 px-4 mb-16 rounded-lg shadow-md bg-gray-100">
          <h2 className="text-2xl font-bold border-b-4 border-gray-600 inline-block mb-4">
            Past FedUp Events
          </h2>
          {fedupEvents.length === 0 ? (
            <p className="text-gray-500">No past events available.</p>
          ) : (
            fedupEvents.map((event) => (
              <div
                key={event.id}
                className={`border border-gray-300 rounded-lg mb-4 shadow-md ${
                  event.is_major ? "bg-yellow-50" : ""
                }`}
              >
                <div
                className="relative cursor-pointer font-bold text-lg py-2 px-4 bg-gray-50 hover:bg-blue-50 hover:shadow-md transition-colors duration-200 flex justify-between items-center border border-gray-300 hover:border-blue-500"
                onClick={() => toggleEventDetails(event.id)}
                >
                  
                  <div className="flex items-center">
                    <span>
                      {new Date(event.date).toLocaleDateString()} -{" "}
                      {event.course_name}
                    </span>
                    {event.is_major && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        Major
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {event.winner_name && ( 
                      <span className="text-gray-500 italic mr-2">
                      Winner: {event.winner_name}
                      </span>
                )}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                  </div>
  
                </div>

                {selectedEvent === event.id && (
                  <div className="mt-4 p-4">
                    <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                        <tr>
                          <th className="p-4 text-center">Place</th>
                          <th className="p-4 text-left">Player</th>
                          <th className="p-4 text-center">Quota</th>
                          <th className="p-4 text-center">Score</th>
                          <th className="p-4 text-center">+/-</th>
                          <th className="p-4 text-center">CTPs</th>
                          <th className="p-4 text-center">Skins</th>
                          <th className="p-4 text-center">Money Won</th>
                          <th className="p-4 text-center">Points Gained</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventPlayers.map((player, index) => (
                          <tr key={player.player_id}>
                            <td className="p-4 text-center">
                              {player.rank || "-"}
                            </td>
                            <td className="p-4 text-left">{player.name}</td>
                            <td className="p-4 text-center">{player.event_quota}</td>
                            <td className="p-4 text-center">{player.score}</td>
                            <td className="p-4 text-center">
                              {player.score - player.quota > 0 ? (
                                <span className="text-green-500">
                                  +{player.score - player.event_quota}
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  {player.score - player.event_quota}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">{player.ctps}</td>
                            <td className="p-4 text-center">{player.skins}</td>
                            <td className="p-4 text-center">
                              ${parseFloat(player.money_won).toFixed(2)}
                            </td>
                            <td className="p-4 text-center">{player.total_points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                       
                )}
              </div>
            ))
            )}

        </div>


        {/* Past Non-Fedup Events Section */}
        <div className="py-6 px-4 rounded-lg shadow-md bg-gray-300">
          <h2 className="text-2xl font-bold border-b-4 border-gray-600 inline-block mb-4">
            Past Non-FedUp Events
          </h2>
          {pastEvents.length === 0 ? (
            <p className="text-gray-500">No past events available.</p>
          ) : (
            pastEvents.map((event) => (
              <div
                key={event.id}
                className={`border border-gray-300 rounded-lg mb-4 shadow-md ${
                  event.is_major ? "bg-yellow-50" : ""
                }`}
              >
                <div
                className="relative cursor-pointer font-bold text-lg py-2 px-4 bg-gray-50 hover:bg-blue-50 hover:shadow-md transition-colors duration-200 flex justify-between items-center border border-gray-300 hover:border-blue-500"
                onClick={() => toggleEventDetails(event.id)}
                >
                  
                  <div className="flex items-center">
                    <span>
                      {new Date(event.date).toLocaleDateString()} -{" "}
                      {event.course_name}
                    </span>
                    {event.is_major && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        Major
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {event.winner_name && ( 
                      <span className="text-gray-500 italic mr-2">
                      Winner: {event.winner_name}
                      </span>
                )}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                  </div>
  
                </div>

                {selectedEvent === event.id && (
                  <div className="mt-4 p-4">
                    <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                        <tr>
                          <th className="p-4 text-left">Player</th>
                          <th className="p-4 text-center">Quota</th>
                          <th className="p-4 text-center">Score</th>
                          <th className="p-4 text-center">+/-</th>
                          <th className="p-4 text-center">Money Won</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventPlayers.map((player, index) => (
                          <tr key={player.player_id}>
                            <td className="p-4 text-left">{player.name}</td>
                            <td className="p-4 text-center">{player.event_quota}</td>
                            <td className="p-4 text-center">{player.score}</td>
                            <td className="p-4 text-center">
                              {player.score - player.quota > 0 ? (
                                <span className="text-green-500">
                                  +{player.score - player.event_quota}
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  {player.score - player.event_quota}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              ${parseFloat(player.money_won).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                       
                )}
              </div>
                
            ))
          )}
      
          </div>

          
        <div>
        {showPairingsModal && (
  <PairingsModal
    pairings={pairings}
    setPairings={setPairings}
    onClose={closePairingsModal}
    onSave={(updatedPairings) => {
      savePairings(updatedPairings); // Save to backend
    }}
  />
)}
     

    </div>
    
      </div>{showModal && selectedCourseDetails && (
  <CourseModal course={selectedCourseDetails} onClose={closeModal} />
)}

  {/* Modal to Display Generated Email Image */}

        {/* Always Render Hidden Version for Image Generation */}
        <div className="opacity-0 absolute pointer-events-none">
        <EventDetailsImage
          ref={eventDetailsRef}
          event={eventDetails  || {}}
          pairings={pairings || []}
          eventPlayers={eventPlayers  || []}
        />
      </div>
  {showImageModal && (
  <ImageModal imageSrc={generatedImage} onClose={closeImageModal}></ImageModal>
)}

  {/* Modal to Display Generated Email Image */}

        {/* Always Render Hidden Version for Image Generation */}
        <div className="opacity-0 absolute pointer-events-none">
        <EventDailyImage
          ref={eventDailyEmailRef}
          event={eventDetails  || {}}
          eventPlayers={eventPlayers  || []}
        />
      </div>
  {showImageModal && (
  <ImageModal imageSrc={generatedImage} onClose={closeImageModal}></ImageModal>
)}

{selectedEvent && (
        <div id="scorecard-sheet" className="hidden">
          <ScorecardSheet 
          eventDetails={eventDetails || {}} 
          players={eventPlayers || []}
          scorecard={Array.isArray(scorecard) ? scorecard : []} 
          />
        </div>
      )}

{selectedEvent && (
    <div id="payout-table" className="hidden">
      <PayoutTablePrint />
    </div>
  )}
<Footer />
    </div>



  );
};

export default EventsPage;
