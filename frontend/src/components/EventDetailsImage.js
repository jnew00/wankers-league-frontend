import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { toPng } from "html-to-image";
import { formatTime } from "../utils/formatTime";



const EventDetailsImage = forwardRef(({ event, pairings, eventPlayers }, ref) => {
  const detailsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    generateImage: () => {
      if (detailsRef.current) {
        return toPng(detailsRef.current);
      } else {
        console.error("detailsRef is not set.");
        return Promise.reject("detailsRef is not set.");
      }
    },
  }));

  const getPlayerWithQuota = (playerId) => {
    const player = eventPlayers.find((p) => p.player_id === playerId);
    const [firstName, lastName = ""] = player.name.split(" ");
    const abbreviatedName = `${firstName} ${lastName.charAt(0)}.`; // Format "First L."

    if (!player) return "";

    let indicator = null;
    let formattedPlayerName = (
        <span className="text-left">
          {player.name}
        </span>);
    let formattedQuota = (
        <span className="font-bold ml-5 text-right">
            {player.quota}
        </span>);

    if (player.quota >= 31) {
        formattedQuota = (
            <span className="text-red-500 ml-2 font-bold text-right" title="One Tee Back">
              {player.quota}
            </span>
          )
        indicator = (
        <span className="text-red-500 ml-2  font-bold text-right" title="Two Tees Back">
          ⬅️⬅️
        </span>
      );
    } else if (player.quota >= 26) {
        formattedQuota = (
        <span className="text-red-500 font-bold text-right" title="One Tee Back">
          {player.quota}
        </span>
      )
      indicator = (
        <span className="text-orange-500 font-bold text-right" title="Tee Back">
          ⬅️
        </span>
      );
    }

    return (
        <div className="flex justify-between items-center">
        {formattedPlayerName} {indicator} {formattedQuota} 
      </div>
    );
  };

  return (
    <div ref={detailsRef} className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{event.course_name || "N/A"}</h2>
      <p className="text-gray-700">
        <span className="font-semibold">Date:</span>{" "}
        {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">1<sup>st</sup> Tee Time:</span>{" "}
        {formatTime(event.tee_time)}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Address:</span> {event.course_address || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Tees:</span>{" "}
        {event.front_tee || "N/A"} / {event.back_tee || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Total Yardage:</span>{" "}
        {event.total_yardage || "N/A"} yards
      </p>

      {pairings?.length > 0 && (
        <>
          <h3 className="text-lg font-bold mt-4 mb-2">Pairings</h3>
          <table className="table-auto w-full border-collapse bg-white shadow rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {pairings.map((_, index) => (
                  <th key={index} className="border p-2 text-center">
                    Group {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(...pairings.map((g) => g.length)) }).map(
                (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {pairings.map((group, colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`} className="border p-2 text-center">
                        {group[rowIndex]
                          ? getPlayerWithQuota(group[rowIndex].player_id)
                          : ""}
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
});

export default EventDetailsImage;
