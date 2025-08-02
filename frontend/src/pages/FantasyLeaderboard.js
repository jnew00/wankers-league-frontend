import React, { useState, useEffect } from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import axios from 'axios';
import { useAuth } from '../context/UnifiedAuthContext';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

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

  // Initialize tooltips for player names in picks
  useEffect(() => {
    tippy('.player-name-tooltip', {
      placement: 'top',
      arrow: true,
      maxWidth: 200,
      delay: [500, 200],
    });
  }, [weeklyScores]);

  // Initialize tooltips for participant names in season standings
  useEffect(() => {
    tippy('.participant-name-tooltip', {
      placement: 'top',
      arrow: true,
      maxWidth: 200,
      delay: [500, 200],
    });
  }, [standings]);

  // Initialize tooltips for participant names in weekly breakdown
  useEffect(() => {
    tippy('.weekly-participant-name-tooltip', {
      placement: 'top',
      arrow: true,
      maxWidth: 200,
      delay: [500, 200],
    });
  }, [weeklyScores]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fantasy/standings`);
      // Ensure we always set an array, even if response structure is unexpected
      setStandings(Array.isArray(response.data.standings) ? response.data.standings : []);
    } catch (error) {
      setStandings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      // Fetch only events that have fantasy picks data
      const response = await axios.get(`${API_BASE_URL}/fantasy/events`);
      setEvents(response.data);
    } catch (error) {
      setEvents([]);
    }
  };

  const fetchWeeklyScores = async (eventId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fantasy/scores/${eventId}`);
      // Ensure we always set an array, even if response structure is unexpected
      setWeeklyScores(Array.isArray(response.data.scores) ? response.data.scores : []);
    } catch (error) {
      setWeeklyScores([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerBreakdown = async (eventId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fantasy/player-breakdown/${eventId}`);
      setPlayerBreakdown(Array.isArray(response.data.players) ? response.data.players : []);
    } catch (error) {
      setPlayerBreakdown([]);
    } finally {
      setLoading(false);
    }
  };

  // ScoreBreakdown: show correct sign for quota, highlight bonus, bonuses already included in total_points
  const ScoreBreakdown = ({ score }) => {
    // Quota sign logic: positive if over quota, negative if under
    let quotaPoints = score.quota_performance || 0;
    const quotaSign = quotaPoints > 0 ? '+' : '';
    return (
      <div className="text-xs text-gray-600 space-y-1">
        <div>
          Quota: <span className={quotaPoints > 0 ? 'text-green-600 font-semibold' : quotaPoints < 0 ? 'text-red-600 font-semibold' : ''}>{quotaSign}{quotaPoints}pts</span>
        </div>
        <div>Skins: {((score.skins_count || 0) * FANTASY_SCORING.skins).toFixed(1)}pts</div>
        <div>CTPs: {(score.ctp_count || 0) * FANTASY_SCORING.ctps}pts</div>
        {score.most_over_quota_bonus && (
          <div>Bonus: <span className="text-green-600 font-semibold">+{FANTASY_SCORING.bonuses.mostOverQuota}pts</span></div>
        )}
        {score.least_to_quota_penalty && (
          <div>Penalty: <span className="text-red-600 font-semibold">{FANTASY_SCORING.bonuses.leastToQuota}pts</span></div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Fireball Fantasy Fiasco Leaderboard" />
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
                  <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                      <tr>
                        <th className="p-2 text-center">Rank</th>
                        <th className="p-2 text-left">Participant</th>
                        <th className="p-2 text-center">Events Played</th>
                        <th className="p-2 text-center">Total Points</th>
                        <th className="p-2 text-center">Average/Event</th>
                        <th className="p-2 text-center">Best Week</th>
                        <th className="p-2 text-center">Winnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((participant, index) => (
                        <tr key={participant.participant_id} className={`${
                          index % 2 === 0 ? "bg-blue-50" : "bg-white"
                        } hover:bg-blue-100 ${
                          index < 3 ? "border-l-4 border-yellow-400" : ""
                        }`}>
                          <td className="p-4 text-center font-semibold">
                            <div className="flex items-center justify-center">
                              {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                              {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                              {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                              <span className="text-lg font-bold">
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-left">
                            <span 
                              className="cursor-help participant-name-tooltip"
                              data-tippy-content={participant.participant_name || participant.participant_id}
                            >
                              {participant.participant_name || participant.participant_id}
                            </span>
                          </td>
                          <td className="p-4 text-center">{participant.events_played}</td>
                          <td className="p-4 text-center">
                            <span className="text-lg font-bold text-blue-600">
                              {participant.total_points || 0}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {participant.avg_points_per_event && !isNaN(participant.avg_points_per_event) 
                              ? Number(participant.avg_points_per_event).toFixed(1) 
                              : '0.0'}
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-semibold text-green-600">
                              {participant.best_week || 0}
                            </span>
                          </td>
                          <td className="p-4 text-center">
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
                <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                    <tr>
                      <th className="p-2 text-center">Rank</th>
                      <th className="p-2 text-left">Participant</th>
                      <th className="p-2 text-center">Picks & Performance</th>
                      <th className="p-2 text-center">Score Breakdown</th>
                      <th className="p-2 text-center">Total Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(weeklyScores || [])
                      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
                      .map((score, index) => (
                      <tr key={score.participant_id} className={`${
                        index % 2 === 0 ? "bg-blue-50" : "bg-white"
                      } hover:bg-blue-100 ${
                        index < 3 ? "border-l-4 border-yellow-400" : ""
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-xl mr-2">🥇</span>}
                            {index === 1 && <span className="text-xl mr-2">🥈</span>}
                            {index === 2 && <span className="text-xl mr-2">🥉</span>}
                            <span className="text-sm font-bold text-gray-900">
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap border-r border-gray-300">
                          <div 
                            className="text-sm font-medium text-gray-900 cursor-help weekly-participant-name-tooltip"
                            data-tippy-content={score.participant_name || score.participant_id}
                          >
                            {score.participant_name || score.participant_id}
                          </div>
                        </td>
                        <td className="px-3 py-4 border-r border-gray-300">
                          <div className="space-y-2">
                            {score.picks && Object.entries(score.picks).map(([tier, pick], i) => {
                              const quotaDiff = pick.score && pick.quota ? pick.score - pick.quota : null;
                              const quotaSign = quotaDiff > 0 ? '+' : '';
                              // Highlight bonus/penalty for correct pick
                              let highlight = '';
                              const pickQuotaPerf = pick.score && pick.quota ? pick.score - pick.quota : null;
                              
                              if (pick.bonus_points > 0) {
                                highlight = 'bg-green-200 text-green-900 font-bold border-2 border-green-500';
                              } else if (pick.penalty_points < 0) {
                                highlight = 'bg-red-200 text-red-900 font-bold border-2 border-red-500';
                              } else if (score.most_over_quota_bonus && pickQuotaPerf !== null && pickQuotaPerf > 0) {
                                const allPickQuotaPerfs = Object.values(score.picks).map(p => p.score && p.quota ? p.score - p.quota : null).filter(v => v !== null);
                                const maxQuotaPerf = Math.max(...allPickQuotaPerfs);
                                if (pickQuotaPerf === maxQuotaPerf) {
                                  highlight = 'bg-green-200 text-green-900 font-bold border-2 border-green-500';
                                }
                              } else if (score.least_to_quota_penalty && pickQuotaPerf !== null) {
                                const allPickQuotaPerfs = Object.values(score.picks).map(p => p.score && p.quota ? p.score - p.quota : null).filter(v => v !== null);
                                const minQuotaPerf = Math.min(...allPickQuotaPerfs);
                                if (pickQuotaPerf === minQuotaPerf) {
                                  highlight = 'bg-red-200 text-red-900 font-bold border-2 border-red-500';
                                }
                              }
                              
                              if (!highlight) {
                                highlight = 'text-gray-900';
                              }
                              return (
          <div key={i} className="text-xs flex items-center gap-x-2 py-0">
            {/* Tier indicator */}
            <span className={`w-8 text-center rounded-full text-[10px] font-bold flex-shrink-0 ${
              i === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
              i === 1 ? 'bg-gray-100 text-gray-700 border border-gray-300' :
              'bg-orange-100 text-orange-700 border border-orange-300'
            }`}>T{i+1}</span>
            {/* Name with Tippy hover and highlight if bonus/penalty */}
            <span 
              className={'font-medium px-1 py-0.5 rounded cursor-help player-name-tooltip flex-grow min-w-0 ' + highlight}
              data-tippy-content={pick.name}
            >
              {pick.name}
            </span>
            {/* Quota diff */}
            <span className="text-center flex-shrink-0 w-8">
              {quotaDiff !== null && (
                <span className={quotaDiff >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {quotaSign}{quotaDiff}
                </span>
              )}
            </span>
            {/* Skins */}
            <span className="text-center flex-shrink-0 w-12">
              {pick.skins > 0 ? (
                <span className="text-blue-600 font-medium">{pick.skins} 🎯</span>
              ) : ''}
            </span>
            {/* CTPs */}
            <span className="text-center flex-shrink-0 w-12">
              {pick.ctps > 0 ? (
                <span className="text-purple-600 font-medium">{pick.ctps} 📍</span>
              ) : ''}
            </span>
            {/* Points */}
            <span className={`font-bold text-right flex-shrink-0 w-12 ${pick.points >= 0 ? 'text-green-700' : 'text-red-700'}`}>{pick.points}pts</span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-3 py-4 border-r border-gray-300">
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
                <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                    <tr>
                      <th className="p-2 text-left">Player</th>
                      <th className="p-2 text-center">Tier</th>
                      <th className="p-2 text-center">Score/Quota</th>
                      <th className="p-2 text-center">Skins</th>
                      <th className="p-2 text-center">CTPs</th>
                      <th className="p-2 text-center">Fantasy Points</th>
                      <th className="p-2 text-left">Picked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Find best and worst quota performance for highlighting
                      let minQuota = null;
                      let maxQuota = null;
                      playerBreakdown.forEach(player => {
                        if (player.score != null && player.quota != null) {
                          const quotaPerf = player.score - player.quota;
                          if (minQuota === null || quotaPerf < minQuota) minQuota = quotaPerf;
                          if (maxQuota === null || quotaPerf > maxQuota) maxQuota = quotaPerf;
                        }
                      });
                      return playerBreakdown.map((player, index) => {
                        let pickedBy = player.picked_by || 'None';
                        let quotaPerf = player.score != null && player.quota != null ? player.score - player.quota : null;
                        const isWorst = quotaPerf !== null && quotaPerf === minQuota;
                        const isBest = quotaPerf !== null && quotaPerf === maxQuota && maxQuota > 0;
                        return (
                          <tr key={`${player.player_name}-${player.tier}`} className={`${
                            index % 2 === 0 ? "bg-blue-50" : "bg-white"
                          } hover:bg-blue-100 ${
                            player.fantasy_points >= 10 ? 'border-l-4 border-green-400' : 
                            player.fantasy_points < 0 ? 'border-l-4 border-red-400' :
                            isBest ? 'border-l-4 border-yellow-400' :
                            isWorst ? 'border-l-4 border-gray-400' : ''
                          }`}>
                            <td className="p-4 text-left">
                              <div className="font-medium">
                                {player.player_name}
                                {isBest && <span className="ml-2 text-xs text-green-700 font-bold">🏆 Best Quota</span>}
                                {isWorst && <span className="ml-2 text-xs text-red-700 font-bold">💀 Worst Quota</span>}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                player.tier === 1 ? 'bg-yellow-100 text-yellow-800' :
                                player.tier === 2 ? 'bg-gray-100 text-gray-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                Tier {player.tier}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {player.score || 'N/A'} / {player.quota || 'N/A'}
                            </td>
                            <td className="p-4 text-center">{player.skins}</td>
                            <td className="p-4 text-center">{player.ctps}</td>
                            <td className="p-4 text-center">
                              <span className={`text-lg font-bold ${
                                player.fantasy_points >= 10 ? 'text-green-600' :
                                player.fantasy_points < 0 ? 'text-red-600' :
                                'text-blue-600'
                              }`}>
                                {player.fantasy_points}
                              </span>
                            </td>
                            <td className="p-4 text-left">{pickedBy}</td>
                          </tr>
                        );
                      });
                    })()}
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
