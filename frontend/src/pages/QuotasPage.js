import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const QuotasPage = () => {
  return (
    <div>
      <Navbar />
      <PageHeader title="Current Quotas" />
      <div className="max-w-7xl mx-auto px-4">
        <p>Content for current quotas goes here...</p>
      </div>
    </div>
  );
};

export default QuotasPage;
