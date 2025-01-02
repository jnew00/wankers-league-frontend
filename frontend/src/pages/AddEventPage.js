import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const AddEventPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [date, setDate] = useState("");
  const [teeTime, setTeeTime] = useState("");
  const [isMajor, setIsMajor] = useState(false);
  const [cost, setCost] = useState(0);
  const [fedupEligible, setFedupEligible] = useState(true);
  const [numTeetimes, setNumTeetimes] = useState(5);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoursesAndEvents = async () => {
      try {
        const coursesResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/admin/courses`
        );
        const formattedCourses = coursesResponse.data.map((course) => ({
          value: course.id,
          label: course.name,
        }));
        setCourses(formattedCourses);

        const eventsResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/admin/events`
        );
        const formattedEvents = eventsResponse.data.map((event) => ({
          value: event.id,
          label: `${new Date(event.date).toLocaleDateString()} - ${event.course_name}`,
        }));
        setEvents([
          { value: "add-new", label: "-- Add New Event --", isSpecial: true },
          ...formattedEvents,
        ]);
      } catch (error) {
        console.error("Error fetching courses and events:", error.message);
      }
    };

    fetchCoursesAndEvents();
  }, []);

  const formatDateForInput = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (dbTime) => {
    if (!dbTime) return ""; // Return empty string if time is null or undefined
    const [hours, minutes] = dbTime.split(":"); // Split time by ":"
    return `${hours}:${minutes}`; // Return only hours and minutes
  };
  
  
  

  const handleEventChange = (selectedOption) => {
    if (selectedOption.value === "add-new") {
      // Reset form for adding a new event
      setSelectedEvent(null);
      setSelectedCourse(null);
      setDate("");
      setTeeTime("");
      setIsMajor(false);
    } else {
      // Populate form with existing event details
      const selected = events.find((event) => event.value === selectedOption.value);
      setSelectedEvent(selected);
      fetchEventDetails(selected.value);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admin/events/${eventId}`
      );
      const event = response.data.details;

      setSelectedCourse({
        value: event.course_id,
        label: event.course_name,
      });
      setDate(formatDateForInput(event.date));
      setTeeTime(formatTimeForInput(event.tee_time));
      setIsMajor(event.is_major);
      setCost(event.cost);
      setFedupEligible(event.fedup_eligible);
      setNumTeetimes(event.num_teetimes);
    } catch (error) {
      console.error("Error fetching event details:", error.message);
    }
  };

  const handleCourseChange = (selectedOption) => {
    setSelectedCourse(selectedOption);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !date) {
      alert("Please select a course and date.");
      return;
    }

    try {
      if (selectedEvent) {
        // Update existing event
        console.log("selectedEvent.value", selectedEvent.value);
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/admin/events/${selectedEvent.value}`,
          {
            courseId: selectedCourse.value,
            date,
            teeTime,
            isMajor,
            cost,
            fedupEligible,
            numTeetimes,
          }
        );
        alert("Event updated successfully!");
      } else {
        // Add new event
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/admin/events/events`,
          {
            courseId: selectedCourse.value,
            date,
            teeTime,
            isMajor,
            cost,
            fedupEligible,
            numTeetimes,

          }
        );
        alert("Event added successfully!");
      }
      navigate("/admin/manage-events");
    } catch (error) {
      console.error("Error saving event:", error.message);
      alert("Failed to save event.");
    }
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.data.isSpecial
        ? state.isFocused
          ? "#fde68a"
          : "#fef3c7"
        : state.isFocused
        ? "#e5e7eb"
        : "white",
      color: state.data.isSpecial ? "#b45309" : "black",
      fontWeight: state.data.isSpecial ? "bold" : "normal",
      cursor: "pointer",
    }),
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Admin: Manage Events" />
      <div className="max-w-2xl mx-auto px-4 py-8 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-bold mb-4">
            {selectedEvent ? "Edit Event" : "Add New Event"}
          </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Select to Edit Existing Event or Add New Event</label>
            <Select
              options={events}
              value={selectedEvent}
              onChange={handleEventChange}
              placeholder="-- Add New Event --"
              styles={customStyles}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Course</label>
            <Select
              
              options={courses}
              value={selectedCourse}
              onChange={handleCourseChange}
              placeholder="Search or select a course"
              styles={customStyles}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Date or Event</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Tee Time</label>
            <input
              type="time"
              value={teeTime}
              onChange={(e) => setTeeTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div className="mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isMajor}
                onChange={(e) => setIsMajor(e.target.checked)}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2 text-gray-700">Major Event</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={fedupEligible}
                onChange={(e) => setFedupEligible(e.target.checked)}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2 text-gray-700">FedUp Eligible (It is a regular Sunday Event)</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Cost</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2"
              step="0.01"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Number of Tee Times</label>
            <input
              type="number"
              value={numTeetimes}
              onChange={(e) => setNumTeetimes(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2"
              min="1"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {selectedEvent ? "Update Event" : "Add Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventPage;
