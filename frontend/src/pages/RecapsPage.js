import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";
import { FaRegNewspaper } from "react-icons/fa";
import recapsData from "../utils/recapsData";

const recaps = [...recapsData].sort((a, b) => (a.id < b.id ? 1 : -1));

const RecapsPage = () => (
  <div className="bg-gray-50 min-h-screen">
    <Navbar />
    <PageHeader title="Event Recaps" />
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <FaRegNewspaper className="text-blue-500" /> Past Recaps
      </h2>
      <div className="grid gap-6">
        {recaps.map((recap) => (
          <a
            key={recap.id}
            href={`/recaps/${recap.id}`}
            className="block bg-white shadow-md rounded-lg p-5 hover:shadow-xl transition duration-200 border border-gray-200 hover:border-blue-400"
          >
            <div className="flex items-center gap-3">
              <FaRegNewspaper className="text-blue-400 text-xl" />
              <span className="text-lg font-semibold text-gray-800">
                {recap.title}
              </span>
            </div>
            <span className="text-sm text-gray-500 mt-2 block">View Recap</span>
          </a>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default RecapsPage;
