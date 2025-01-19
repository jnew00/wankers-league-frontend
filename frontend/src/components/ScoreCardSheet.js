import React from "react";

const ScorecardSheet = ({ eventDetails, players, scorecard }) => {
  const holes = Array.from({ length: 18 }, (_, i) => i + 1);
  const par3Holes = scorecard
  .filter((hole) => Number(hole.par) === 3)
  .map((hole) => hole.hole);

  const emptyPlayerSlots = 2;

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


  return (
<div>
    {/* <div className="w-[1056px]  h-[816px] mx-auto bg-white border border-black"> */}
    {/* <div class="flex flex-col h-full"></div> */}
     <div className="p-6 bg-white mx-auto">
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
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr>
              <th className="border border-black p-1 text-center text-[7px] w-[20px]">Paid?</th>
              <th className="border border-black text-right w-[120px]">Hole</th>
              {holes.map((hole) => (
                <th key={hole} className="border border-black p-2 w-[50px] text-center">{hole}</th>
              ))}
              <th className="border border-black p-2 text-center w-[30px]">Score</th>
              <th className="border border-black p-2 text-center w-[30px]">Quota</th>
              <th className="border border-black p-2 text-center w-[50px]">+/-</th>
              <th className="border border-black p-2 text-center w-[30px]">Rank</th>
            </tr>
            <tr>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2 text-right">Par</td>
              {holes.map((hole, idx) => {
                const par = scorecard.find((item) => item.hole === hole)?.par || "-";
                return (
                <td key={idx} className="border border-black p-2 text-center">{par}</td>
              );
            })}
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const [firstName, lastName = ""] = player.name.split(" ");
              const abbreviatedName = `${firstName} ${lastName.charAt(0)}.`; // Format "First L."
              const highlightedHoles = getHighlightedHoles(player.quota);


              return (
                <tr key={index}>
                  <td className="border border-black p-2 h-[50px]"></td>
                  <td className="border border-black p-2 text-left text-xl font-bold">{abbreviatedName}</td>
                  {holes.map((hole) => {
                    const isHighlighted = highlightedHoles.includes(hole);
                    return (
                      <td
                      key={hole}
                      className="border border-black p-2 text-center"
                      style={{
                        backgroundColor: isHighlighted ? "yellow" : "transparent", // Simple, reliable
                        color: isHighlighted ? "black" : "inherit", // Ensure contrast
                      }}
                    >
            
                    </td>
                    );
                  })}
                  <td className="border border-black p-1 text-center"></td>
                  <td className="border border-black p-1 text-lg font-bold text-center">{player.quota}</td>
                  <td className="border border-black p-1 text-center"></td>
                  <td className="border border-black p-1 text-center"></td>
                </tr>
              );
            })}
            {Array.from({ length: emptyPlayerSlots }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td className="border border-black p-1 h-[40px]"></td>
                <td className="border border-black p-1 h-[40px]"></td>
                {holes.map((_, idx) => (
                  <td key={`empty-${index}-${idx}`} className="h-[40px] border border-black p-1 text-center"></td>
                ))}
                <td className="border border-black p-1 h-[40px]"></td>
                <td className="border border-black p-1 h-[40px]"></td>
                <td className="border border-black p-1 h-[40px]"></td>
                <td className="border border-black p-1 h-[40px]"></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

      <div className="mt-6 flex space-x-6 text-xs">
        {/* CTP Section */}
        <div>
        <div className="flex space-x-4">
  {/* First Table */}
  <table className="table-fixed w-[250px] border-collapse border border-black">
    <thead>
      <tr className="h-[50px]">
        <th className="border border-black pb-2 text-center w-[50px]">Hole</th>
        <th className="border border-black pb-2 text-center w-[200px]">Wanker</th>
      </tr>
    </thead>
    <tbody>
      {par3Holes.slice(0, Math.ceil(par3Holes.length / 2)).map((hole, idx) => (
        <tr key={`ctp-1-${idx}`} className="h-[50px]">
          <td className="border border-black pb-2 text-center">{hole}</td>
          <td className="border border-black pb-2"></td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Second Table */}
  <table className="table-fixed w-[250px] border-collapse border border-black">
    <thead>
      <tr className="h-[50px]">
        <th className="border border-black pb-2 text-center w-[50px]">Hole</th>
        <th className="border border-black pb-2 text-center w-[200px]">Wanker</th>
      </tr>
    </thead>
    <tbody>
      {par3Holes.slice(Math.ceil(par3Holes.length / 2)).map((hole, idx) => (
        <tr key={`ctp-2-${idx}`} className="h-[50px]">
          <td className="border border-black pb-2 text-center">{hole}</td>
          <td className="border border-black pb-2"></td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


        </div>

        {/* Skins Section */}
        {/* <div className="text-xs">
          <label className="block font-bold mb-3">Skins Pay $_____</label>
          <div className="flex space-x-3">
            <table className="table-fixed w-[200px] border-collapse border border-black">
              <thead>
                <tr className="h-[30px]">
                  <th className="border border-black pb-1 w-[170px] text-center">Wanker</th>
                  <th className
                  ="border border-black pb-1 w-[30px] text-center">#</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: skinsRowsPerTable }).map((_, idx) => (
                    <tr key={`table1-${idx}`} className="h-[30px]">
                      <td className="border border-black p-0"></td>
                      <td className="border border-black p-0"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>*/}
        </div> 
     </div>


</div>   
    );
  };
  
  export default ScorecardSheet;
  