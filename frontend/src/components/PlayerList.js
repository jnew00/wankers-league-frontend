import React from "react";

const PlayerList = ({
  players = [],
  handlePlayerChange,
  toggleEditMode,
  handleDeletePlayer,
  handleSavePlayer,
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
                <td className="p-4 text-left">{player.name || "N/A"}</td>
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
                  <button
                    onClick={() => {
                      if (player.isEditing) {
                        handleSavePlayer(player);
                      }
                      toggleEditMode(index);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs mr-2"
                  >
                    {player.isEditing ? "Save" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(index, player.player_id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerList;
