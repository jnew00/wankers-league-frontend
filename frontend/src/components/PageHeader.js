import React from "react";
import logo from "../assets/logo.png"; // Ensure this path matches your project structure

const PageHeader = ({ title }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-start px-4  max-w-7xl">
      <div className="flex items-center justify-start space-x-4">
        <img
          src={logo}
          alt="Leaderboard Logo"
          style={{ width: "150px", height: "150px", marginRight: "0px" }}
        />
        <div className="text-left">
          <h1 className="text-4xl font-semibold text-gray-800">{title}</h1>
          <p className="text-lg text-gray-500">{`Updated on ${currentDate}`}</p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
