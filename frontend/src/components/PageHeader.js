import React from "react";

const PageHeader = ({ title }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-2">{title}</h1>
      <p className="text-lg text-gray-500">{`Updated on ${currentDate}`}</p>
    </div>
  );
};

export default PageHeader;
