import React, { useEffect, memo } from "react";
import calculateQuota from "../utils/calculateQuota";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';




const PlayerList = ({
  players = [],
  allPlayers = [],
  handlePlayerChange,
  toggleEditMode,
  handleDeletePlayer,
  handleSavePlayer,
  selectedEvent,
  handleAddPlayer,
  handleCancelEdit,
}) => {
  const isFedupEligible = selectedEvent?.fedup_eligible;

  useEffect(() => {
    tippy('[data-tippy-content]');
  }, []);

  return (
    <div className="mt-6">
      
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
  
        {!selectedEvent?.fedup_eligible && (
          <span
          className="px-2 py-1 text-xs font-bold text-red-800 bg-red-200 rounded-lg cursor-pointer"
          data-tippy-content="This event is non-FedUp eligible. Points will not be counted."
        >
          Non-FedUp Eligible
        </span>
        )}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th className="p-4 text-left w-16">Rank</th>
              <th className="p-4 text-left w-40">Player</th>
              <th className="p-4 text-center w-24">Quota</th>
              <th className="p-4 text-center w-24">Score</th>
              <th className="p-4 text-center w-24">+/-</th>
              <th className="p-4 text-center w-24">New Quota</th>
              <th className="p-4 text-center w-24">CTPs</th>
              <th className="p-4 text-center w-24">Skins</th>
              <th className="p-4 text-center w-24">Money Won</th>
              <th className="p-4 text-center w-32">Total Points</th>
              <th className="p-4 text-center w-40">Actions</th>
            </tr>
          </thead>

          <tbody>
            {players.map((player, index) => (
              <tr
                key={player.player_id || index} // Fallback to index if player_id is undefined
                className={`${
                  index % 2 === 0 ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100 border-b`}
              >
                <td className="p-4 text-left w-16 h-8">
                  {player.isEditing ? (
                    <select
                      value={player.rank || ""}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "rank",
                          Number(e.target.value)
                        )
                      }
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
                    <div className="h-8 flex items-center">{player.rank || "N/A"}</div>
                  )}
                </td>
                <td className="p-4 text-left w-40 h-8">
                {player.isEditing && !player.player_id ? (
                    <select
                      value={player.player_id || ""}
                      onChange={(e) => {
                        const selectedPlayerId = Number(e.target.value);
                        const selectedPlayer = allPlayers.find(
                          (p) => p.id === selectedPlayerId
                        );
                        handlePlayerChange(
                          index,
                          "player_id",
                          selectedPlayerId
                        );
                        handlePlayerChange(
                          index,
                          "name",
                          selectedPlayer?.name || ""
                        );
                        handlePlayerChange(
                          index,
                          "quota",
                          selectedPlayer?.current_quota || 0
                        );
                      }}
                      className="border border-gray-300 rounded-lg p-1 h-8 w-full text-sm"
                      >
                    <option value="">-- Select Player --</option>
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
                    <div className="h-8 flex items-center">{player.name || "N/A"}</div>
                  )}
                </td>
                <td className="p-4 text-center">{player.quota || "N/A"}</td>

                <td className="p-4 text-left w-16 h-8">
                  {player.isEditing ? (
                    <input
                      type="number"
                      value={player.score || ""}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "score",
                          Number(e.target.value)
                        )
                      }
                      className="border border-gray-300 rounded-lg p-0 h-8 w-full text-sm text-center"
                    />
                  ) : (
                    <div className="h-8 flex items-center">{player.score || 0}</div>
                  )}
                </td>
                <td className="p-4 text-center font-bold">
                  {player.score !== null && player.quota !== null ? (
                    <>
                      {player.score - player.quota > 0 ? (
                        <span className="text-green-500">
                          +{player.score - player.quota}
                        </span>
                      ) : player.score - player.quota < 0 ? (
                        <span className="text-red-500">
                          {player.score - player.quota}
                        </span>
                      ) : (
                        "0"
                      )}
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="p-4 text-center font-bold">
                  {calculateQuota(player.quota, player.score) || 0}
                </td>

                <td className="p-4 text-left w-16 h-8">
                {player.isEditing ? (
                    <input
                      type="number"
                      value={player.ctps || 0}
                      disabled={!isFedupEligible}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "ctps",
                          Number(e.target.value)
                        )
                      }
                      className={`border border-gray-300 rounded-lg p-0 h-8 w-full text-sm text-center ${
                        !isFedupEligible ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  ) : (
                    <div className="h-8 flex items-center">{player.ctps || 0}</div>
                  )}
                </td>

               <td className="p-4 text-left w-16 h-8">
                {player.isEditing ? (
                    <input
                      type="number"
                      value={player.skins  || 0}
                      disabled={!isFedupEligible}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "skins",
                          Number(e.target.value)
                        )
                      }
                      className={`border border-gray-300 rounded-lg p-0 h-8 w-full text-sm text-center ${
                        !isFedupEligible ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  ) : (
                    <div className="h-8 flex items-center">{player.skins || 0}</div>
                  )}
                </td>

                <td className="p-4 text-left w-16 h-8">
                  {player.isEditing ? (
                    <input
                      type="number"
                      value={Number(player.money_won || 0)}
                      disabled={!isFedupEligible}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "money_won",
                          Number(e.target.value)
                        )
                      }
                      className={`border border-gray-300 rounded-lg p-0 h-8 w-full text-sm text-center ${
                        !isFedupEligible ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  ) : (
                    <div className="h-8 flex items-center">{`$${Number(player.money_won || 0).toFixed(2)}`}</div>
                  )}


                </td>

                <td className="p-4 text-center font-bold">
                  {isFedupEligible ? Number(player.total_points || 0).toFixed(0) : "--"}
                </td>

                <td className="p-4 text-center w-40 h-8 whitespace-nowrap">
                {player.isEditing ? (
                    <div className="flex items-center justify-center space-x-2">

                      <button
                        onClick={() => handleSavePlayer(player, index)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleCancelEdit(index)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => toggleEditMode(index)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs"
                        >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeletePlayer(index, player.player_id)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs"
                        >
                        Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {selectedEvent && (
              <tr className="bg-gray-100 hover:bg-gray-200">
                <td colSpan="11" className="p-2 text-right">
                  <button
                    onClick={handleAddPlayer}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-xs mr-2"
                  >
                    Add Player
                  </button>
                </td>
                <td>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(PlayerList);
