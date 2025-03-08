import React from "react";
import { Routes, Route } from "react-router-dom";
import LeaderboardPage from "./pages/LeaderboardPage";
import QuotasPage from "./pages/QuotasPage";
import EventsPage from "./pages/EventsPage";
import AdminPage from "./pages/AdminPage";
import AddEventPage from "./pages/AddEventPage";
import AddPlayerPage from "./pages/AddPlayerPage";
import AddCourse from "./pages/AddCoursePage";
import Rules from "./pages/RulesPage";
import Polls from "./pages/PollPage";
import PrintScorecardPage from "./pages/PrintScorecardPage";
import './App.css';
import './css/print.css';




function App() {
  return (
    <Routes>
      <Route path="/" element={<LeaderboardPage />} />
      <Route path="/quotas" element={<QuotasPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/admin/record-results" element={<AdminPage />} />
      <Route path="/admin/manage-event" element={<AddEventPage />} />
      <Route path="/admin/manage-course" element={<AddCourse />} />
      <Route path="/admin/manage-players" element={<AddPlayerPage />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/printScorecard" element={<PrintScorecardPage />} />
      <Route path="/polls" element={<Polls />} />
    </Routes>
  );
}

export default App;
