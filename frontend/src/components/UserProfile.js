import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/UnifiedAuthContext';
import { API_BASE_URL } from '../utils/apiConfig';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const UserProfile = () => {
  const { user, updateProfile, uploadProfilePicture, getProfile, linkPlayer } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    handicap: '',
    bio: ''
  });
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);

  const loadProfile = useCallback(async () => {
    const result = await getProfile();
    if (result.success) {
      setProfile({
        firstName: result.profile.first_name || '',
        lastName: result.profile.last_name || '',
        email: result.profile.email || '',
        phone: result.profile.phone || '',
        handicap: result.profile.handicap || '',
        bio: result.profile.bio || ''
      });
    }
  }, [getProfile]);

  const loadAvailablePlayers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/players`);
      const players = await response.json();
      
      // Filter out players that are already linked to users
      const unlinkedPlayers = players.filter(player => !player.user_id);
      setAvailablePlayers(unlinkedPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadAvailablePlayers();
  }, [loadProfile, loadAvailablePlayers]);

  // Initialize tippy for tooltips
  useEffect(() => {
    tippy('[data-tippy-content]');
  }, [user, uploadingPicture]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await updateProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      handicap: profile.handicap ? parseFloat(profile.handicap) : null,
      bio: profile.bio
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  };

  const handleLinkPlayer = async () => {
    if (!selectedPlayer) return;
    
    setLoading(true);
    const result = await linkPlayer(selectedPlayer);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Player account linked successfully!' });
      setSelectedPlayer('');
      loadAvailablePlayers(); // Refresh available players
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureClick = () => {
    console.log('Profile picture clicked, opening file dialog');
    console.log('fileInputRef.current:', fileInputRef.current);
    if (fileInputRef.current) {
      console.log('File input found, calling click()');
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null!');
    }
  };

  const handleProfilePictureChange = async (e) => {
    console.log('File input changed', e.target.files);
    const file = e.target.files[0];
    if (!file) return;

    console.log('Selected file:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingPicture(true);
    setMessage({ type: '', text: '' });

    console.log('Starting upload...');
    const result = await uploadProfilePicture(file);
    console.log('Upload result:', result);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    
    setUploadingPicture(false);
    // Clear the file input
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>
      
      {/* Debug Info */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
        <strong>Debug Info:</strong><br/>
        User: {user ? 'Loaded' : 'Not loaded'}<br/>
        Profile Picture: {user?.profilePicture || 'None'}<br/>
        User ID: {user?.id || 'None'}
      </div>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div 
            className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden border-4 border-gray-300 hover:border-blue-400"
            onClick={() => {
              console.log('Main profile picture area clicked');
              handleProfilePictureClick();
            }}
          >
            {user?.profilePicture ? (
              <img 
                src={`${API_BASE_URL.replace('/api', '')}${user.profilePicture}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-500">Click to upload</p>
              </div>
            )}
          </div>
          {uploadingPicture && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors" 
            onClick={handleProfilePictureClick}
            data-tippy-content="Click to upload new profile picture"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
          className="hidden"
        />
      </div>
      
      <div className="text-center mb-6">
        <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
        <button 
          onClick={() => {
            console.log('Test button clicked');
            handleProfilePictureClick();
          }}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test File Upload
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            className="w-full p-2 border rounded-md bg-gray-100"
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Handicap</label>
          <input
            type="number"
            step="0.1"
            value={profile.handicap}
            onChange={(e) => handleInputChange('handicap', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="12.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="3"
            placeholder="Tell us about yourself..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {/* Player Linking Section */}
      {user && !user.player_id && availablePlayers.length > 0 && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-lg font-medium mb-4">Link Existing Player Account</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you already have a player profile in our system, you can link it to your account.
          </p>
          
          <div className="flex gap-2">
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="flex-1 p-2 border rounded-md"
            >
              <option value="">Select a player...</option>
              {availablePlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.name} {player.handicap ? `(${player.handicap})` : ''}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleLinkPlayer}
              disabled={!selectedPlayer || loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Link Player
            </button>
          </div>
        </div>
      )}

      {/* Linked Player Info */}
      {user && user.player_id && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800">Player Account Linked</h3>
          <p className="text-green-600">
            Your account is linked to player: {user.player_name}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
