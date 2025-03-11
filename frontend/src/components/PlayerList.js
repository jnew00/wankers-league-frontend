import React, { useEffect, memo } from "react";
import calculateQuota from "../utils/calculateQuota";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

const PlayerList = ({
  allPlayers = [],
  players = [],
  handlePlayerChange,
  toggleEditMode,
  handleDeletePlayer,
  handleSavePlayer,
  selectedEvent,
  handleAddPlayer,
  handleCancelEdit,
  ctpPot,
  skinPot,
  remainingPot,
}) => {
  const isFedupEligible = selectedEvent?.isFedupEligible;
  useEffect(() => {
    tippy("[data-tippy-content]");
  }, [players, selectedEvent]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      tippy("[data-tippy-content]");
    }, 0);
    return () => clearTimeout(timeout);
  }, [players, selectedEvent]);
  

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        {!isFedupEligible && (
          <span
            className="px-2 py-1 text-xs font-bold text-red-800 bg-red-200 rounded-lg cursor-pointer"
            data-tippy-content="This event is non-FedUp eligible. Points will not be counted."
          >
            Non-FedUp Eligible
          </span>
        )}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th className="p-4 text-left w-60">Player</th>
              {isFedupEligible && <th className="p-4 text-left w-20">Place</th>}
              <th className="p-4 text-center w-24">Quota</th>
              <th className="p-4 text-center w-24">Score</th>
              <th className="p-4 text-center w-24">+/-</th>
              <th className="p-4 text-center w-24">New Quota</th>
              {isFedupEligible && <th className="p-1 text-center w-40">CTPs</th>}
              {isFedupEligible && <th className="p-1 text-center w-40">Skins</th>}
              <th className="p-4 text-center w-24">Money Won</th>
              {isFedupEligible && <th className="p-4 text-center w-32">Total Points</th>}
              <th className="p-4 text-center w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
      
              return (
                <tr
                  key={player.player_id}
                  className={`${
                    index % 2 === 0 ? "bg-blue-50" : "bg-white"
                  } hover:bg-blue-100 border-b`}
                >
{/* Player name */}
                  <td className="p-4 text-left w-50 h-8">
                    {player.isEditing && !player.player_id ? (
                      <select
                        value={player.player_id || ""}
                        onChange={(e) => {
                          const selectedPlayerId = Number(e.target.value);
                          const selectedPlayer = allPlayers.find(
                            (p) => p.id === selectedPlayerId
                          );
                          handlePlayerChange(selectedPlayerId, {
                            player_id: selectedPlayerId,
                            name: selectedPlayer?.name || "",
                            quota: selectedPlayer?.current_quota || 0,
                            events_played: selectedPlayer?.events_played || 0,
                          });
                        }}
                        className="border border-gray-300 rounded-lg p-1 h-8 w-full text-sm"
                      >
                        <option value="">Select Player</option>
                        {allPlayers
                          .filter(
                            (p) => !players.some((player) => player.player_id === p.id)
                          )
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2">
                      <span>{player.name || "-"}</span>
                      {/* Add Badge for Non-FedUp Players */}
                      {!player.season_paid && (
                        <span
                          className="px-2 py-1 text-s font-bold rounded-lg"
                          data-tippy-content="Not a FedUp Cup Participant"
                        >
                          ⛔️
                        </span>
                      )}
                    </div>
                    )}
                  </td>

{/* Rank (Place) */}
{isFedupEligible && (         
                  <td className="p-4 text-center w-30 h-8">
                    {player.isEditing ? (
                        <select
                        value={player.rank || ""}
                        onChange={(e) => {
                          const newRank = Number(e.target.value);
                          handlePlayerChange(player.player_id, { rank:  newRank });
                        }}
                        disabled={!player.player_id} // Disable if player_id is null or undefined
                        className="border border-gray-300 rounded-lg p-0 h-8 w-full text-sm"
                        >
                        <option value="">--</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((rank) => (
                          <option key={rank} value={rank}>
                            {rank}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-8 flex items-center text-center">{player.rank || "-"}</div>
                    )}
                  </td>
                )}
{/* Event Quota */}                  
                  <td className="p-4 w-24 text-center h-8">{player.current_quota || "-"}</td>
{/* Score Editing */}
               
                  <td className="p-4 w-24 text-center h-8">
                    {player.isEditing ? (
                      <input
                        type="text" 
                        value={player.score === 0 || player.score === null ? "" : player.score}
                        placeholder="score"
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value === "" ? null : Number(value);
                          // Allow only valid numbers within range
                          if (numericValue === null || (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 40)) {
                          handlePlayerChange(player.player_id, { score: numericValue });
                          }
                        }}
                        className="border border-gray-300 rounded focus:ring focus:ring-blue-300 focus:border-blue-500  w-12 h-8 text-center transition-all"
                      />
                    ) : (
                      <div className="h-8 flex items-center justify-center">{player.score || 0}</div>
                    )}
                  </td>
             
{/* +/- */}                
                  <td className="p-4 w-24 text-center font-bold">
                    {player.score !== null && player.current_quota !== null ? (
                      <>
                        {player.new_player && player.events_played < 2 && player.score - player.current_quota > 2 ? (
                          <div className="flex items-center justify-center space-x-1">
                            <span
                              className="text-green-500 font-bold"
                              data-tippy-content={`Score capped at +2 for new player rule. Actual: +${player.score - player.current_quota}. Remaining caps: ${1 - player.events_played}`}
                            >
                              +2
                            </span>
                            <span
                              className="text-blue-600 font-bold text-xs"
                              title={`Remaining caps: ${1 - player.events_played}`}
                            >
                              🧢
                            </span>
                          </div>
                        ) : player.score - player.current_quota > 0 ? (
                          <span className="text-green-500">+{player.score - player.current_quota}</span>
                        ) : player.score - player.current_quota < 0 ? (
                          <span className="text-red-500">{player.score - player.current_quota}</span>
                        ) : (
                          "0"
                        )}
                      </>
                    ) : (
                      "N/A"
                   )}
                  </td>
{/* Calculated Quota */}                
                  <td className="p-4 text-center font-bold">
                    {calculateQuota(player.current_quota, player.score) || 0}
                  </td>

{/* CTPs Editing */}
{isFedupEligible && (
                  <td className="text-center w-40 h-8">
                    {player.isEditing ? (
                      <div className="flex items-center space-x-1 justify-center">
                        <button
                          onClick={() => {
                            handlePlayerChange(player.player_id, { ctps: Math.max(0, (player.ctps || 0) - 1) });
                          }}
                          className="bg-blue-500 hover:bg-blue-700 text-white rounded w-6 h-6 text-center font-bold"
                          disabled={player.ctps <= 0}
                        >
                          -
                        </button>
                        <span className="font-medium">{player.ctps || 0}</span>
                        <button
                          onClick={() => {
                            handlePlayerChange(player.player_id, { ctps: (player.ctps || 0) + 1 });
                          }}
                          className="bg-blue-500 hover:bg-blue-700 text-white rounded w-6 h-6 text-center font-bold"
                          disabled={player.ctps >= 4}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="h-8 flex items-center justify-center">{player.ctps || 0}</div>
                    )}
                  </td>
                )}
{/* Skins Editing */}
{isFedupEligible && (
                  <td className="text-left w-40 h-8">
                    {player.isEditing ? (
                      <div className="flex items-center space-x-1 justify-center">
                        <button
                          onClick={() => {
                            handlePlayerChange(player.player_id, { skins: Math.max(0, (player.skins || 0) - 1) });
                          }}
                          className="bg-blue-500 hover:bg-blue-700 text-white rounded w-6 h-6 text-center font-bold"
                          disabled={player.skins <= 0}
                        >
                          -
                        </button>
                        <span className="font-medium">{player.skins || 0}</span>
                        <button
                          onClick={() => {
                            handlePlayerChange(player.player_id, { skins: (player.skins || 0) + 1 });
                          }}
                          className="bg-blue-500 hover:bg-blue-700 text-white px-0 py-0 rounded w-6 h-6 text-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="h-8 flex items-center justify-center">{player.skins || 0}</div>
                    )}
                  </td>
                )}
       
{/* Money Editing */}

                  <td className="p-4 w-24 text-center h-8">
                    {player.isEditing ? (
                      <input
                        type="text"
                        value={player.money_won === 0 || player.money_won === null ? "" : player.money_won}
                        placeholder="$"
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value === "" ? null : Number(value);
                          // Allow only valid numbers within range
                          if (numericValue === null || (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 1000)) {
                          handlePlayerChange(player.player_id, { money_won: numericValue });
                          }
                        }}
                        className="border border-gray-300 rounded focus:ring focus:ring-blue-300 focus:border-blue-500 h-8 w-12 text-center transition-all appearance-none"      
                      />
                    ) : (
                      <div className="h-8 flex items-center justify-center">{player.money_won || 0}</div>
                    )}
                  </td>
              
{/* Total Points */}
{isFedupEligible && (
 
                  <td className="p-4 text-center w-32 font-bold">
                     {player.season_paid ? Number(player.total_points || 0).toFixed(0) : "-"}
                   </td>
  )}
{/* Actions */}
                  <td className="p-4 text-center w-32 h-8 whitespace-nowrap">
                    {player.isEditing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleSavePlayer(player, player.player_id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit(player.player_id)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => toggleEditMode(player.player_id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.player_id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

{selectedEvent && isFedupEligible && (
              
              <tr className="bg-gray-100 hover:bg-gray-200">
                <td colSpan="6" className="p-4 text-right font-semibold">
                  Remaining Pots:
                </td>
                <td className="p-4 text-center font-semibold">${ctpPot.toFixed(2)}</td>
                <td className="p-4 text-center font-semibold">${skinPot.toFixed(2)}</td>
                <td className="p-4 text-center font-semibold">${remainingPot.toFixed(2)}</td>
                <td colSpan="11" className="p-2 text-right">
                  <button
                    onClick={handleAddPlayer}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-xs mr-2"
                  >
                    Add Player
                  </button>
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(PlayerList);
