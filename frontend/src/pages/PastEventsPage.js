import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const PastEventsPage = () => {
  return (
    <div>
      <Navbar />
      <PageHeader title="Past Events" />
      <div className="max-w-7xl mx-auto px-4">
        <p>Content for past events goes here...</p>
      </div>
    </div>
  );
};

export default PastEventsPage;
