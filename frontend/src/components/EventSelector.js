import React from "react";

const EventSelector = ({ events = [], selectedEvent, handleEventChange }) => {
  return (
    <div className="mb-4">
      <label
        htmlFor="event"
        className="block text-lg font-medium text-gray-700 mb-2"
      >
        Select Event
      </label>
      <select
        id="event"
        className="w-full border border-gray-300 rounded-lg p-2"
        value={selectedEvent?.id || ""}
        onChange={(e) => {
          const eventId = Number(e.target.value);
          handleEventChange(eventId);
        }}
      >
        <option value="">-- Select Event --</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {new Date(event.date).toLocaleDateString()} - {event.course_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(EventSelector);
