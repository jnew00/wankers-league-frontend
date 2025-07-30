import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/UnifiedAuthContext';

const API_BASE_URL = 'https://signin.gulfcoasthackers.com/api';

const EventSignup = ({ event, onSignupChange }) => {
  const { user, signUpForEvent, withdrawFromEvent } = useAuth();
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [signupCount, setSignupCount] = useState(event?.signups || 0);
  const [loading, setLoading] = useState(false);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [signedUpPlayers, setSignedUpPlayers] = useState([]);

  const checkSignupStatus = useCallback(async () => {
    if (!user || !event) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/events/${event.id}/signups`, {
        credentials: 'include'
      });
      const signups = await response.json();
      
      // Check if current user is signed up (compare by player_id)
      const userPlayerId = user?.player_id || user?.player?.id;
      const userSignup = signups.find(signup => signup.player_id === userPlayerId);
      setIsSignedUp(!!userSignup);
      
      setSignupCount(signups.length);
      setSignedUpPlayers(signups);
    } catch (error) {
      console.error('Error checking signup status:', error);
    }
  }, [user, event]);

  useEffect(() => {
    checkSignupStatus();
  }, [checkSignupStatus]);

  const handleSignup = async () => {
    if (!user) return;
    
    setLoading(true);
    let result;
    
    if (isSignedUp) {
      result = await withdrawFromEvent(event.id);
    } else {
      result = await signUpForEvent(event.id);
    }
    
    if (result.success) {
      await checkSignupStatus();
      onSignupChange && onSignupChange();
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  if (!event) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Event Signup</h3>
        <button
          onClick={() => setShowPlayerList(!showPlayerList)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showPlayerList ? 'Hide' : 'Show'} Players ({signupCount})
        </button>
      </div>

      {user ? (
        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isSignedUp
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50`}
        >
          {loading ? 'Processing...' : isSignedUp ? 'Withdraw' : 'Sign Up'}
        </button>
      ) : (
        <div className="text-center py-4 text-gray-600">
          Please log in to sign up for events
        </div>
      )}

      {showPlayerList && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-2">Signed Up Players:</h4>
          {signedUpPlayers.length > 0 ? (
            <ul className="space-y-1">
              {signedUpPlayers.map((signup, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {signup.player_name || `${signup.first_name} ${signup.last_name}`.trim() || signup.username}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No players signed up yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventSignup;