import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/UnifiedAuthContext';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

/**
 * Fantasy Golf Component
 * 
 * Main interface for making fantasy golf picks with authentication
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

const FantasyGolf = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [tiers, setTiers] = useState({ Tier1: [], Tier2: [], Tier3: [] });
  const [selectedPicks, setSelectedPicks] = useState({ tier1: '', tier2: '', tier3: '' });
  const [submittedPicks, setSubmittedPicks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [timeUntilLockout, setTimeUntilLockout] = useState(null);
  const [isPicksLocked, setIsPicksLocked] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, user]);

  // Helper function to get the correct player image URL
  const getPlayerImageUrl = (player) => {
    const BASE_URL = API_BASE_URL.replace(/\/api$/, '');
    
    // If this player is linked to the current user and they have a profile picture, use that
    if (user?.player_id && player.id === user.player_id && user.profilePicture) {
      if (user.profilePicture.startsWith('http')) return user.profilePicture;
      return `${BASE_URL}${user.profilePicture}`;
    }
    
    // Otherwise use the player's image - image_path already includes the full path
    if (player.image_path) {
      return `${BASE_URL}${player.image_path}`;
    }
    // Fallback to placeholder
    return `${BASE_URL}/uploads/players/placeholder.png`;
  };

  // Helper function to calculate lockout time (10 minutes after tee time)
  const calculateLockoutTime = (eventDate, teeTime) => {
    if (!eventDate || !teeTime) return null;
    
    // Parse the event date (e.g., "2025-08-03T04:00:00.000Z")
    const eventDateObj = new Date(eventDate);
    
    // Parse the tee time (e.g., "16:02:00")
    const [hours, minutes, seconds] = teeTime.split(':').map(Number);
    
    // Create the tee time datetime
    const teeTimeDate = new Date(eventDateObj);
    teeTimeDate.setHours(hours, minutes, seconds, 0);
    
    // Add 10 minutes for lockout
    const lockoutTime = new Date(teeTimeDate.getTime() + 10 * 60 * 1000);
    
    return lockoutTime;
  };

  // Helper function to format time remaining
  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return 'Picks are locked';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    // Pad seconds to always show 2 digits
    const paddedSeconds = seconds.toString().padStart(2, '0');
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${paddedSeconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${paddedSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${paddedSeconds}s`;
    } else {
      return `${paddedSeconds}s remaining`;
    }
  };

  // Timer effect to update countdown
  useEffect(() => {
    if (!selectedEvent) {
      setTimeUntilLockout(null);
      setIsPicksLocked(false);
      return;
    }

    const selectedEventData = events.find(e => e.id.toString() === selectedEvent.toString());
    if (!selectedEventData) return;

    const lockoutTime = calculateLockoutTime(selectedEventData.date, selectedEventData.tee_time);
    if (!lockoutTime) return;

    const updateTimer = () => {
      const now = new Date();
      const timeRemaining = lockoutTime.getTime() - now.getTime();
      
      setTimeUntilLockout(timeRemaining);
      setIsPicksLocked(timeRemaining <= 0);
    };

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [selectedEvent, events]);

  // Fetch tiers when event is selected
  useEffect(() => {
    const loadEventData = async () => {
      if (selectedEvent && isAuthenticated) {
        await fetchTiers(selectedEvent);
      }
    };
    
    loadEventData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent, isAuthenticated, user]);

  const fetchEvents = useCallback(async () => {
    try {
      // Fetch upcoming events (not closed) for fantasy picks
      const response = await axios.get(`${API_BASE_URL}/admin/events?type=upcoming`);
      const upcomingEvents = response.data.filter(event => !event.closed); // Only open events
      setEvents(upcomingEvents);
      
      // Auto-select the first upcoming event
      if (upcomingEvents.length > 0 && !selectedEvent) {
        setSelectedEvent(upcomingEvents[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setMessage('Failed to load events');
    }
  }, [selectedEvent]);

  const checkExistingPicks = async (eventId, tiersData) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fantasy/picks/${eventId}`, { 
        withCredentials: true 
      });
      
      // Find current user's picks - try multiple matching strategies
      let userPicks = null;
      
      // First try exact email match
      if (user?.email) {
        userPicks = response.data.find(pick => pick.participant_id === user.email);
      }
      
      // If no match, try lowercase email match
      if (!userPicks && user?.email) {
        userPicks = response.data.find(pick => pick.participant_id.toLowerCase() === user.email.toLowerCase());
      }
      
      if (userPicks) {
        // User has existing picks - populate the form
        setSelectedPicks({
          tier1: userPicks.tier1_pick?.toString() || '',
          tier2: userPicks.tier2_pick?.toString() || '',
          tier3: userPicks.tier3_pick?.toString() || ''
        });
        
        // Show existing picks - use passed tiersData instead of state
        const allPlayers = [...(tiersData?.Tier1 || []), ...(tiersData?.Tier2 || []), ...(tiersData?.Tier3 || [])];
        
        const getPlayerFromTiers = (playerId) => {
          return allPlayers.find(player => player.id === parseInt(playerId));
        };
        
        const existingPickDetails = {
          tier1: getPlayerFromTiers(userPicks.tier1_pick),
          tier2: getPlayerFromTiers(userPicks.tier2_pick),
          tier3: getPlayerFromTiers(userPicks.tier3_pick)
        };
        
        // Check if we found all the players
        const foundAllPlayers = existingPickDetails.tier1 && existingPickDetails.tier2 && existingPickDetails.tier3;
        
        if (foundAllPlayers) {
          setSubmittedPicks(existingPickDetails);
          setMessage('');
        } else {
          setSubmittedPicks(null);
          setSelectedPicks({ tier1: '', tier2: '', tier3: '' });
          setMessage('');
        }
      } else {
        // No existing picks found - set to empty state for display
        setSubmittedPicks(null);
        setSelectedPicks({ tier1: '', tier2: '', tier3: '' });
        setMessage('');
      }
    } catch (error) {
      // No existing picks found, or error - set to empty state
      console.log('Error checking existing picks:', error);
      setSubmittedPicks(null);
      setSelectedPicks({ tier1: '', tier2: '', tier3: '' });
      setMessage('');
    }
  };

  const fetchTiers = async (eventId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fantasy/tiers/${eventId}`);
      const tiersData = response.data.tiers;
      setTiers(tiersData);
      
      // Also check if user has existing picks for this event - pass the tiers data
      if (isAuthenticated) {
        await checkExistingPicks(eventId, tiersData);
      } else {
        // If not authenticated, clear the picks state
        setSubmittedPicks(null);
      }
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setMessage('Failed to load tiers');
      setSubmittedPicks(null); // Clear picks on error
    } finally {
      setLoading(false);
    }
  };

  const handlePickChange = (tier, playerId) => {
    setSelectedPicks(prev => ({
      ...prev,
      [tier]: playerId
    }));
  };

  // Helper function to get player info by ID
  const getPlayerById = (playerId) => {
    const allPlayers = [...tiers.Tier1, ...tiers.Tier2, ...tiers.Tier3];
    return allPlayers.find(player => player.id === parseInt(playerId));
  };

  const submitPicks = async () => {
    if (!selectedEvent) {
      setMessage('Please select an event');
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Check if picks are locked
    if (isPicksLocked) {
      setMessage('Picks are locked - the deadline has passed (10 minutes after tee time)');
      return;
    }

    const picks = [selectedPicks.tier1, selectedPicks.tier2, selectedPicks.tier3];
    
    if (picks.some(pick => !pick)) {
      setMessage('Please select one player from each tier');
      return;
    }

    // Get player names for confirmation
    const selectedPlayerDetails = {
      tier1: getPlayerById(selectedPicks.tier1),
      tier2: getPlayerById(selectedPicks.tier2),
      tier3: getPlayerById(selectedPicks.tier3)
    };

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/fantasy/picks`, {
        eventId: selectedEvent,
        picks: picks.map(Number)
      }, { withCredentials: true });
      
      setSubmittedPicks(selectedPlayerDetails);
      setMessage('Picks submitted successfully!');
      setSelectedPicks({ tier1: '', tier2: '', tier3: '' });
    } catch (error) {
      console.error('Error submitting picks:', error);
      if (error.response?.status === 401) {
        setMessage('Please log in to submit picks');
        setShowAuthModal(true);
      } else {
        setMessage(error.response?.data?.error || 'Failed to submit picks');
      }
    } finally {
      setLoading(false);
    }
  };

  const TierSection = ({ tierName, players, selectedPick, onPickChange }) => {
    return (
      <div className={`bg-white rounded-lg shadow-lg border-2 border-gray-300 p-4 mb-4 ${isPicksLocked ? 'opacity-60' : ''}`}>
        <h3 className="text-lg font-bold text-gray-700 mb-3 text-center">
          {tierName} ({players.length} players)
        </h3>
        {isPicksLocked && (
          <p className="text-sm text-red-600 font-medium mb-3">
            Picks are now locked.
          </p>
        )}
        
        {/* Table Headers */}
        <div className="flex items-center space-x-3 mb-2 pb-2 border-b border-gray-200">
          <div className="w-6"></div> {/* Radio button space */}
          <div className="w-8"></div> {/* Profile image space */}
          <div className="flex-1 flex items-center min-w-0">
            <div className="flex-1 min-w-0 pr-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Player
              </span>
            </div>
            <div className="w-20 text-center flex-shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Quota
              </span>
            </div>
            <div className="w-16 text-center flex-shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Rank
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {players.map(player => {
            const isCurrentUser = user?.player_id && player.id === user.player_id;
            const isDisabled = isCurrentUser || isPicksLocked;
            
            return (
              <label 
                key={player.id} 
                className={`flex items-center space-x-2 ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <input
                  type="radio"
                  name={tierName.toLowerCase()}
                  value={player.id}
                  checked={selectedPick === player.id.toString()}
                  onChange={(e) => !isPicksLocked && onPickChange(tierName.toLowerCase().replace(' ', ''), e.target.value)}
                  disabled={isDisabled}
                  className={`text-blue-600 focus:ring-blue-500 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {(player.image_path || (user?.player_id === player.id && user.profilePicture)) && (
                    <img 
                      src={getPlayerImageUrl(player)}
                      alt={player.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 flex items-center min-w-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className={`font-medium text-sm ${isCurrentUser ? 'text-blue-600' : ''}`}>
                        {player.name}
                        {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                      </span>
                    </div>
                    <div className="w-20 text-center flex-shrink-0">
                      <span className="text-gray-500 text-sm">
                        {player.current_quota}
                      </span>
                    </div>
                    <div className="w-16 text-center flex-shrink-0">
                      {player.leaderboard_rank && player.leaderboard_rank < 999 ? (
                        <span className="text-gray-500 text-sm">
                          #{player.leaderboard_rank}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          --
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Fireball Fantasy Fiasco" />
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Event Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Make Your Picks</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Fantasy Rules:</strong> Select one player from each tier. Only players who are signed up for the selected event will be available for selection. Your own player is shown but cannot be selected. Tiers are automatically generated first by current quota, then by leaderboard rank (higher tiers contain better players).
            </p>
          </div>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Combined Event Display with Countdown Timer */}
          {selectedEvent && events.length > 0 && (
            <div className={`p-4 rounded-lg border ${
              isPicksLocked 
                ? 'bg-red-50 border-red-200' 
                : timeUntilLockout !== null && timeUntilLockout < 60 * 60 * 1000 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🏌️</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Next Event</h3>
                    <p className="text-sm text-gray-600">
                      {events.find(e => e.id.toString() === selectedEvent)?.course_name} - {' '}
                      {new Date(events.find(e => e.id.toString() === selectedEvent)?.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Timer Section */}
                {timeUntilLockout !== null && (
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className={`font-semibold text-sm transition-colors duration-300 ${
                        isPicksLocked 
                          ? 'text-red-800' 
                          : timeUntilLockout < 60 * 60 * 1000 
                            ? 'text-orange-800' 
                            : 'text-blue-800'
                      }`}>
                        {isPicksLocked ? 'Picks Locked' : 'Pick Deadline'}
                      </p>
                      <p className={`text-sm font-mono font-semibold transition-colors duration-300 ${
                        isPicksLocked 
                          ? 'text-red-600' 
                          : timeUntilLockout < 60 * 60 * 1000 
                            ? 'text-orange-600' 
                            : 'text-blue-600'
                      }`}>
                        {formatTimeRemaining(timeUntilLockout)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Authentication Status */}
          {!isAuthenticated && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-700">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Please log in to make picks</span>
                </div>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Display current picks for selected event */}
        {selectedEvent && isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-blue-800 mb-3">🎯 Your Fantasy Picks</h3>
            {submittedPicks ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <h4 className="font-semibold text-blue-700 mb-2">Tier 1 Pick</h4>
                    <div className="flex items-center space-x-3">
                      {submittedPicks.tier1?.image_path && (
                        <img 
                          src={getPlayerImageUrl(submittedPicks.tier1)}
                          alt={submittedPicks.tier1.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{submittedPicks.tier1?.name}</p>
                        <p className="text-sm text-gray-600">Quota: {submittedPicks.tier1?.current_quota}</p>
                        {submittedPicks.tier1?.leaderboard_rank && submittedPicks.tier1.leaderboard_rank < 999 && (
                          <p className="text-sm text-gray-600">Rank: #{submittedPicks.tier1.leaderboard_rank}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <h4 className="font-semibold text-blue-700 mb-2">Tier 2 Pick</h4>
                    <div className="flex items-center space-x-3">
                      {submittedPicks.tier2?.image_path && (
                        <img 
                          src={getPlayerImageUrl(submittedPicks.tier2)}
                          alt={submittedPicks.tier2.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{submittedPicks.tier2?.name}</p>
                        <p className="text-sm text-gray-600">Quota: {submittedPicks.tier2?.current_quota}</p>
                        {submittedPicks.tier2?.leaderboard_rank && submittedPicks.tier2.leaderboard_rank < 999 && (
                          <p className="text-sm text-gray-600">Rank: #{submittedPicks.tier2.leaderboard_rank}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <h4 className="font-semibold text-blue-700 mb-2">Tier 3 Pick</h4>
                    <div className="flex items-center space-x-3">
                      {submittedPicks.tier3?.image_path && (
                        <img 
                          src={getPlayerImageUrl(submittedPicks.tier3)}
                          alt={submittedPicks.tier3.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{submittedPicks.tier3?.name}</p>
                        <p className="text-sm text-gray-600">Quota: {submittedPicks.tier3?.current_quota}</p>
                        {submittedPicks.tier3?.leaderboard_rank && submittedPicks.tier3.leaderboard_rank < 999 && (
                          <p className="text-sm text-gray-600">Rank: #{submittedPicks.tier3.leaderboard_rank}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-blue-100">
                <div className="text-center text-gray-500">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="font-medium">No submitted picks for this event</p>
                  <p className="text-sm mt-1">Select players from each tier below to make your picks</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tier Selection */}
      {selectedEvent && !loading && isAuthenticated && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <TierSection
            tierName="Tier 1"
            players={tiers.Tier1}
            selectedPick={selectedPicks.tier1}
            onPickChange={handlePickChange}
          />
          <TierSection
            tierName="Tier 2"
            players={tiers.Tier2}
            selectedPick={selectedPicks.tier2}
            onPickChange={handlePickChange}
          />
          <TierSection
            tierName="Tier 3"
            players={tiers.Tier3}
            selectedPick={selectedPicks.tier3}
            onPickChange={handlePickChange}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Not Authenticated Message */}
      {selectedEvent && !isAuthenticated && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-6">Please log in to view tiers and make your fantasy picks</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Continue
          </button>
        </div>
      )}

        {/* Submit Button */}
        {selectedEvent && isAuthenticated && (
          <div className="text-center mb-8">
            <button
              onClick={submitPicks}
              disabled={loading || isPicksLocked}
              className={`font-bold py-3 px-8 rounded-lg disabled:opacity-50 ${
                isPicksLocked 
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Submitting...' : isPicksLocked ? 'Picks Locked' : 'Submit Picks'}
            </button>
            {isPicksLocked && (
              <p className="text-red-600 text-sm mt-2">
                The deadline for picks has passed (10 minutes after tee time)
              </p>
            )}
          </div>
        )}

        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />

        {/* Rules Section */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">Fantasy Scoring Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Ranking Points</h4>
              <ul className="space-y-1 text-blue-600">
                <li>1st place: +10 points</li>
                <li>2nd place: +8 points</li>
                <li>3rd-5th place: +5 points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Performance Points</h4>
              <ul className="space-y-1 text-blue-600">
                <li>Each skin: +4 points</li>
                <li>Each CTP: +2 points</li>
                <li>Quota performance: +1 per point over, -1 per point under</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Check the <a href="/fantasy-leaderboard" className="underline font-medium">Fantasy Leaderboard</a> to see current standings and detailed weekly breakdowns!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FantasyGolf;
