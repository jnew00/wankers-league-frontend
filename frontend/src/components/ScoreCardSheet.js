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
     <div className="p-6 bg-white mx-auto">
      {/* Header Section */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-bold mr-2"></span>
          <span className="font-bold text-3xl">{eventDetails?.course_name || ""}</span>
          </div>
        <div>
          <span className="font-bold text-3xl mr-2">Date:</span>
          <span className="font-bold text-3xl mr-2">
            {eventDetails?.date ? new Date(eventDetails.date).toLocaleDateString() : ""}
          </span>
          </div>
        </div>

      {/* Scorecard Section */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-xs [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
          <thead>
            <tr>
              <th className="border border-black p-1 text-center text-[7px] w-[20px]">Paid?</th>
              <th className="border border-black font-bold text-right w-[120px]">Hole</th>
              {holes.map((hole) => (
                      <th key={hole} className={`border border-black p-2 w-[50px] text-center
                        ${hole === 9 ? "border-r-4 border-double border-black" : ""}`}>
                          {hole}
                    </th>              
              ))}
              <th className="border border-black p-2 text-center w-[30px]">Score</th>
              <th className="border border-black p-2 text-center w-[30px]">Quota</th>
              <th className="border border-black p-2 text-center w-[50px]">+/-</th>
              <th className="border border-black p-2 text-center w-[30px]">Place</th>
            </tr>
            <tr>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2 text-right">Par</td>
              {holes.map((hole, idx) => {
                const par = scorecard.find((item) => item.hole === hole)?.par || "-";
                return (
                  <td
                  key={idx}
                  className={`border border-black p-2 text-center font-bold
                    ${hole === 9 ? "border-r-4 border-double border-black" : ""}
                  `}
                >
                  {par}
                </td>              );
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
                  <td className="w-[120px] h-[50px] p-1 border border-black text-left font-bold text-[clamp(10px,5vw,40px)]">
                         {abbreviatedName}
                </td>

                {holes.map((hole) => {
                    const isHighlighted = highlightedHoles.includes(hole);
                    return (
                      <td
                        key={hole}
                        className={`
                          border border-black p-2 text-center
                          ${isHighlighted ? "[print-color-adjust:exact] [-webkit-print-color-adjust:exact] bg-yellow-200 print:!bg-yellow-200" : ""}
                          ${hole === 9 ? "border-r-4 border-double border-black" : ""}
                        `}
                      >
                        {/* Cell Content Here */}
                      </td>
                    );
                  })}
                  <td className="border border-black p-1 text-center"></td>
                  <td className="border border-black p-1 text-2xl font-bold text-center">{player.quota}</td>
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
                  <td key={`empty-${index}-${idx}`} className={`h-[40px] border border-black p-1 text-center
                  ${idx+1 === 9 ? "border-r-4 border-double border-black" : ""}`}></td>
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




  {/* CTPs info positioned at the bottom */}
  <div className="ctp-info absolute bottom-5 left-5 right-0 p-4 bg-white">
    <div className="flex items-center">
    <span className="font-bold mr-4 text-center">CTPs:</span>
    {par3Holes.map((hole, idx) => (
      <table
        key={idx}
        className="table-fixed w-[400px] border-collapse border border-black mr-4 inline-block"
      >
        <tbody>
          <tr className="h-[60px]">
            <td className="border border-black pb-2 font-bold text-center w-[50px]">
              {hole}
            </td>
            <td className="border border-black pb-2 w-[400px]"></td>
          </tr>
        </tbody>
      </table>
    ))}
    </div>
  </div>




     </div>


</div>   
    );
  };
  
  export default ScorecardSheet;
  