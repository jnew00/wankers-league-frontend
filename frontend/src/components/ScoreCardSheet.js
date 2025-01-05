import React from "react";

const ScorecardSheet = ({ eventDetails, players, scorecard }) => {
  const holes = Array.from({ length: 18 }, (_, i) => i + 1);
  const par3Holes = [2, 6, 11, 15];
  const emptyPlayerSlots = 3;
  const skinsRowsPerTable = 8; // Number of rows per table

  const payoutData = [
    { players: 4, places: 1, payouts: [40] },
    { players: 5, places: 2, payouts: [40, 10] },
    { players: 6, places: 2, payouts: [40, 20] },
    { players: 7, places: 2, payouts: [45, 25] },
    { players: 8, places: 3, payouts: [45, 20, 15] },
    { players: 9, places: 3, payouts: [45, 30, 15] },
    { players: 10, places: 3, payouts: [50, 30, 20] },
    { players: 11, places: 4, payouts: [50, 30, 20, 10] },
    { players: 12, places: 4, payouts: [50, 35, 20, 15] },
    { players: 13, places: 4, payouts: [55, 35, 25, 15] },
    { players: 14, places: 4, payouts: [60, 40, 25, 15] },
    { players: 15, places: 5, payouts: [60, 40, 25, 15, 10] },
    { players: 16, places: 5, payouts: [60, 40, 30, 20, 10] },
    { players: 17, places: 5, payouts: [65, 40, 30, 20, 15] },
    { players: 18, places: 5, payouts: [65, 45, 35, 20, 15] },
    { players: 19, places: 6, payouts: [70, 45, 30, 20, 15, 10] },
    { players: 20, places: 6, payouts: [70, 45, 35, 25, 15, 10] },
    { players: 21, places: 6, payouts: [70, 45, 35, 25, 20, 15] },
    { players: 22, places: 7, payouts: [70, 45, 35, 25, 20, 15, 10] },
    { players: 23, places: 7, payouts: [75, 50, 35, 25, 20, 15, 10] },
    { players: 24, places: 7, payouts: [75, 50, 40, 30, 20, 15, 10] },
    { players: 25, places: 7, payouts: [75, 50, 40, 30, 25, 20, 10] },
    { players: 26, places: 8, payouts: [75, 50, 40, 30, 25, 20, 15, 5] },
    { players: 27, places: 8, payouts: [75, 50, 40, 30, 25, 20, 10, 10] },
    { players: 28, places: 8, payouts: [75, 50, 40, 30, 25, 25, 20, 15] },
  ];

  const getHardestHoles = (start, end, count) => {
    return scorecard
      .filter((hole) => hole.hole >= start && hole.hole <= end)
      .sort((a, b) => a.handicap - b.handicap) // Sort by handicap (ascending)
      .slice(0, count) // Get `count` hardest holes
      .map((hole) => hole.hole); // Return the hole numbers
  };

  const getHighlightedHoles = (quota) => {
    if (quota >= 1 && quota <= 5) {
      return [...hardestHolesFront9, ...hardestHolesBack9];
    } else if (quota >= 6 && quota <= 9) {
      return [...hardestHoleFront9, ...hardestHoleBack9];
    }
    return [];
  };

  const hardestHolesFront9 = getHardestHoles(1, 9, 2); // Hardest 2 holes for front 9
  const hardestHolesBack9 = getHardestHoles(10, 18, 2); // Hardest 2 holes for back 9

  const hardestHoleFront9 = getHardestHoles(1, 9, 1); // Hardest 1 hole for front 9
  const hardestHoleBack9 = getHardestHoles(10, 18, 1); // Hardest 1 hole for back 9


  const getPayoutRows = (playerCount) => {
    const rows = [];
    [
      playerCount - 4,
      playerCount - 3,
      playerCount - 2,
      playerCount - 1,
      playerCount,
      playerCount + 1,
    ].forEach((count) => {
      const row = payoutData.find((data) => data.players === count);
      if (row) rows.push(row);
    });
    return rows;
  };

  const currentPlayerCount = players.length;
  const payoutRows = getPayoutRows(currentPlayerCount);

  return (
    <div className="p-6 bg-white mx-auto text-[20px]">
      {/* Header Section */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-bold mr-2"></span>
          <span>{eventDetails?.course_name || ""}</span>
        </div>
        <div>
          <span className="font-bold mr-2">Date:</span>
          <span>
            {eventDetails?.date ? new Date(eventDetails.date).toLocaleDateString() : ""}
          </span>
        </div>
      </div>

      {/* Scorecard Section */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr>
              <th className="border border-gray-300 p-1 text-center text-[7px] w-[25px]">Paid?</th>
              <th className="border border-gray-300 p-1 text-right w-[90px]">Hole</th>
              {holes.map((hole) => (
                <th key={hole} className="border border-gray-300 p-1 w-[50px] text-center">{hole}</th>
              ))}
              <th className="border border-gray-300 p-1 text-center w-[30px]">Score</th>
              <th className="border border-gray-300 p-1 text-center w-[30px]">Quota</th>
              <th className="border border-gray-300 p-1 text-center w-[50px]">+/-</th>
              <th className="border border-gray-300 p-1 text-center w-[30px]">Rank</th>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1"></td>
              <td className="border border-gray-300 p-1 text-right">Par</td>
              {holes.map((hole, idx) => {
                const par = scorecard.find((item) => item.hole === hole)?.par || "-";
                return (
                <td key={idx} className="border border-gray-300 p-1 text-center">{par}</td>
              );
            })}
              <td className="border border-gray-300 p-1"></td>
              <td className="border border-gray-300 p-1"></td>
              <td className="border border-gray-300 p-1"></td>
              <td className="border border-gray-300 p-1"></td>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const [firstName, lastName = ""] = player.name.split(" ");
              const abbreviatedName = `${firstName} ${lastName.charAt(0)}.`; // Format "First L."
              const highlightedHoles = getHighlightedHoles(player.quota);


              return (
                <tr key={index}>
                  <td className="border border-gray-300 p-1"></td>
                  <td className="border border-gray-300 p-1 text-left">{abbreviatedName}</td>
                  {holes.map((hole) => {
                    const isHighlighted = highlightedHoles.includes(hole);
                    return (
                      <td
                        key={hole}
                        className={`border border-gray-300 p-1 text-center ${
                          isHighlighted ? "bg-yellow-100" : ""
                        }`}
                      ></td>
                    );
                  })}
                  <td className="border border-gray-300 p-1 text-center"></td>
                  <td className="border border-gray-300 p-1 text-[14px] font-bold text-center">{player.quota}</td>
                  <td className="border border-gray-300 p-1 text-center"></td>
                  <td className="border border-gray-300 p-1 text-center"></td>
                </tr>
              );
            })}
            {Array.from({ length: emptyPlayerSlots }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td className="border border-gray-300 p-1 h-[30px]"></td>
                <td className="border border-gray-300 p-1 h-[30px]"></td>
                {holes.map((_, idx) => (
                  <td key={`empty-${index}-${idx}`} className="h-[30px] border border-gray-300 p-1 text-center"></td>
                ))}
                <td className="border border-gray-300 p-1 h-[30px]"></td>
                <td className="border border-gray-300 p-1 h-[30px]"></td>
                <td className="border border-gray-300 p-1 h-[30px]"></td>
                <td className="border border-gray-300 p-1 h-[30px]"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex space-x-6">
        {/* CTP Section */}
        <div>
          <label className="block font-bold mb-3">CTPs Pay $_____</label>
          <table className="table-fixed w-[220px] border-collapse border border-gray-300">
            <thead>
              <tr className="h-[30px]">
                <th className="border border-gray-300 pb-1 text-center w-[50px]">Hole</th>
                <th className="border border-gray-300 pb-1 w-[170px]">Wanker</th>
              </tr>
            </thead>
            <tbody>
              {par3Holes.map((hole) => (
                <tr key={hole} className="h-[30px]">
                  <td className="border border-gray-300 pb-1 text-center">{hole}</td>
                  <td className="border border-gray-300 pb-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Skins Section */}
        <div>
          <label className="block font-bold mb-3">Skins Pay $_____</label>
          <div className="flex space-x-3">
            <table className="table-fixed w-[200px] border-collapse border border-gray-300">
              <thead>
                <tr className="h-[30px]">
                  <th className="border border-gray-300 pb-1 w-[170px] text-center">Wanker</th>
                  <th className
                  ="border border-gray-300 pb-1 w-[30px] text-center">#</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: skinsRowsPerTable }).map((_, idx) => (
                    <tr key={`table1-${idx}`} className="h-[30px]">
                      <td className="border border-gray-300 p-0"></td>
                      <td className="border border-gray-300 p-0"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
  
              {/* <table className="table-fixed w-[200px] border-collapse border border-gray-300">
                <thead>
                  <tr className="h-[30px]">
                    <th className="border border-gray-300 p-0 w-[170px] text-center">Wanker</th>
                    <th className="border border-gray-300 p-0 w-[30px] text-center">#</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: skinsRowsPerTable }).map((_, idx) => (
                    <tr key={`table2-${idx}`} className="h-[30px]">
                      <td className="border border-gray-300 p-0"></td>
                      <td className="border border-gray-300 p-0"></td>
                    </tr>
                  ))}
                </tbody>
              </table> */}
            </div>
          </div>
  
          {/* Payout Table */}
          <div className="absolute right-10">
            <h3 className="font-bold mb-3 text-center">Payout Table</h3>
            <table className="table-fixed  w-[400px] border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="h-[30px]">
                  <th className="border border-gray-300 p-0 text-center">Players</th>
                  <th className="border border-gray-300 p-0 text-center">Places</th>
                  <th className="border border-gray-300 p-0 text-center">Payouts</th>
                  <th className="border border-gray-300 p-0 text-center">Pot Total</th>
                </tr>
              </thead>
              <tbody>
                {payoutRows.map((row, idx) => (
                  <tr key={idx} className="h-[30px]">
                    <td className="border border-gray-300 p-0 text-center">{row.players}</td>
                    <td className="border border-gray-300 p-0 text-center">{row.places}</td>
                    <td className="border border-gray-300 p-0 text-center">{row.payouts.join(", ")}</td>
                    <td className="border border-gray-300 p-0 text-center">{row.players * 24}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  export default ScorecardSheet;
  