import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import CourseModal from "../components/CourseModal";
import PairingsModal from "../components/PairingsModal";
import EventDetailsImage from "../components/EventDetailsImage";
import ImageModal from "../components/ImageModal";
import ScorecardSheet from "../components/ScoreCardSheet";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useUser } from "../context/UserContext";
import Footer from "../components/Footer";
import { formatTime } from "../utils/formatTime";


import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

tippy('.Xtooltip', {
  content: 'Remove',
});

const EventsPage = () => {
  const { role } = useUser();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
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
  const [scorecard, setScorecard] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  

  useEffect(() => {
  }, [pairings]);

  useEffect(() => {
  }, [eventPlayers]);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/events`);

        const upcoming = response.data.filter((event) => !event.closed);
        const past = response.data.filter((event) => event.closed);
        
        setUpcomingEvents(upcoming);
        setPastEvents(past);
         
        
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
  

  const generatePDF = async () => {
    const element = document.getElementById("scorecard-sheet");
  
    // Ensure element is visible during rendering
    element.style.display = "block";
  
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "letter");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${eventDetails.course_name}_Scorecard.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Hide element again after rendering
      element.style.display = "none";
    }
  };


  const closeImageModal = () => {
    setGeneratedImage(null);
    setShowImageModal(false); // Close the image modal
  };

  const savePairings = async (updatedPairings) => {
    try {
      await axios.post(`${API_BASE_URL}/pairings/${selectedEvent}`, { pairings: updatedPairings });
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
        console.log("Adding remaining players:", shuffledPlayers.slice(i));
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
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/events/${eventId}`);
      const event = response.data;
      setEventDetails({
        ...event.details, scorecard:event.scorecard, total_yardage: event.total_yardage, group_pairings: response.data.group_pairings
      });
      

      setEventPlayers(event.players);
      setScorecard(event.scorecard);
      console.log(event.scorecard);

      const pairingsResponse = await axios.get(`${API_BASE_URL}/pairings/${eventId}`);
      setPairings(pairingsResponse.data || []); // Load pairings if they exist
  
     

    } catch (error) {
      console.error("Error fetching event details:", error.message);
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/events/${selectedEvent}/players/${playerId}`);
       // Remove player from eventPlayers
    const updatedPlayers = eventPlayers.filter((player) => player.player_id !== playerId);
    setEventPlayers(updatedPlayers);

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
      });
  
      const newPlayer = response.data;
  
      const normalizedPlayer = {
        ...newPlayer,
        player_id: newPlayer.id, // Map `id` to `player_id` for consistency
      };
  
      if (!normalizedPlayer.name || !normalizedPlayer.player_id) {
        console.error("New player data is incomplete:", normalizedPlayer);
        return;
      }
  
      // Update the eventPlayers list
      setEventPlayers((prevPlayers) => [...prevPlayers, normalizedPlayer]);

      if (pairings.length > 0) {
        console.log("Adding player to existing pairings...");
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
      await axios.post(`${API_BASE_URL}/pairings/${selectedEvent}`, { pairings: [] });
  
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

  // eslint-disable-next-line 
  const handleEditEvent = (eventId) => {
    navigate(`/admin/manage-events?eventId=${eventId}`);
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
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        Major
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
<div className="flex justify-between items-center mb-4">

<div>
    <h3 className="text-xl font-bold mb-4 text-blue-600">1<sup>st</sup> Tee Time of {eventDetails.num_teetimes} booked: 
      <span className="text-red-600 pl-1">{formatTime(eventDetails.tee_time)}</span><br />
      <span className="italic text-gray-600 ">${Number(eventDetails.cost).toFixed(2)}</span>

    </h3>


   
</div>

{/* Right Content: Admin Box */}
{role === "admin" && (
  <div className="flex flex-col bg-gray-100 p-4 rounded-lg shadow-lg space-y-4 w-64">
    <h4 className="text-lg font-bold text-center">Admin Actions</h4>
    
    {/* Generate Pairings Button */}
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      onClick={async () => {
        const response = await axios.get(`${API_BASE_URL}/pairings/${event.id}`);
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

    {/* Clear Pairings Button */}
    <button
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      onClick={clearPairings}
    >
      Clear Pairings
    </button>

    {/* Generate Email Button */}
    <button
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
      onClick={handleGenerateImage}
    >
      Generate Email
    </button>

    {/* Generate Scorecard PDF Button */}
    <button
      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
      onClick={generatePDF}
    >
      Generate Scorecard PDF
    </button>
  </div>

    )}
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

    <div className="flex flex-row gap-8 mt-6">
    <div className="flex-1">

    <h3 className="text-lg font-bold text-gray-700 mb-2">Wankers Signed Up</h3>
    <table className="table-auto border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-1 text-left"></th>
          <th className="border p-1 text-left">Name</th>
          <th className="border p-1 text-left">Quota</th>
          <th className="border p-1 text-left"></th>

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
  
  {/* Pairings Table */}
  <div className="flex-1">
    {pairings.length > 0 && (
      <>
        <h3 className="text-lg font-bold mb-2">Pairings</h3>
        <table className="table-auto border-collapse w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {pairings.map((_, index) => (
                <th key={index} className="border p-1 text-center">
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
                      className="border p-1 text-center"
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
</div>
{/* End Pairings Table */}

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
  </div>
)}

              </div>
            ))
          )}
        </div>

        {/* Past Events Section */}
        <div className="past-section py-6 px-4 rounded-lg shadow-md bg-gray-100">
          <h2 className="text-2xl font-bold border-b-4 border-gray-600 inline-block mb-4">
            Past Events
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
                              {player.rank || "N/A"}
                            </td>
                            <td className="p-4 text-left">{player.name}</td>
                            <td className="p-4 text-center">{player.quota}</td>
                            <td className="p-4 text-center">{player.score}</td>
                            <td className="p-4 text-center">
                              {player.score - player.quota > 0 ? (
                                <span className="text-green-500">
                                  +{player.score - player.quota}
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  {player.score - player.quota}
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

{selectedEvent && (
        <div id="scorecard-sheet" className="hidden">
          <ScorecardSheet 
          eventDetails={eventDetails || {}} 
          players={eventPlayers || []}
          scorecard={Array.isArray(scorecard) ? scorecard : []} 
          />
        </div>
      )}
<Footer />
    </div>



  );
};

export default EventsPage;
