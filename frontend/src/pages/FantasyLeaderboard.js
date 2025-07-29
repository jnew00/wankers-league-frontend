import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/UnifiedAuthContext';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

const FantasyLeaderboard = () => {
  const { isAuthenticated } = useAuth();
  const [standings, setStandings] = useState([]);
  const [weeklyScores, setWeeklyScores] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('season'); // 'season' or 'weekly'
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStandings();
      fetchEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedEvent) {
      fetchWeeklyScores(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fantasy/standings`);
      setStandings(response.data.standings);
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      // Fetch all events (completed ones will have fantasy scores)
      const response = await axios.get(`${API_BASE_URL}/admin/events`);
      setEvents(response.data.filter(event => event.closed)); // Only completed events have scores
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchWeeklyScores = async (eventId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fantasy/scores/${eventId}`);
      setWeeklyScores(response.data.scores);
    } catch (error) {
      console.error('Error fetching weekly scores:', error);
      setWeeklyScores([]);
    } finally {
      setLoading(false);
    }
  };

  const ScoreBreakdown = ({ score }) => (
    <div className="text-xs text-gray-600">
      <div>Ranking: {score.ranking_points || 0}pts</div>
      <div>Skins: {score.skins_count || 0} × 4 = {(score.skins_count || 0) * 4}pts</div>
      <div>CTPs: {score.ctp_count || 0} × 2 = {(score.ctp_count || 0) * 2}pts</div>
      <div>Quota: {score.quota_performance || 0}pts</div>
      <div className="font-semibold border-t pt-1 mt-1">
        Total: {score.total_points || 0}pts
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <PageHeader title="Fantasy Golf Leaderboard" />
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('season')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'season'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Season Standings
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'weekly'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Weekly Breakdown
              </button>
            </nav>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Authentication Required */}
        {!isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">Please log in to view fantasy golf leaderboards and scores</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login to Continue
            </button>
          </div>
        )}

        {/* Season Standings Tab */}
        {activeTab === 'season' && !loading && isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Season Standings</h2>
              <div className="text-sm text-gray-600">
                {standings.length} participants
              </div>
            </div>
            
            {standings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Events Played
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Points
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average/Event
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Best Week
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {standings.map((participant, index) => (
                      <tr key={participant.participant_id} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                            {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                            {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                            <span className="text-lg font-bold text-gray-900">
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {participant.participant_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{participant.events_played}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-lg font-bold text-blue-600">
                            {participant.total_points}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">
                            {participant.avg_points_per_event?.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-green-600">
                            {participant.best_week}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No fantasy data available yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Standings will appear after the first event with fantasy picks is completed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Weekly Breakdown Tab */}
        {activeTab === 'weekly' && isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Weekly Breakdown</h2>
              </div>
              
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event
                </label>
                <select
                  value={selectedEvent}
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
            </div>

            {!loading && selectedEvent && weeklyScores.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Picks
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score Breakdown
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weeklyScores
                      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
                      .map((score, index) => (
                      <tr key={score.participant_id} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-xl mr-2">🥇</span>}
                            {index === 1 && <span className="text-xl mr-2">🥈</span>}
                            {index === 2 && <span className="text-xl mr-2">🥉</span>}
                            <span className="text-sm font-bold text-gray-900">
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {score.participant_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-600">
                            {score.pick_names ? score.pick_names.split(',').map((name, i) => (
                              <div key={i} className="mb-1">
                                Tier {i + 1}: <span className="font-medium">{name.trim()}</span>
                              </div>
                            )) : 'No picks data'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ScoreBreakdown score={score} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-lg font-bold text-blue-600">
                            {score.total_points || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && selectedEvent && weeklyScores.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No scores available for this event.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Scores will appear after the event is completed and fantasy points are calculated.
                </p>
              </div>
            )}

            {!selectedEvent && (
              <div className="text-center py-8">
                <p className="text-gray-500">Select an event to view weekly scores and breakdowns.</p>
              </div>
            )}
          </div>
        )}

        {/* Fantasy Rules Reference */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">Fantasy Scoring Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Ranking Points</h4>
              <ul className="space-y-1 text-blue-600">
                <li>🥇 1st place: +10 points</li>
                <li>🥈 2nd place: +8 points</li>
                <li>🥉 3rd-5th place: +5 points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Performance Points</h4>
              <ul className="space-y-1 text-blue-600">
                <li>🎯 Each skin: +4 points</li>
                <li>📍 Each CTP: +2 points</li>
                <li>📊 Quota performance: +1 per point over, -1 per point under</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
      <Footer />
    </div>
  );
};

export default FantasyLeaderboard;
