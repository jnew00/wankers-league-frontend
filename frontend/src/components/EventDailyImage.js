import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { toPng } from "html-to-image";
import { formatTime } from "../utils/formatTime";
import EventWeather from "./EventWeather";

const EventDailyImage = forwardRef(({ event, eventPlayers, upcomingEvents }, ref) => {
  const detailsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    generateImage: () => {
      if (detailsRef.current) {
        return toPng(detailsRef.current, {
          quality: 1.0,
          pixelRatio: 2,
        });
      } else {
        console.error("detailsRef is not set.");
        return Promise.reject("detailsRef is not set.");
      }
    },
  }));

  return (
    <div ref={detailsRef} className="p-6 bg-white rounded-lg shadow-lg">
      {/* Two Column Layout with Perfect Alignment */}
      <div className="grid grid-cols-2 gap-8 place-items-start items-start">
        {/* Left Column */}
        <div className="space-y-8">
          {/* General Info */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold mb-4">{event.course_name}</h2>
            <p className="text-black">
              <span className="font-semibold">Date:</span>{" "}
              {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-black">
              <span className="font-semibold">1<sup>st</sup> Tee Time:</span>{" "}
              {formatTime(event.tee_time)}
            </p>
            <p className="text-black">
              <span className="font-semibold">Address:</span>{" "}
              {event.course_address || "N/A"}
            </p>
            <p className="text-black">
              <span className="font-semibold">Cost:</span>{" $"}
              {event.cost}
            </p>
          </div>

          {/* Wankers Signed Up */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              Wankers Signed Up ({event.numTimes * 4} spots available):
            </h3>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1 text-left">#</th>
                    <th className="border p-1 text-left">Name</th>
                    <th className="border p-1 text-center">Quota</th>
                    <th className="border p-1 text-center">FedUp Place</th>
                  </tr>
                </thead>
                <tbody>
                  {eventPlayers.length > 0 ? (
                    eventPlayers.map((player, index) => (
                      <tr key={player.player_id}>
                        <td className="border p-1">{index + 1}</td>
                        <td className="border p-1">{player.name}</td>
                        <td className="border p-1 text-center">{player.quota}</td>
                        <td className="border p-1 text-center">
                          {player.season_paid ? player.fedup_rank : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="border p-2 text-center text-gray-500">
                        No players signed up
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Weather Section (No Heading) */}
          <div>
            <EventWeather
              latitude={event.latitude}
              longitude={event.longitude}
              teeTime={event.teeTime}
              date={event.date}
            />
          </div>

          {/* Upcoming Events - Perfectly Aligned with Wankers Table */}
          <div className="mt-4 pt-7">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Upcoming Events:</h3>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1 text-left">Date</th>
                    <th className="border p-1 text-left">Course</th>
                    <th className="border p-1 text-center">Tee Time</th>
                    <th className="border p-1 text-center">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingEvents
                    .filter(
                      (upcoming) =>
                        new Date(upcoming.date) > new Date(event.date) // Only future events
                    )
                    .sort(
                      (a, b) => new Date(a.date) - new Date(b.date) // Sort by date ascending
                    )
                    .map((upcoming, idx) => (
                      <tr key={idx}>
                        <td className="border p-1 text-left">
                          {new Date(upcoming.date).toLocaleDateString()}
                        </td>
                        <td className="border p-1">{upcoming.course_name}</td>
                        <td className="border p-1 text-left">
                          {formatTime(upcoming.tee_time)}
                        </td>
                        <td className="border p-1 text-center">
                          ${upcoming.cost}
                        </td>
                      </tr>
                    ))}
                  {/* Show message if no upcoming events */}
                  {upcomingEvents.filter(
                    (upcoming) => new Date(upcoming.date) > new Date(event.date)
                  ).length === 0 && (
                    <tr>
                      <td colSpan="4" className="border p-2 text-center text-gray-500">
                        No upcoming events available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EventDailyImage;