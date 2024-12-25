import React, { memo } from "react";

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
  console.log("Rendering Players in PlayerList:", players);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Player List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th className="p-4 text-left">Rank</th>
              <th className="p-4 text-left">Player</th>
              <th className="p-4 text-center">Quota</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4 text-center">+/-</th>
              <th className="p-4 text-center">CTPs</th>
              <th className="p-4 text-center">Skins</th>
              <th className="p-4 text-center">Money Won</th>
              <th className="p-4 text-center">Total Points</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players
              .filter((player) => player.player_id)
              .map((player, index) => (
                <tr
                  key={player.player_id || index} // Fallback to index if player_id is undefined
                  className={`${
                    index % 2 === 0 ? "bg-blue-50" : "bg-white"
                  } hover:bg-blue-100 border-b`}
                >
                  <td className="p-4 text-left">
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
                        className="border border-gray-300 rounded-lg p-2 w-full"
                      >
                        <option value="">--</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((rank) => (
                          <option key={rank} value={rank}>
                            {rank}
                          </option>
                        ))}
                      </select>
                    ) : (
                      player.rank || "N/A"
                    )}
                  </td>
                  <td className="p-4 text-left">
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
                        className="border border-gray-300 rounded-lg p-2 w-full"
                      >
                        <option value="">-- Select Player --</option>
                        {allPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      player.name || "N/A"
                    )}
                  </td>
                  <td className="p-4 text-center">{player.quota || "N/A"}</td>
                  <td className="p-4 text-center">
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
                        className="border border-gray-300 rounded-lg p-2 w-16 text-center"
                      />
                    ) : (
                      player.score || 0
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
                  <td className="p-4 text-center">{player.ctps || 0}</td>
                  <td className="p-4 text-center">{player.skins || 0}</td>
                  <td className="p-4 text-center">
                    {`$${Number(player.money_won || 0).toFixed(2)}`}
                  </td>
                  <td className="p-4 text-center font-bold">
                    {player.total_points || 0}
                  </td>
                  <td className="p-4 text-center">
                    {player.isEditing ? (
                      <>
                        <button
                          onClick={() => handleSavePlayer(player, index)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit(index)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleEditMode(index)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePlayer(index, player.player_id)
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            {selectedEvent && (
              <tr className="bg-gray-100 hover:bg-gray-200">
                <td colSpan="10" className="p-4 text-center">
                  <button
                    onClick={handleAddPlayer}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Player
                  </button>
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
