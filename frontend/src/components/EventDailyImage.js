import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { toPng } from "html-to-image";
import { formatTime } from "../utils/formatTime";
import EventWeather from "./EventWeather";




const EventDailyImage = forwardRef(({ event, eventPlayers, coordinates }, ref) => {
  const detailsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    generateImage: () => {
      if (detailsRef.current) {
        return toPng(detailsRef.current, {
          quality: 1.0, // Maximum image quality
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
      <div className="flex flex-wrap lg:flex-nowrap justify-between items-start gap-4">
      <div className="flex-1 space-y-2">

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
        <span className="font-semibold">Address:</span> {event.course_address || "N/A"}
      </p>
      <p className="text-black">
        <span className="font-semibold">Cost:</span>{" $"}
        {event.cost}
      </p>

      </div>
     
          <div className="w-100">
            <EventWeather
              latitude={event.latitude}
              longitude={event.longitude}
              teeTime={event.teeTime}
              date={event.date}
            />
          </div>
      
      </div>

 
        

    <div className="flex-1">
    <h3 className="text-lg font-bold text-gray-700 mb-2 mt-10">Wankers Signed Up ({event.numTimes * 4} spots available):</h3>
    <table className="table-auto border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-1 text-left"></th>
          <th className="border p-1 text-left">Name</th>
          <th className="border p-1 text-center">Quota</th>
          <th className="border p-1 text-center">FedUp Place</th>
        
        </tr>
      </thead>
      <tbody>
        {eventPlayers.map((player, index) => (
          <tr key={player.player_id}>
            <td className="border p-1">{index + 1}</td>
            <td className="border p-1">{player.name}</td>
            <td className="border p-1 text-center">{player.quota}</td>
            <td className="border p-1 text-center">{player.fedup_rank}</td>
      
          </tr>
        ))}
      </tbody>
    </table>
  </div>

    </div>
  );
});

export default EventDailyImage;
