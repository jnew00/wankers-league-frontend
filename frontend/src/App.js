import React from "react";
import { Routes, Route } from "react-router-dom";
import LeaderboardPage from "./pages/LeaderboardPage";
import UpcomingPage from "./pages/UpcomingPage";
import QuotasPage from "./pages/QuotasPage";
import PastEventsPage from "./pages/PastEventsPage";
import AdminPage from "./pages/AdminPage";
import AddEventPage from "./pages/AddEventPage";
import UpcomingEventsPage from "./pages/UpcomingEventsPage";
import AddCourse from "./pages/AddCoursePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LeaderboardPage />} />
      <Route path="/upcoming" element={<UpcomingPage />} />
      <Route path="/quotas" element={<QuotasPage />} />
      <Route path="/past-events" element={<PastEventsPage />} />
      <Route path="/admin/manage-events" element={<AdminPage />} />
      <Route path="/admin/add-event" element={<AddEventPage />} />
      <Route path="/admin/add-course" element={<AddCourse />} />
      <Route path="/upcoming-events" element={<UpcomingEventsPage />} />
    </Routes>
  );
}

export default App;
