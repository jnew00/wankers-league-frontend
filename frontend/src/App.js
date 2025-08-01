import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/UnifiedAuthContext";
import LeaderboardPage from "./pages/LeaderboardPage";
import QuotasPage from "./pages/QuotasPage";
import EventsPage from "./pages/EventsPage";
import RecapsPage from "./pages/RecapsPage";
import RecapDetail from "./pages/RecapDetail";
import AdminPage from "./pages/AdminPage";
import AddEventPage from "./pages/AddEventPage";
import AddPlayerPage from "./pages/AddPlayerPage";
import AddCourse from "./pages/AddCoursePage";
import Rules from "./pages/RulesPage";
import Polls from "./pages/PollPage";
import PrintScorecardPage from "./pages/PrintScorecardPage";
import FantasyGolf from "./pages/FantasyGolf";
import FantasyLeaderboard from "./pages/FantasyLeaderboard";
import MagicLinkVerification from "./pages/MagicLinkVerification";
import AuthSuccess from "./pages/AuthSuccess";
import AuthError from "./pages/AuthError";
import UserProfile from "./components/UserProfile";
import './App.css';
import './css/print.css';




function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LeaderboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/quotas" element={<QuotasPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/recaps" element={<RecapsPage />} />
        <Route path="/recaps/:id" element={<RecapDetail />} />
        <Route path="/fantasy-golf" element={<FantasyGolf />} />
        <Route path="/fantasy-leaderboard" element={<FantasyLeaderboard />} />
        <Route path="/fantasy" element={<Navigate to="/fantasy-golf" replace />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/auth/magic" element={<MagicLinkVerification />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/error" element={<AuthError />} />
        <Route path="/admin/record-results" element={<AdminPage />} />
      <Route path="/admin/manage-event" element={<AddEventPage />} />
      <Route path="/admin/manage-course" element={<AddCourse />} />
      <Route path="/admin/manage-players" element={<AddPlayerPage />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/printScorecard" element={<PrintScorecardPage />} />
      <Route path="/polls" element={<Polls />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;
