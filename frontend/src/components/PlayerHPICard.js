import React, { useState, useEffect } from 'react';

const PlayerHPICard = ({ playerId, className = "" }) => {
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/fantasy/player-stats/${playerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch player statistics');
        }
        
        const data = await response.json();
        setPlayerStats(data);
      } catch (err) {
        console.error('Error fetching player stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerStats();
    }
  }, [playerId]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>Unable to load performance statistics</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!playerStats) {
    return null;
  }

  const { player, hpiBreakdown, recentPerformance } = playerStats;

  const getHPIColor = (hpi) => {
    if (hpi >= 30) return 'text-green-600 bg-green-50';
    if (hpi >= 20) return 'text-blue-600 bg-blue-50';
    if (hpi >= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getHPILabel = (hpi) => {
    if (hpi >= 30) return 'Elite';
    if (hpi >= 20) return 'Strong';
    if (hpi >= 10) return 'Solid';
    return 'Developing';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Performance Index (HPI)
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHPIColor(player.hpi_score)}`}>
          {getHPILabel(player.hpi_score)}
        </div>
      </div>

      {/* HPI Score Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {player.hpi_score}
        </div>
        <div className="text-sm text-gray-500">
          Based on {player.games_played_season} games this season
        </div>
      </div>

      {/* HPI Breakdown */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 text-sm">HPI Breakdown</h4>
        
        <div className="space-y-3">
          {/* Quota Component */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Quota Performance</span>
            </div>
            <div className="text-sm font-medium">
              +{hpiBreakdown.quotaScore}
            </div>
          </div>
          
          {/* Skins Component */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Skins Bonus</span>
            </div>
            <div className="text-sm font-medium">
              +{hpiBreakdown.skinsBonus}
            </div>
          </div>
          
          {/* CTPs Component */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">CTP Bonus</span>
            </div>
            <div className="text-sm font-medium">
              +{hpiBreakdown.ctpBonus}
            </div>
          </div>
        </div>
      </div>

      {/* Season Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {player.current_quota}
          </div>
          <div className="text-xs text-gray-500">Current Quota</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {player.avg_skins.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Avg Skins</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {player.avg_ctps.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Avg CTPs</div>
        </div>
      </div>

      {/* Recent Performance */}
      {recentPerformance && recentPerformance.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 text-sm mb-3">Recent Performance</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentPerformance.slice(0, 5).map((game, index) => (
              <div key={game.id} className="flex justify-between items-center text-sm">
                <div className="text-gray-600 truncate">
                  {game.course_name}
                </div>
                <div className="flex space-x-2 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    Q: {game.quota}
                  </span>
                  <span className="bg-green-100 px-2 py-1 rounded">
                    S: {game.skins}
                  </span>
                  <span className="bg-yellow-100 px-2 py-1 rounded">
                    C: {game.ctps}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          HPI = Quota + (Avg Skins × 5) + (Avg CTPs × 8)
        </p>
      </div>
    </div>
  );
};

export default PlayerHPICard;
