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

// const API_BASE_URL = 'https://signin.gulfcoasthackers.com/api';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Fantasy Scoring Configuration - Easy to modify
const FANTASY_SCORING = {
  quotaPerformance: {
    overQuota: 1,        // Points per stroke over quota
    underQuota: -1       // Points per stroke under quota
  },
  skins: 1.5,           // Points per skin
  ctps: 2,              // Points per CTP
  bonuses: {
    mostOverQuota: 2,   // Bonus for best quota performance (tied players get it too)
    leastToQuota: -2    // Penalty for worst quota performance (tied players get it too)
  }
};

const FantasyGolf = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [nextEventInfo, setNextEventInfo] = useState(null); // Info about the chronologically next event
  const [tiers, setTiers] = useState({ Tier1: [], Tier2: [], Tier3: [] });
  const [tierSnapshot, setTierSnapshot] = useState(null); // Store the tier snapshot from when tiers were first displayed
  const [selectedPicks, setSelectedPicks] = useState({ tier1: '', tier2: '', tier3: '' });
  const [submittedPicks, setSubmittedPicks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [timeUntilLockout, setTimeUntilLockout] = useState(null);
  const [isPicksLocked, setIsPicksLocked] = useState(false);
  const [timeUntilTierFreeze, setTimeUntilTierFreeze] = useState(null);
  const [areTiersFrozen, setAreTiersFrozen] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      // Fetch ALL upcoming events (not closed) - no fantasy filter initially
      const response = await axios.get(`${API_BASE_URL}/admin/events?type=upcoming`);
      const allUpcomingEvents = response.data.filter(event => !event.closed); // Only open events
      
      if (allUpcomingEvents.length === 0) {
        // No upcoming events at all
        setEvents([]);
        setSelectedEvent(null);
        setNextEventInfo(null);
        setMessage('No upcoming events scheduled.');
        return;
      }
      
      // Sort by date to find the chronologically next event
      const sortedEvents = allUpcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      const nextEvent = sortedEvents[0];
      
      // Check if the next event has fantasy enabled
      if (nextEvent.fantasy_enabled) {
        // Next event is fantasy-enabled - show it normally
        setEvents([nextEvent]);
        setSelectedEvent(nextEvent.id.toString());
        setNextEventInfo(null);
        setMessage('');
      } else {
        // Next event exists but fantasy is disabled
        setEvents([]);
        setSelectedEvent(null);
        setNextEventInfo({
          course_name: nextEvent.course_name,
          date: nextEvent.date,
          id: nextEvent.id
        });
        setMessage('');
      }
      
    } catch (error) {
      setMessage('Failed to load events');
      setEvents([]);
      setSelectedEvent(null);
      setNextEventInfo(null);
    }
  }, []);

  // Fetch events on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, user, fetchEvents]);

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

  // Helper function to calculate tier freeze time (24 hours before tee time)
  const calculateTierFreezeTime = (eventDate, teeTime) => {
    if (!eventDate || !teeTime) return null;
    
    // Parse the event date (e.g., "2025-08-03T04:00:00.000Z")
    const eventDateObj = new Date(eventDate);
    
    // Parse the tee time (e.g., "16:02:00")
    const [hours, minutes, seconds] = teeTime.split(':').map(Number);
    
    // Create the tee time datetime
    const teeTimeDate = new Date(eventDateObj);
    teeTimeDate.setHours(hours, minutes, seconds, 0);
    
    // Subtract 24 hours for tier freeze
    const tierFreezeTime = new Date(teeTimeDate.getTime() - 24 * 60 * 60 * 1000);
    
    return tierFreezeTime;
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

  // Timer effect to update countdown for both tier freeze and picks lockout
  useEffect(() => {
    if (!selectedEvent) {
      setTimeUntilLockout(null);
      setIsPicksLocked(false);
      setTimeUntilTierFreeze(null);
      setAreTiersFrozen(false);
      return;
    }

    const selectedEventData = events.find(e => e.id.toString() === selectedEvent.toString());
    if (!selectedEventData) return;

    const lockoutTime = calculateLockoutTime(selectedEventData.date, selectedEventData.tee_time);
    const tierFreezeTime = calculateTierFreezeTime(selectedEventData.date, selectedEventData.tee_time);
    if (!lockoutTime || !tierFreezeTime) return;

    const updateTimer = () => {
      const now = new Date();
      const timeUntilPicksLockout = lockoutTime.getTime() - now.getTime();
      const timeUntilTierFreezeDeadline = tierFreezeTime.getTime() - now.getTime();
      
      setTimeUntilLockout(timeUntilPicksLockout);
      setIsPicksLocked(timeUntilPicksLockout <= 0);
      setTimeUntilTierFreeze(timeUntilTierFreezeDeadline);
      setAreTiersFrozen(timeUntilTierFreezeDeadline <= 0);
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

  const checkExistingPicks = async (eventId, tiersData) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fantasy/picks/${eventId}`, { 
        withCredentials: true 
      });
      
      // Find current user's picks - try multiple matching strategies
      let userPicks = null;
      
      // First try user ID match (primary method for admin users)
      if (user?.id) {
        userPicks = response.data.find(pick => pick.participant_id === user.id.toString());
      }
      
      // If no match and user has email, try email match
      if (!userPicks && user?.email) {
        userPicks = response.data.find(pick => pick.participant_id === user.email);
      }
      
      // If still no match, try lowercase email match
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
        
        // For displaying existing picks, we need to fetch the actual player data
        // and check if they're still in the current event (haven't withdrawn)
        try {
          const playerIds = [userPicks.tier1_pick, userPicks.tier2_pick, userPicks.tier3_pick].filter(Boolean);
          
          if (playerIds.length === 3) {
            // Fetch player details directly from the players table
            const playerPromises = playerIds.map(async (playerId) => {
              try {
                const response = await axios.get(`${API_BASE_URL}/players/${playerId}`);
                return response.data;
              } catch (error) {
                return null;
              }
            });
            
            const playerDetails = await Promise.all(playerPromises);
            
            // Check if each player is still in the current event tiers
            const allCurrentPlayers = [...tiersData.Tier1, ...tiersData.Tier2, ...tiersData.Tier3];
            
            const existingPickDetails = {
              tier1: playerDetails[0] ? {
                ...playerDetails[0],
                isWithdrawn: !allCurrentPlayers.some(p => p.id === playerDetails[0].id)
              } : null,
              tier2: playerDetails[1] ? {
                ...playerDetails[1],
                isWithdrawn: !allCurrentPlayers.some(p => p.id === playerDetails[1].id)
              } : null,
              tier3: playerDetails[2] ? {
                ...playerDetails[2],
                isWithdrawn: !allCurrentPlayers.some(p => p.id === playerDetails[2].id)
              } : null
            };
            
            // Show picks even if some players have withdrawn - we'll style them differently
            if (existingPickDetails.tier1 && existingPickDetails.tier2 && existingPickDetails.tier3) {
              setSubmittedPicks(existingPickDetails);
              
              // Check if any players have withdrawn and show appropriate message
              const withdrawnPlayers = [existingPickDetails.tier1, existingPickDetails.tier2, existingPickDetails.tier3]
                .filter(player => player.isWithdrawn);
              
              if (withdrawnPlayers.length > 0) {
                const withdrawnNames = withdrawnPlayers.map(p => p.name).join(', ');
                setMessage(`⚠️ ${withdrawnNames} ${withdrawnPlayers.length === 1 ? 'has' : 'have'} withdrawn from this event and will not earn fantasy points`);
              } else {
                setMessage('');
              }
              
              // Check for tier changes - but only warn if they're problematic
              // With the new append-only system (24h freeze), existing picks shouldn't move tiers
              const tier1Pick = existingPickDetails.tier1;
              const tier2Pick = existingPickDetails.tier2;
              const tier3Pick = existingPickDetails.tier3;
              
              const tier1PlayerIds = tiersData.Tier1.map(p => p.id);
              const tier2PlayerIds = tiersData.Tier2.map(p => p.id);
              const tier3PlayerIds = tiersData.Tier3.map(p => p.id);
              
              let tierShiftWarning = '';
              
              // Only warn about tier shifts if tiers should be frozen (24h+ before tee time has passed)
              if (areTiersFrozen) {
                if (tier1Pick && !tier1Pick.isWithdrawn && !tier1PlayerIds.includes(tier1Pick.id)) {
                  tierShiftWarning += `Your Tier 1 pick (${tier1Pick.name}) has moved to a different tier. `;
                }
                if (tier2Pick && !tier2Pick.isWithdrawn && !tier2PlayerIds.includes(tier2Pick.id)) {
                  tierShiftWarning += `Your Tier 2 pick (${tier2Pick.name}) has moved to a different tier. `;
                }
                if (tier3Pick && !tier3Pick.isWithdrawn && !tier3PlayerIds.includes(tier3Pick.id)) {
                  tierShiftWarning += `Your Tier 3 pick (${tier3Pick.name}) has moved to a different tier. `;
                }
                
                if (tierShiftWarning) {
                  if (!withdrawnPlayers.length) {
                    setMessage(`⚠️ ${tierShiftWarning}This should not happen after tier freeze. Please contact admin.`);
                  }
                }
              }
            } else {
              // Some players couldn't be fetched - show warning but don't clear picks
              setSubmittedPicks(null);
              setMessage('Some of your previously selected players may no longer be available');
            }
          } else {
            setSubmittedPicks(null);
            setMessage('');
          }
        } catch (error) {
          setSubmittedPicks(null);
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
      
      // Capture tier snapshot when tiers are first displayed to the user
      // This ensures we validate against the exact tier assignments the user saw
      const snapshot = {
        Tier1: tiersData.Tier1.map(p => p.id),
        Tier2: tiersData.Tier2.map(p => p.id),
        Tier3: tiersData.Tier3.map(p => p.id)
      };
      setTierSnapshot(snapshot);
      
      // Also check if user has existing picks for this event - pass the tiers data
      if (isAuthenticated) {
        await checkExistingPicks(eventId, tiersData);
      } else {
        // If not authenticated, clear the picks state
        setSubmittedPicks(null);
      }
    } catch (error) {
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

  // Helper function to calculate Hacker Performance Index (HPI)
  const calculateHPI = (player) => {
    if (!player) return 0;
    
    // Higher average quota = better player, so quota contributes directly to HPI
    const quotaScore = player.avg_quota || player.current_quota || 0;
    
    // Performance multipliers based on season averages
    const skinsMultiplier = (player.avg_skins || 0) * 5;
    const ctpMultiplier = (player.avg_ctps || 0) * 8;
    
    // Total HPI
    const hpi = quotaScore + skinsMultiplier + ctpMultiplier;
    
    return Math.round(hpi * 10) / 10; // Round to 1 decimal place
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

    // Ensure we have a tier snapshot (this should always be available after fetchTiers)
    if (!tierSnapshot) {
      setMessage('Tier data not available. Please refresh the page and try again.');
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
        picks: picks.map(Number),
        // Send the tier snapshot that was captured when tiers were first displayed to the user
        tierSnapshot: tierSnapshot
      }, { withCredentials: true });
      
      setSubmittedPicks(selectedPlayerDetails);
      setMessage('Picks submitted successfully!');
      setSelectedPicks({ tier1: '', tier2: '', tier3: '' });
    } catch (error) {
      
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
        
        {/* Table layout without scrolling container */}
        <div>
          {/* Table Headers */}
          <div className="flex items-center space-x-3 mb-2 pb-2 border-b border-gray-200">
            <div className="w-6"></div> {/* Radio button space */}
            <div className="w-8"></div> {/* Profile image space */}
            <div className="flex-1 flex items-center min-w-0">
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Player
                </span>
              </div>
              <div className="w-16 text-center flex-shrink-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Quota
                </span>
              </div>
              <div className="w-16 text-center flex-shrink-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  HPI
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
                        <div className="flex-1 min-w-0 pr-2">
                          <span className={`font-medium text-sm ${isCurrentUser ? 'text-blue-600' : ''}`}>
                            {player.name}
                            {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                          </span>
                        </div>
                        <div className="w-16 text-center flex-shrink-0">
                          <span className="text-gray-500 text-sm">
                            {player.current_quota}
                          </span>
                        </div>
                        <div className="w-16 text-center flex-shrink-0">
                          <span className="text-blue-600 text-sm font-medium">
                            {calculateHPI(player)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
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
              <strong>Fantasy Rules:</strong> Select one player from each tier. Only players who are signed up for the selected event will be available for selection. Your own player is shown but cannot be selected. Tiers are generated using a Hacker Performance Index (HPI) that combines average quota, season average skins, and season average CTPs to ensure fair skill-based groupings.
            </p>
            <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
              <p className="text-blue-900 text-xs">
                <strong>🔒 Tier Freeze:</strong> {areTiersFrozen 
                  ? "Tiers are now frozen. New players can still register but will be placed in appropriate tiers without affecting existing picks." 
                  : "Tiers will freeze 24 hours before tee time to ensure fairness. After that, new signups won't move existing players between tiers."
                }
              </p>
            </div>
          </div>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Combined Event Display with Countdown Timer */}
          {selectedEvent && events.length > 0 ? (
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
                    {/* Tier freeze status */}
                    {areTiersFrozen && (
                      <p className="text-xs text-blue-700 font-medium flex items-center mt-1">
                        🔒 Tiers frozen - fair picks guaranteed
                      </p>
                    )}
                    {!areTiersFrozen && timeUntilTierFreeze !== null && timeUntilTierFreeze > 0 && (
                      <p className="text-xs text-amber-700 font-medium flex items-center mt-1">
                        ⏰ Tiers freeze in {formatTimeRemaining(timeUntilTierFreeze)}
                      </p>
                    )}
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
          ) : nextEventInfo ? (
            /* Next event exists but fantasy is disabled */
            <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⏳</div>
                <div>
                  <h3 className="font-semibold text-amber-800">Fantasy Not Available Yet</h3>
                  <p className="text-sm text-amber-700">
                    The next event is {nextEventInfo.course_name} on {new Date(nextEventInfo.date).toLocaleDateString()}, 
                    but fantasy picks are not enabled for this event yet.
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Check back later or contact an admin if you think this is an error.
                  </p>
                </div>
              </div>
            </div>
          ) : message ? (
            /* Show general message (like "No upcoming events") */
            <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📅</div>
                <div>
                  <h3 className="font-semibold text-gray-700">No Events Available</h3>
                  <p className="text-sm text-gray-600">{message}</p>
                </div>
              </div>
            </div>
          ) : null}
          
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
        {selectedEvent && isAuthenticated && events.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-blue-800 mb-3">🎯 Your Fantasy Picks</h3>
            {submittedPicks ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`bg-white rounded-lg p-3 border ${submittedPicks.tier1?.isWithdrawn ? 'border-red-200 bg-red-50' : 'border-blue-100'}`}>
                    <h4 className="font-semibold text-blue-700 mb-2">Tier 1 Pick</h4>
                    <div className="flex items-center space-x-3">
                      {submittedPicks.tier1?.image_path && (
                        <img 
                          src={getPlayerImageUrl(submittedPicks.tier1)}
                          alt={submittedPicks.tier1.name}
                          className={`w-12 h-12 rounded-full ${submittedPicks.tier1.isWithdrawn ? 'opacity-50 grayscale' : ''}`}
                        />
                      )}
                      <div>
                        <p className={`font-medium ${submittedPicks.tier1?.isWithdrawn ? 'text-gray-500 line-through' : ''}`}>
                          {submittedPicks.tier1?.name}
                          {submittedPicks.tier1?.isWithdrawn && <span className="text-red-600 text-xs ml-2">(Withdrawn)</span>}
                        </p>
                        <p className={`text-sm ${submittedPicks.tier1?.isWithdrawn ? 'text-gray-400' : 'text-gray-600'}`}>
                          Quota: {submittedPicks.tier1?.current_quota || 'N/A'}
                        </p>
                        {submittedPicks.tier1?.leaderboard_rank && submittedPicks.tier1.leaderboard_rank < 999 && (
                          <p className={`text-sm ${submittedPicks.tier1?.isWithdrawn ? 'text-gray-400' : 'text-gray-600'}`}>
                            Rank: #{submittedPicks.tier1.leaderboard_rank}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`bg-white rounded-lg p-3 border ${submittedPicks.tier2?.isWithdrawn ? 'border-red-200 bg-red-50' : 'border-blue-100'}`}>
                    <h4 className="font-semibold text-blue-700 mb-2">Tier 2 Pick</h4>
                    <div className="flex items-center space-x-3">
                      {submittedPicks.tier2?.image_path && (
                        <img 
                          src={getPlayerImageUrl(submittedPicks.tier2)}
                          alt={submittedPicks.tier2.name}
                          className={`w-12 h-12 rounded-full ${submittedPicks.tier2.isWithdrawn ? 'opacity-50 grayscale' : ''}`}
                        />
                      )}
                      <div>
                        <p className={`font-medium ${submittedPicks.tier2?.isWithdrawn ? 'text-gray-500 line-through' : ''}`}>
                          {submittedPicks.tier2?.name}
                          {submittedPicks.tier2?.isWithdrawn && <span className="text-red-600 text-xs ml-2">(Withdrawn)</span>}
                        </p>
                        <p className={`text-sm ${submittedPicks.tier2?.isWithdrawn ? 'text-gray-400' : 'text-gray-600'}`}>
                          Quota: {submittedPicks.tier2?.current_quota || 'N/A'}
                        </p>
                        {submittedPicks.tier2?.leaderboard_rank && submittedPicks.tier2.leaderboard_rank < 999 && (
                          <p className={`text-sm ${submittedPicks.tier2?.isWithdrawn ? 'text-gray-400' : 'text-gray-600'}`}>
                            Rank: #{submittedPicks.tier2.leaderboard_rank}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`bg-white rounded-lg p-3 border ${submittedPicks.tier3?.isWithdrawn ? 'border-red-200 bg-red-50' : 'border-blue-100'}`}>
                    <h4 className="font-semibold text-blue-700 mb-2">Tier 3 Pick</h4>
                    <div className="flex items-center space-x-3">
                      {submittedPicks.tier3?.image_path && (
                        <img 
                          src={getPlayerImageUrl(submittedPicks.tier3)}
                          alt={submittedPicks.tier3.name}
                          className={`w-12 h-12 rounded-full ${submittedPicks.tier3.isWithdrawn ? 'opacity-50 grayscale' : ''}`}
                        />
                      )}
                      <div>
                        <p className={`font-medium ${submittedPicks.tier3?.isWithdrawn ? 'text-gray-500 line-through' : ''}`}>
                          {submittedPicks.tier3?.name}
                          {submittedPicks.tier3?.isWithdrawn && <span className="text-red-600 text-xs ml-2">(Withdrawn)</span>}
                        </p>
                        <p className={`text-sm ${submittedPicks.tier3?.isWithdrawn ? 'text-gray-400' : 'text-gray-600'}`}>
                          Quota: {submittedPicks.tier3?.current_quota || 'N/A'}
                        </p>
                        {submittedPicks.tier3?.leaderboard_rank && submittedPicks.tier3.leaderboard_rank < 999 && (
                          <p className={`text-sm ${submittedPicks.tier3?.isWithdrawn ? 'text-gray-400' : 'text-gray-600'}`}>
                            Rank: #{submittedPicks.tier3.leaderboard_rank}
                          </p>
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
      {selectedEvent && !loading && isAuthenticated && events.length > 0 && (
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
      {selectedEvent && !isAuthenticated && events.length > 0 && (
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

      {/* Fantasy Not Available Message for Authenticated Users */}
      {nextEventInfo && isAuthenticated && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Fantasy Picks Not Available</h3>
          <p className="text-gray-600 mb-4">
            The next event ({nextEventInfo.course_name} on {new Date(nextEventInfo.date).toLocaleDateString()}) 
            does not have fantasy picks enabled yet.
          </p>
          <p className="text-sm text-gray-500">
            This typically happens when the event is still being set up. Check back later!
          </p>
        </div>
      )}

        {/* Projected Fantasy Points Preview */}
        {selectedEvent && isAuthenticated && events.length > 0 && (selectedPicks.tier1 || selectedPicks.tier2 || selectedPicks.tier3) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🔮</span>
              Projected Fantasy Points
            </h3>
            {(() => {
              // Calculate partial projections for selected picks
              const tierPicks = [
                { tierName: 'Tier 1', playerId: selectedPicks.tier1, tierIndex: 0 },
                { tierName: 'Tier 2', playerId: selectedPicks.tier2, tierIndex: 1 },
                { tierName: 'Tier 3', playerId: selectedPicks.tier3, tierIndex: 2 }
              ];
              
              const projectionDetails = [];
              let totalProjectedPoints = 0;
              
              tierPicks.forEach(({ tierName, playerId, tierIndex }) => {
                if (playerId) {
                  const player = getPlayerById(playerId);
                  if (player) {
                    // Calculate projection based on player's actual performance data
                    let projectedQuotaPerf = 0;
                    let projectedSkins = player.avg_skins || 0;
                    let projectedCtps = player.avg_ctps || 0;
                    
                    // Estimate quota performance based on current quota and historical average
                    const avgQuota = player.avg_quota || player.current_quota;
                    if (avgQuota <= 20) {
                      projectedQuotaPerf = -2;
                    } else if (avgQuota <= 25) {
                      projectedQuotaPerf = -1;
                    } else if (avgQuota <= 30) {
                      projectedQuotaPerf = 0;
                    } else {
                      projectedQuotaPerf = 1;
                    }
                    
                    // Use actual season averages for skins and CTPs
                    // No need to estimate based on tier anymore!
                    
                    // Calculate projected points using actual performance metrics
                    let projectedPts = 0;
                    projectedPts += projectedQuotaPerf * (projectedQuotaPerf > 0 ? FANTASY_SCORING.quotaPerformance.overQuota : Math.abs(FANTASY_SCORING.quotaPerformance.underQuota));
                    projectedPts += projectedSkins * FANTASY_SCORING.skins;
                    projectedPts += projectedCtps * FANTASY_SCORING.ctps;
                    
                    projectionDetails.push({
                      tierName,
                      name: player.name,
                      quota: player.current_quota,
                      avgQuota: player.avg_quota,
                      hpi: calculateHPI(player),
                      projectedQuotaPerf,
                      projectedSkins: projectedSkins.toFixed(1),
                      projectedCtps: projectedCtps.toFixed(1),
                      projectedPts: projectedPts.toFixed(1)
                    });
                    
                    totalProjectedPoints += projectedPts;
                  }
                } else {
                  // Show placeholder for unselected tier
                  projectionDetails.push({
                    tierName,
                    name: null,
                    quota: null,
                    projectedQuotaPerf: null,
                    projectedSkins: null,
                    projectedCtps: null,
                    projectedPts: null
                  });
                }
              });
              
              return (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {projectionDetails.map((detail, idx) => (
                      <div key={idx} className={`bg-white rounded-lg p-4 border ${detail.name ? 'border-blue-100' : 'border-gray-200'}`}>
                        <h4 className={`font-semibold mb-2 ${detail.name ? 'text-blue-700' : 'text-gray-400'}`}>
                          {detail.tierName}: {detail.name || 'No selection'}
                        </h4>
                        {detail.name ? (
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Current Quota: {detail.quota}</div>
                            {detail.avgQuota && detail.avgQuota !== detail.quota && (
                              <div>Season Avg Quota: {detail.avgQuota.toFixed(1)}</div>
                            )}
                            <div>HPI Score: <span className="font-medium text-blue-600">{detail.hpi}</span></div>
                            <div className="border-t pt-1 mt-1">
                              <div>Projected vs Quota: {detail.projectedQuotaPerf > 0 ? '+' : ''}{detail.projectedQuotaPerf}</div>
                              <div>Expected Skins: {detail.projectedSkins}</div>
                              <div>Expected CTPs: {detail.projectedCtps}</div>
                            </div>
                            <div className="font-semibold text-blue-600 border-t pt-1 mt-2">
                              Projected Points: {detail.projectedPts}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Select a player to see projection</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center bg-white rounded-lg p-4 border-2 border-blue-300">
                    <div className="text-2xl font-bold text-blue-700">
                      {projectionDetails.filter(d => d.name).length === 3 ? 'Total ' : 'Partial '}
                      Projected Points: {totalProjectedPoints.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      *Projections based on individual player performance data (quota history, season averages)
                    </p>
                    {projectionDetails.filter(d => d.name).length < 3 && (
                      <p className="text-sm text-amber-600 mt-1">
                        Complete all three picks to see total projection
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Submit Button */}
        {selectedEvent && isAuthenticated && events.length > 0 && (
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
              <h4 className="font-semibold text-blue-700 mb-2">Performance Points</h4>
              <ul className="space-y-1 text-blue-600">
                <li>📊 Quota performance: +{FANTASY_SCORING.quotaPerformance.overQuota} per point over, {FANTASY_SCORING.quotaPerformance.underQuota} per point under</li>
                <li>🎯 Each skin: +{FANTASY_SCORING.skins} points</li>
                <li>📍 Each CTP: +{FANTASY_SCORING.ctps} points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Bonus/Penalty Points</h4>
              <ul className="space-y-1 text-blue-600">
                <li>🏆 Best quota performance: +{FANTASY_SCORING.bonuses.mostOverQuota} points (tied players all get bonus)</li>
                <li>💔 Worst quota performance: {FANTASY_SCORING.bonuses.leastToQuota} points (tied players all get penalty)</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-2">🧮 Hacker Performance Index (HPI)</h5>
            <p className="text-blue-800 text-sm mb-2">
              Players are ranked into tiers using HPI, which combines: <strong>Quota Score</strong> (average quota from season) + <strong>Skins Bonus</strong> (avg skins × 5) + <strong>CTP Bonus</strong> (avg CTPs × 8). Higher quota players get higher HPI scores, with additional bonuses for skins and CTPs to ensure well-rounded performance evaluation based on historical averages.
            </p>
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
