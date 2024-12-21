import React, { useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import axios from "axios";

const AddEventPage = () => {
  const [courseId, setCourseId] = useState(null);
  const [date, setDate] = useState("");
  const [courseSuggestions, setCourseSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleCourseSearch = async (query) => {
    if (!query) {
      setCourseSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/courses/search`,
        { params: { query } }
      );
      setCourseSuggestions(response.data);
    } catch (error) {
      console.error("Error searching courses:", error.message);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleCourseSelect = (course) => {
    setCourseId(course.id);
    setCourseSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/add-event`,
        {
          courseId,
          date,
        }
      );
      alert("Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error.message);
      alert("Failed to add event.");
    }
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Add Event" />
      <div className="max-w-2xl mx-auto px-4 py-8 bg-white shadow-md rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Search for Course
            </label>
            <input
              type="text"
              onChange={(e) => handleCourseSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            {courseSuggestions.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                {courseSuggestions.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseSelect(course)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {course.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventPage;
