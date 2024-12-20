import React from "react";

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
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Player List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th className="p-4 text-left">Rank</th>
              <th className="p-4 text-left">Player</th>
              <th className="p-4 text-center">CTPs</th>
              <th className="p-4 text-center">Skins</th>
              <th className="p-4 text-center">Money Won</th>
              <th className="p-4 text-center">Total Points</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={index}
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
                        const selectedPlayer = allPlayers.find(
                          (p) => p.id === Number(e.target.value)
                        );
                        handlePlayerChange(
                          index,
                          "player_id",
                          selectedPlayer?.id || null
                        );
                        handlePlayerChange(
                          index,
                          "name",
                          selectedPlayer?.name || "N/A"
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

                <td className="p-4 text-center">
                  {player.isEditing ? (
                    <input
                      type="number"
                      value={player.ctps || 0}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "ctps",
                          Number(e.target.value)
                        )
                      }
                      className="border border-gray-300 rounded-lg p-2 w-16 text-center"
                    />
                  ) : (
                    player.ctps || 0
                  )}
                </td>
                <td className="p-4 text-center">
                  {player.isEditing ? (
                    <input
                      type="number"
                      value={player.skins || 0}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "skins",
                          Number(e.target.value)
                        )
                      }
                      className="border border-gray-300 rounded-lg p-2 w-16 text-center"
                    />
                  ) : (
                    player.skins || 0
                  )}
                </td>
                <td className="p-4 text-center">
                  {player.isEditing ? (
                    <input
                      type="number"
                      value={player.money_won || 0}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "money_won",
                          Number(e.target.value)
                        )
                      }
                      className="border border-gray-300 rounded-lg p-2 w-16 text-center"
                    />
                  ) : (
                    `$${Number(player.money_won || 0).toFixed(2)}`
                  )}
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
            {/* Add Player Button Row */}
            {selectedEvent && (
              <tr className="bg-gray-100 hover:bg-gray-200">
                <td colSpan="7" className="p-4 text-center">
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

export default PlayerList;
