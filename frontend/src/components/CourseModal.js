import React from "react";

const CourseModal = ({ course, onClose }) => {
  if (!course) return null;

  const renderScorecardTable = (scorecard) => {
    const totals = scorecard.reduce(
      (acc, hole) => {
        acc.par += Number(hole.par) || 0;
        acc.yardage += Number(hole.yardage) || 0;
        return acc;
      },
      { par: 0, yardage: 0 }
    );

    return (
      <table className="w-full text-sm border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Hole</th>
            {scorecard.map((hole) => (
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
            {scorecard.map((hole) => (
              <td key={hole.hole} className="border p-2">
                {hole.yardage || "-"}
              </td>
            ))}
            <td className="border p-2">{totals.yardage}</td>
          </tr>
          <tr>
          <td className="border p-2">Handicap</td>
          {scorecard.map((hole) => (
            <td key={hole.hole} className="border p-2">
              {hole.handicap || "-"}
            </td>
          ))}
          <td className="border p-2">-</td>
        </tr>
          <tr>
            <td className="border p-2">Par</td>
            {scorecard.map((hole) => (
              <td key={hole.hole} className="border p-2">
                {hole.par || "-"}
              </td>
            ))}
            <td className="border p-2">{totals.par}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
        >
          &times;
        </button>
        <img
          src={course.image_path}
          alt={course.name}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <h2 className="text-2xl font-semibold mb-2">{course.name}</h2>
        <p className="mb-2">
          <strong>Address:</strong>{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              course.address
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {course.address}
          </a>
        </p>
        <p className="mb-2">
          <strong>Website:</strong>{" "}
          <a
            href={course.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {course.website}
          </a>
        </p>
        <h3 className="text-lg font-semibold mt-4 mb-2">Scorecard</h3>
        {renderScorecardTable(course.scorecard || [])}
      </div>
    </div>
  );
};

export default CourseModal;
