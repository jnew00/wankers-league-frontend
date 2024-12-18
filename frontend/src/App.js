import React from "react";
import { Routes, Route } from "react-router-dom";
import LeaderboardPage from "./pages/LeaderboardPage";
import UpcomingPage from "./pages/UpcomingPage";
import QuotasPage from "./pages/QuotasPage";
import PastEventsPage from "./pages/PastEventsPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LeaderboardPage />} />
      <Route path="/upcoming" element={<UpcomingPage />} />
      <Route path="/quotas" element={<QuotasPage />} />
      <Route path="/past-events" element={<PastEventsPage />} />
      <Route path="/admin" element={<AdminPage />} /> {/* Admin Route */}
    </Routes>
  );
}

export default App;
