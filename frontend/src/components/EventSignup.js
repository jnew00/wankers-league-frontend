import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/UnifiedAuthContext';

const EventSignup = ({ event, pairings = [], onSignupChange }) => {
  const { user, isAuthenticated, signUpForEvent, withdrawFromEvent } = useAuth();
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [signupStatus, setSignupStatus] = useState({
    canSignup: true,
    reason: '',
    currentCount: 0,
    maxPlayers: null,
    hasPairings: false
  });

  const checkSignupStatus = useCallback(async () => {
    if (!user || !event) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/auth/events/${event.id}/signups`, {
        credentials: 'include'
      });
      const signups = await response.json();
      
      // Check if current user is signed up (compare by player_id)
      const userPlayerId = user?.player_id || user?.player?.id;
      const userSignup = signups.find(signup => signup.player_id === userPlayerId);
      setIsSignedUp(!!userSignup);
      
      // Check if pairings exist (use prop if available, otherwise fetch)
      const hasPairings = Array.isArray(pairings) && pairings.length > 0;
      
      // Set signup status
      setSignupStatus({
        canSignup: !hasPairings, // Cannot signup if pairings exist
        reason: hasPairings ? 'Please email Nash and/or Rules Committee to be added or withdraw after the pairings are set or max players have been reached' : '',
        currentCount: signups.length,
        maxPlayers: event.max_players,
        hasPairings: hasPairings
      });
    } catch (error) {
      console.error('Error checking signup status:', error);
    }
  }, [user, event, pairings]);

  useEffect(() => {
    checkSignupStatus();
  }, [checkSignupStatus]);

  const handleSignup = async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Please log in to sign up for events' });
      return;
    }

    const userPlayerId = user?.player_id || user?.player?.id;
    if (!userPlayerId) {
      setMessage({ type: 'error', text: 'Please link a player account to sign up for events' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await signUpForEvent(event.id);
    
    if (result.success) {
      setIsSignedUp(true);
      setMessage({ type: 'success', text: result.message });
      // Refresh signup status and notify parent
      await checkSignupStatus();
      if (onSignupChange) onSignupChange();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    
    setLoading(false);
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await withdrawFromEvent(event.id);
    
    if (result.success) {
      setIsSignedUp(false);
      setMessage({ type: 'success', text: result.message });
      // Refresh signup status and notify parent
      await checkSignupStatus();
      if (onSignupChange) onSignupChange();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!event) return null;

  const eventDate = new Date(event.date);
  const isEventPassed = eventDate < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
          <p className="text-gray-600">{event.course_name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(event.date)}
          </p>
          {event.tee_time && (
            <p className="text-gray-600">
              Tee Time: {formatTime(event.tee_time)}
            </p>
          )}
        </div>
      </div>

      {event.description && (
        <p className="text-gray-700 mb-4">{event.description}</p>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Entry Fee:</span> ${event.entry_fee || 0}
        </div>
        <div className="text-sm text-gray-600">
          {event.max_players ? (
            <span className="font-medium">Players: {signupStatus.currentCount}/{event.max_players}</span>
          ) : (
            <span className="font-medium">Players: {signupStatus.currentCount}</span>
          )}
        </div>
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

      <div className="flex gap-2">
        {!isAuthenticated ? (
          <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center">
            Log in to sign up for events
          </div>
        ) : !(user?.player_id || user?.player?.id) ? (
          <div className="w-full bg-yellow-100 text-yellow-700 py-2 px-4 rounded-md text-center">
            Link a player account to sign up
          </div>
        ) : isEventPassed ? (
          <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center">
            Event has passed
          </div>
        ) : !signupStatus.canSignup && !isSignedUp ? (
          <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center">
            {signupStatus.reason}
          </div>
        ) : isSignedUp ? (
          signupStatus.hasPairings ? (
            <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center">
              Please email Nash and/or Rules Committee to be added or withdraw after the pairings are set or max players have been reached
            </div>
          ) : (
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Withdraw from Event'}
            </button>
          )
        ) : (
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign Up for Event'}
          </button>
        )}
      </div>

      {isSignedUp && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm text-center">
          ✓ You are registered for this event
        </div>
      )}
      
      {signupStatus.hasPairings && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm text-center">
          🏌️ Pairings have been set for this event
        </div>
      )}
    </div>
  );
};

export default EventSignup;
