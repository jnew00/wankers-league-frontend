import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const AddEventPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [date, setDate] = useState("");
  const [isMajor, setIsMajor] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/courses`
        );
        // Map courses to the format required by React-Select
        const formattedCourses = response.data.map((course) => ({
          value: course.id,
          label: course.name,
        }));
        // Add the "Add New Course" option
        setCourses([
          ...formattedCourses,
          { value: "add-new", label: "Add New Course", isSpecial: true },
        ]);
      } catch (error) {
        console.error("Error fetching courses:", error.message);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = (selectedOption) => {
    if (selectedOption.value === "add-new") {
      navigate("/admin/add-course"); // Redirect to Add Course page
    } else {
      setSelectedCourse(selectedOption); // Set the selected course
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !date) {
      alert("Please select a course and date.");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/events/add-event`,
        {
          courseId: selectedCourse.value,
          date,
          isMajor,
        }
      );

      alert("Event added successfully!");
      navigate("/admin/manage-events");
    } catch (error) {
      console.error("Error adding event:", error.message);
      alert("Failed to add event.");
    }
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.data.isSpecial
        ? state.isFocused
          ? "#fde68a" // Highlighted yellow on hover
          : "#fef3c7" // Light yellow background for "Add New Course"
        : state.isFocused
        ? "#e5e7eb" // Default hover color for other options
        : "white",
      color: state.data.isSpecial ? "#b45309" : "black", // Amber text for "Add New Course"
      fontWeight: state.data.isSpecial ? "bold" : "normal",
      cursor: "pointer",
    }),
  };

  return (
    <div>
      <Navbar />
      <PageHeader title="Add Event" />
      <div className="max-w-2xl mx-auto px-4 py-8 bg-white shadow-md rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Course
            </label>
            <Select
              options={courses}
              value={selectedCourse}
              onChange={handleCourseChange}
              placeholder="Search or select a course"
              styles={customStyles}
            />
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
