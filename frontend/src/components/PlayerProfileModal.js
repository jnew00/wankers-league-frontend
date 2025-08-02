import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/UnifiedAuthContext';
import axios from 'axios';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// const API_BASE_URL = 'https://signin.gulfcoasthackers.com/api';
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const PlayerProfileModal = ({ player, onClose }) => {
  const { user, isAuthenticated, linkPlayer, userVersion, uploadProfilePicture } = useAuth();
  const [isLinked, setIsLinked] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkingError, setLinkingError] = useState('');
  const [showHistorical, setShowHistorical] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Check if the current user is linked to this player
  useEffect(() => {
    if (user && player) {
      // Check for linked player using either player_id field or player object
      const userPlayerId = user.player_id || user.player?.id;
      const linked = !!(userPlayerId && player.id && userPlayerId === player.id);
      setIsLinked(linked);
    }
  }, [user, player, userVersion]); // Include userVersion to force re-evaluation

  // Initialize tippy for tooltips
  useEffect(() => {
    tippy('[data-tippy-content]');
  }, [isLinked, uploadMessage]);

  // Fetch available players for linking - only if user has no linked player at all
  useEffect(() => {
    if (isAuthenticated && !user?.player_id && !user?.player?.id) {
      fetchAvailablePlayers();
    }
  }, [isAuthenticated, user?.player_id, user?.player?.id]);

  const fetchAvailablePlayers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players`, {
        withCredentials: true
      });
      setAvailablePlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleLinkPlayer = async () => {
    if (!selectedPlayerId) return;
    
    setIsLinking(true);
    setLinkingError('');
    
    try {
      const result = await linkPlayer(selectedPlayerId);
      if (result.success) {
        // Don't manually set isLinked - let useEffect handle it based on updated user data
        setSelectedPlayerId('');
      } else {
        setLinkingError(result.error || 'Failed to link player');
      }
    } catch (error) {
      setLinkingError('Failed to link player');
      console.error('Error linking player:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingPicture(true);
    setUploadMessage({ type: '', text: '' });

    const result = await uploadProfilePicture(file);
    
    if (result.success) {
      setUploadMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      // Clear success indicator after 3 seconds
      setTimeout(() => {
        setUploadMessage({ type: '', text: '' });
      }, 3000);
    } else {
      setUploadMessage({ type: 'error', text: result.error });
    }
    
    setUploadingPicture(false);
    // Clear the file input
    e.target.value = '';
  };

  const getPlayerImageUrl = (player, apiBaseUrl) => {
    // If this is the logged-in user's profile and they have a profile picture, use that
    if (isLinked && user?.profilePicture) {
      if (user.profilePicture.startsWith('http')) return user.profilePicture;
      return `${apiBaseUrl.replace('/api', '')}${user.profilePicture}`;
    }
    
    // Get base URL for images (remove /api from the API base URL)
    const imageBaseUrl = apiBaseUrl.replace('/api', '');
    
    // Otherwise use the player's image
    if (!player?.image) return `${imageBaseUrl}/uploads/players/placeholder.png`;
    if (player.image.startsWith('http')) return player.image;
    return `${imageBaseUrl}/uploads/players/${player.image}`;
  };

  if (!player) return null;

  return (
    <Modal onClose={onClose}>
      <div className="relative p-6 max-w-2xl mx-auto">
        {/* Account Linkage Section - At the top for better visibility */}
        {isAuthenticated && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Player Account Linkage
            </h3>
            
            {isLinked ? (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-green-700 font-medium">
                    ✓ Account linked to {player.name}
                  </p>
                  <p className="text-sm text-green-600">
                    Logged in as: {user.email}
                  </p>
                </div>
              </div>
            ) : user?.player_id ? (
              // User is linked to a different player
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-blue-700">
                    You are linked to a different player account
                  </p>
                  <p className="text-sm text-blue-600">
                    Logged in as: {user.email}
                  </p>
                </div>
              </div>
            ) : (
              // User has no linked player at all
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <p className="text-yellow-700">
                    No player account linked
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link to Player
                    </label>
                    <select
                      value={selectedPlayerId}
                      onChange={(e) => setSelectedPlayerId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Select a player to link</option>
                      {availablePlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {linkingError && (
                    <p className="text-red-600 text-sm">{linkingError}</p>
                  )}
                  
                  <button
                    onClick={handleLinkPlayer}
                    disabled={!selectedPlayerId || isLinking}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {isLinking ? 'Linking...' : 'Link Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message only - success is shown as an icon */}
        {uploadMessage.text && uploadMessage.type === 'error' && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300">
            {uploadMessage.text}
          </div>
        )}

        {/* Player Profile Information */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img
              src={getPlayerImageUrl(player, API_BASE_URL)}
              alt={player.name}
              className={`w-36 h-36 rounded-full mx-auto mb-4 transition-transform transform hover:scale-105 ${
                isLinked ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''
              }`}
              onClick={isLinked ? handleProfilePictureClick : undefined}
            />
            {uploadingPicture && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            {/* Success indicator */}
            {uploadMessage.type === 'success' && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {isLinked && (
              <div 
                className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
                onClick={handleProfilePictureClick}
                data-tippy-content="Click to upload new profile picture"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
          <h2 className="text-xl font-bold">{player.name}</h2>
          <p className="text-gray-500 text-sm">{player.email}</p>
          <p className="text-gray-500 text-sm">{player.phone_number}</p>
        </div>

        {/* Current Season Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">
            Current Season Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Current Handicap:</strong> {player.current_quota || 'N/A'}</p>
              <p><strong>Events Played:</strong> {player.events_played || 0}</p>
              <p><strong>Total Money Won:</strong> ${Number(player.money_won || 0).toFixed(2)}</p>
              <p><strong>Season Rank:</strong> #{player.rank || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Total CTPs:</strong> {player.ctps || 0}</p>
              <p><strong>Total Skins:</strong> {player.skins || 0}</p>
              <p><strong>Wins:</strong> {player.wins || 0}</p>
              <p><strong>Top 3 Finishes:</strong> {player.top_3 || 0}</p>
            </div>
          </div>
          <div className="mt-3">
            <p><strong>Total Points:</strong> <span className="text-lg font-bold text-blue-600">{Number(player.total_points || 0).toFixed(0)}</span></p>
          </div>
        </div>

        {/* Collapsible Historical Stats */}
        <div>
          <h3
            className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2 cursor-pointer flex items-center justify-between hover:text-blue-600"
            onClick={() => setShowHistorical(!showHistorical)}
          >
            Historical Stats
            <span className="text-blue-500">{showHistorical ? '▼' : '►'}</span>
          </h3>
          {showHistorical && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Career Events:</strong> {player.events_played || 0}</p>
                  <p><strong>Career Earnings:</strong> ${Number(player.money_won || 0).toFixed(2)}</p>
                  <p><strong>Career CTPs:</strong> {player.ctps || 0}</p>
                </div>
                <div>
                  <p><strong>Career Skins:</strong> {player.skins || 0}</p>
                  <p><strong>Top 10 Finishes:</strong> {player.top_10 || 0}</p>
                  <p><strong>Win Percentage:</strong> {player.events_played > 0 ? ((player.wins || 0) / player.events_played * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PlayerProfileModal;
