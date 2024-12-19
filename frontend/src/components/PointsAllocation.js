import React from "react";

export const labelMapping = {
  place1: "1st Place",
  place2: "2nd Place",
  place3: "3rd Place",
  place4: "4th Place",
  place5: "5th Place",
  place6: "6th Place",
  place7: "7th Place",
  place8: "8th Place",
  ctp: "CTP",
  skin: "Skins",
  ctp_skin_cap: "Extras Cap",
  participation: "Participation",
};

const PointsAllocation = ({
  pointsConfig,
  isEditingPoints,
  toggleEditPoints,
  handlePointsChange,
  savePointsConfig,
}) => {
  return (
    <div className="w-full h-full bg-gray-50 shadow-md rounded-lg p-3 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Points Allocation</h3>
        <button
          onClick={toggleEditPoints}
          className="text-blue-600 text-xs hover:underline"
        >
          {isEditingPoints ? "Cancel" : "Edit"}
        </button>
      </div>
      <table className="w-full text-sm table-auto border-collapse">
        <thead>
          <tr>
            <th className="text-left border-b border-gray-300 p-2">Category</th>
            <th className="text-right border-b border-gray-300 p-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(pointsConfig).map(([key, value]) => (
            <tr key={key}>
              <td className="p-2 border-b border-gray-200">
                {labelMapping[key] || key}
              </td>
              <td className="p-2 border-b border-gray-200 text-right">
                {isEditingPoints ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      handlePointsChange(key, Number(e.target.value))
                    }
                    className="border border-gray-300 rounded-lg p-1 w-full text-right"
                  />
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isEditingPoints && (
        <button
          onClick={savePointsConfig}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full"
        >
          Save Points
        </button>
      )}
    </div>
  );
};

export default PointsAllocation;
