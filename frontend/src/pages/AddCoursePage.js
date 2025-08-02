import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import CourseModal from "../components/CourseModal";
import Footer from "../components/Footer";
import {fetchCoordinates} from "../utils/geoCoordinates";



const AddCoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [address, setAddress] = useState("");
  const [frontTee, setFrontTee] = useState("");
  const [backTee, setBackTee] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [scorecard, setScorecard] = useState(
    Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      par: 4,
      handicap: "",
      yardage: "",
    }))
  );
  const [editCourse, setEditCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/admin/courses`
        );
        setCourses(response.data);
      } catch (error) {
        // Silently handle course fetch error
      }
    };

    fetchCourses();
  }, []);

  const handleScorecardChange = (index, field, value) => {
    setScorecard((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "handicap" ? String(value) : value,
      };
      return updated;
    });
  };

  const handleAddOrUpdateCourse = async () => {
    if (!courseName) {
      alert("Please provide the course name!");
      return;
    }

    try {
      const coordinates = await fetchCoordinates(address);

      const payload = {
        name: courseName,
        address,
        frontTee,
        backTee,
        website,
        imagePath,
        notes,
        scorecard,
        longitude:  coordinates.lon,
        latitude: coordinates.lat,
      };


     


      if (editCourse) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/admin/courses/${editCourse.id}`,
          payload,
            {
              withCredentials: true, // Correct placement
            }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/admin/courses/add-course`,
          payload,
          {
            withCredentials: true,
          }
        );
      }

      window.location.reload();


      
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: "Failed to save course. Please try again or contact Jason!",
      });
    }
  };

  const handleEditCourse = (course) => {
    setEditCourse(course);
    setCourseName(course.name);
    setAddress(course.address);
    setFrontTee(course.front_tee);
    setBackTee(course.back_tee);
    setWebsite(course.website);
    setNotes(course.notes);
    setImagePath(course.image_path);
    setScorecard(
      course.scorecard ||
        Array.from({ length: 18 }, (_, i) => ({
          hole: i + 1,
          par: 4,
          handicap: "",
          yardage: "",
        }))
    );
    setShowForm(true);
  };

  const handleDeleteCourse = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/admin/courses/${id}`,
        {
          withCredentials: true, // Correct placement
        }
      );
      setCourses((prev) => prev.filter((course) => course.id !== id));
      setFeedbackMessage({
        type: "success",
        text: `Course deleted successfully!`,
      });
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: "Failed to delete course. Please try again.",
      });
    }
  };

  const handleResetForm = () => {
    setEditCourse(null);
    setCourseName("");
    setAddress("");
    setFrontTee("");
    setBackTee("");
    setWebsite("");
    setNotes("");
    setImagePath("");
    setScorecard(
      Array.from({ length: 18 }, (_, i) => ({
        hole: i + 1,
        par: 4,
        handicap: "",
        yardage: "",
      }))
    );
    setShowForm(false);
  };

  const handleAddCourseClick = () => {
    handleResetForm();
    setShowForm(true);
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setShowModal(false);
  };

  const renderScorecardTable = (
    scorecardData,
    layout = "horizontal",
    isEditable = false
  ) => {
    const usedHandicaps = scorecard.map((hole) => Number(hole.handicap));

    const totals = scorecardData.reduce(
      (acc, hole) => {
        acc.par += Number(hole.par) || 0;
        acc.yardage += Number(hole.yardage) || 0;
        return acc;
      },
      { par: 0, yardage: 0 }
    );

    if (layout === "horizontal") {
      return (
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Hole</th>
              {scorecardData.map((hole) => (
                <th key={hole.hole} className="border p-2">
                  {hole.hole}
                </th>
              ))}
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Yardage</td>
              {scorecardData.map((hole) => (
                <td key={hole.hole} className="border p-2">
                  {hole.yardage || "-"}
                </td>
              ))}
              <td className="border p-2">{totals.yardage}</td>
            </tr>
            <tr>
              <td className="border p-2">Handicap</td>
              {scorecardData.map((hole) => (
                <td key={hole.hole} className="border p-2">
                  {hole.handicap || "-"}
                </td>
              ))}
              <td className="border p-2">-</td>
            </tr>
            <tr>
              <td className="border p-2">Par</td>
              {scorecardData.map((hole) => (
                <td key={hole.hole} className="border p-2">
                  {hole.par || "-"}
                </td>
              ))}
              <td className="border p-2">{totals.par}</td>
            </tr>
          </tbody>
        </table>
      );
    } else {
      // Vertical layout
      return (
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Hole</th>
              <th className="border p-2">Yardage</th>
              <th className="border p-2">Handicap</th>
              <th className="border p-2">Par</th>
            </tr>
          </thead>
          <tbody>
            {scorecardData.map((hole, index) => (
              <tr key={hole.hole}>
                <td className="border p-2">{hole.hole}</td>
                <td className="border p-2">
                  {isEditable ? (
                    <input
                      type="number"
                      value={hole.yardage}
                      onChange={(e) =>
                        handleScorecardChange(index, "yardage", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded"
                    />
                  ) : (
                    hole.yardage || "-"
                  )}
                </td>
                <td className="border p-2">
                  {isEditable ? (
                    <select
                      value={hole.handicap || ""}
                      onChange={(e) =>
                        handleScorecardChange(index, "handicap", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded"
                    >
                      <option value="">--</option>
                      {[...Array(18).keys()]
                        .map((n) => n + 1)
                        .filter(
                          (n) =>
                            !usedHandicaps.includes(n) ||
                            n === Number(hole.handicap)
                        )
                        .map((handicap) => (
                          <option key={handicap} value={handicap}>
                            {handicap}
                          </option>
                        ))}
                    </select>
                  ) : (
                    hole.handicap || "-"
                  )}
                </td>
                <td className="border p-2">
                  {isEditable ? (
                    <select
                      value={hole.par || ""}
                      onChange={(e) =>
                        handleScorecardChange(index, "par", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded"
                    >
                      {[3, 4, 5].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  ) : (
                    hole.par || "-"
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="border p-2">Total</td>
              <td className="border p-2">{totals.yardage}</td>
              <td className="border p-2">-</td>
              <td className="border p-2">{totals.par}</td>
            </tr>
          </tbody>
        </table>
      );
    }
  };

  const renderForm = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddOrUpdateCourse();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Course Name
        </label>
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Front 9 Tees Playing
        </label>
        <input
          type="text"
          value={frontTee}
          placeholder="White"
          onChange={(e) => setFrontTee(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Back 9 Tees Playing</label>
        <input
          type="text"
          value={backTee}
          placeholder="White"
          onChange={(e) => setBackTee(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Website</label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Image Path
        </label>
        <input
          type="text"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>

      <h3 className="text-lg font-semibold mb-4">Scorecard</h3>
      {renderScorecardTable(scorecard, "vertical", true)}

      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {editCourse ? "Update Course" : "Add Course"}
        </button>
        <button
          type="button"
          onClick={handleResetForm}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <Navbar />
      <PageHeader title="Admin: Manage Courses" />
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white shadow-md rounded-lg border border-gray-300">
      {feedbackMessage && (
            <div
              className={`p-4 mb-4 rounded-lg ${
                feedbackMessage.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {feedbackMessage.text}
            </div>
          )}
        {!showForm ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Course List</h2>
            <ul className="mb-8">
              {courses.map((course) => (
                <li key={course.id} className="mb-4 border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span
                      className="cursor-pointer text-blue-600 hover:underline"
                      onClick={() => handleViewCourse(course)}
                    >
                      {course.name}
                    </span>
                    <div>
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={handleAddCourseClick}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Course
            </button>
          </>
        ) : (
          renderForm()
        )}
      </div>
    {showModal && selectedCourse && (
        <CourseModal course={selectedCourse} onClose={closeModal} />
      )}
        <Footer />
    </div>
  );
};
export default AddCoursePage;
