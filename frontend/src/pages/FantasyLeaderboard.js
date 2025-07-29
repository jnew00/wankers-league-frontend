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
  const [playerBreakdown, setPlayerBreakdown] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('season'); // 'season', 'weekly', or 'players'
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
      fetchPlayerBreakdown(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fantasy/standings`);
      // Ensure we always set an array, even if response structure is unexpected
      setStandings(Array.isArray(response.data.standings) ? response.data.standings : []);
    } catch (error) {
      console.error('Error fetching standings:', error);
      setStandings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log('Fetching events from:', `${API_BASE_URL}/fantasy/events`);
      // Fetch only events that have fantasy picks data
      const response = await axios.get(`${API_BASE_URL}/fantasy/events`);
      console.log('Events response:', response.data);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching fantasy events:', error);
      console.error('Error details:', error.response);
      setEvents([]);
    }
  };

  const fetchWeeklyScores = async (eventId) => {
    try {
      setLoading(true);
      console.log('Fetching weekly scores for event:', eventId);
      const response = await axios.get(`${API_BASE_URL}/fantasy/scores/${eventId}`);
      console.log('Weekly scores response:', response.data);
      // Ensure we always set an array, even if response structure is unexpected
      setWeeklyScores(Array.isArray(response.data.scores) ? response.data.scores : []);
    } catch (error) {
      console.error('Error fetching weekly scores:', error);
      console.error('Error details:', error.response);
      setWeeklyScores([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerBreakdown = async (eventId) => {
    try {
      setLoading(true);
      console.log('Fetching player breakdown for event:', eventId);
      const response = await axios.get(`${API_BASE_URL}/fantasy/player-breakdown/${eventId}`);
      console.log('Player breakdown response:', response.data);
      setPlayerBreakdown(Array.isArray(response.data.players) ? response.data.players : []);
    } catch (error) {
      console.error('Error fetching player breakdown:', error);
      console.error('Error details:', error.response);
      setPlayerBreakdown([]);
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
              <button
                onClick={() => setActiveTab('players')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'players'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Player Performance
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
                {(standings || []).length} participants
              </div>
            </div>
            
            {standings && standings.length > 0 ? (
              <>


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
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Winnings
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
                              {participant.total_points || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-900">
                              {participant.avg_points_per_event && !isNaN(participant.avg_points_per_event) 
                                ? Number(participant.avg_points_per_event).toFixed(1) 
                                : '0.0'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-semibold text-green-600">
                              {participant.best_week || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-lg font-bold ${
                              participant.winnings > 0 ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              ${participant.winnings || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
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
                  {console.log('Rendering events:', events)}
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.course_name} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!loading && selectedEvent && weeklyScores && weeklyScores.length > 0 && (
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
                        Picks & Performance
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
                    {(weeklyScores || [])
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
                          <div className="space-y-2">
                            {score.picks && Object.entries(score.picks).map(([tier, pick], i) => (
                              <div key={i} className="text-xs">
                                <div className="font-medium text-gray-900">
                                  Tier {i + 1}: {pick.name}
                                </div>
                                <div className="text-gray-600 ml-2">
                                  Score: {pick.score || 'N/A'} | Quota: {pick.quota || 'N/A'} | 
                                  Rank: {pick.rank || 'N/A'} | 
                                  Skins: {pick.skins} | CTPs: {pick.ctps} | 
                                  <span className={`font-semibold ${pick.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {pick.points}pts
                                  </span>
                                </div>
                              </div>
                            ))}
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

            {!loading && selectedEvent && (!weeklyScores || weeklyScores.length === 0) && (
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

        {/* Player Performance Tab */}
        {activeTab === 'players' && isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Player Performance Breakdown</h2>
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

            {!loading && selectedEvent && playerBreakdown && playerBreakdown.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score/Quota
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skins
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CTPs
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fantasy Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Picked By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {playerBreakdown.map((player, index) => (
                      <tr key={`${player.player_name}-${player.tier}`} className={
                        player.fantasy_points >= 10 ? 'bg-green-50' : 
                        player.fantasy_points < 0 ? 'bg-red-50' : ''
                      }>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {player.player_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            player.tier === 1 ? 'bg-yellow-100 text-yellow-800' :
                            player.tier === 2 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            Tier {player.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">
                            {player.rank || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-900">
                            {player.score || 'N/A'} / {player.quota || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{player.skins}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{player.ctps}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-lg font-bold ${
                            player.fantasy_points >= 10 ? 'text-green-600' :
                            player.fantasy_points < 0 ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {player.fantasy_points}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {player.picked_by}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && selectedEvent && (!playerBreakdown || playerBreakdown.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No player data available for this event.</p>
              </div>
            )}

            {!selectedEvent && (
              <div className="text-center py-8">
                <p className="text-gray-500">Select an event to view player performance breakdown.</p>
              </div>
            )}
          </div>
        )}

                {/* Pot Information */}
                <div className="bg-blue-50 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Prize Pool Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Total Pot:</span>
                      <div className="text-xl font-bold text-blue-800">${standings.length * 20}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">1st Place (60%):</span>
                      <div className="text-lg font-semibold text-green-600">${Math.round(standings.length * 20 * 0.60)}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">2nd Place (30%):</span>
                      <div className="text-lg font-semibold text-yellow-600">${Math.round(standings.length * 20 * 0.30)}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">3rd Place (10%):</span>
                      <div className="text-lg font-semibold text-orange-600">${Math.round(standings.length * 20 * 0.10)}</div>
                    </div>
                  </div>
                </div>

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
