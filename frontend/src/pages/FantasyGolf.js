import React, { useState, useEffect } from 'react';
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [tiers, setTiers] = useState({ Tier1: [], Tier2: [], Tier3: [] });
  const [selectedPicks, setSelectedPicks] = useState({ tier1: '', tier2: '', tier3: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  // Helper function to get the correct player image URL
  const getPlayerImageUrl = (player) => {
    const BASE_URL = API_BASE_URL.replace(/\/api$/, '');
    
    // If this player is linked to the current user and they have a profile picture, use that
    if (user?.player_id && player.id === user.player_id && user.profilePicture) {
      if (user.profilePicture.startsWith('http')) return user.profilePicture;
      return `${BASE_URL}${user.profilePicture}`;
    }
    
    // Otherwise use the player's image
    if (player.image_path) {
      return `${BASE_URL}/uploads/players/${player.image_path}`;
    }
    // Fallback to placeholder
    return `${BASE_URL}/uploads/players/placeholder.png`;
  };

  // Fetch tiers when event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchTiers(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      // Fetch upcoming events (not closed) for fantasy picks
      const response = await axios.get(`${API_BASE_URL}/admin/events?type=upcoming`);
      setEvents(response.data.filter(event => !event.closed)); // Only open events
    } catch (error) {
      console.error('Error fetching events:', error);
      setMessage('Failed to load events');
    }
  };

  const fetchTiers = async (eventId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fantasy/tiers/${eventId}`);
      setTiers(response.data.tiers);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setMessage('Failed to load tiers');
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

  const submitPicks = async () => {
    if (!selectedEvent) {
      setMessage('Please select an event');
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const picks = [selectedPicks.tier1, selectedPicks.tier2, selectedPicks.tier3];
    
    if (picks.some(pick => !pick)) {
      setMessage('Please select one player from each tier');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/fantasy/picks`, {
        eventId: selectedEvent,
        picks: picks.map(Number)
      }, { withCredentials: true });
      
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
    // Filter out the current user's player from selection
    const availablePlayers = players.filter(player => 
      !user?.player_id || player.id !== user.player_id
    );
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-bold text-gray-700 mb-3">
          {tierName} ({availablePlayers.length} players available)
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Only players signed up for this event are shown{user?.player_id ? '. You cannot select yourself.' : ''}
        </p>
        <div className="space-y-2">
          {availablePlayers.map(player => (
          <label key={player.id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={tierName.toLowerCase()}
              value={player.id}
              checked={selectedPick === player.id.toString()}
              onChange={(e) => onPickChange(tierName.toLowerCase().replace(' ', ''), e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              {(player.image_path || (user?.player_id === player.id && user.profilePicture)) && (
                <img 
                  src={getPlayerImageUrl(player)}
                  alt={player.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="font-medium">{player.name}</span>
              <span className="text-gray-500 text-sm">({player.current_quota} quota)</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

  return (
    <div>
      <Navbar />
      <PageHeader title="Fantasy Golf League" />
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Event Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Make Your Picks</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Fantasy Rules:</strong> Select one player from each tier. Only players who are signed up for the selected event will be available for selection. Tiers are automatically generated based on current quota rankings.
            </p>
          </div>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <select
              value={selectedEvent || ''}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.course_name} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          
          {/* Authentication Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {!isAuthenticated ? (
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
            ) : null}
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Picks'}
            </button>
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
