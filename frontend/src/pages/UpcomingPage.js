import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const UpcomingPage = () => {
  return (
    <div>
      <Navbar />
      <PageHeader title="Upcoming Events" />
      <div className="max-w-7xl mx-auto px-4">
        <p>Content for upcoming events goes here...</p>
      </div>
    </div>
  );
};

export default UpcomingPage;
