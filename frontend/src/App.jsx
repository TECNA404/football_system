import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Публічні сторінки
import HomePage from "./pages/HomePage";
import PublicTournamentsPage from "./pages/PublicTournamentsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Приватні сторінки
import TeamsPage from "./pages/TeamsPage";
import TournamentsPage from "./pages/TournamentsPage";
import MatchesPage from "./pages/MatchesPage";
import StandingsPage from "./pages/StandingsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* === ПУБЛІЧНІ — без авторизації === */}
          <Route path="/"                   element={<HomePage />} />
          <Route path="/tournaments/public" element={<PublicTournamentsPage />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/register"           element={<RegisterPage />} />

          {/* === ПРИВАТНІ — потрібна авторизація === */}
          <Route path="/teams" element={
            <ProtectedRoute><TeamsPage /></ProtectedRoute>
          } />
          <Route path="/tournaments" element={
            <ProtectedRoute><TournamentsPage /></ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute><MatchesPage /></ProtectedRoute>
          } />
          <Route path="/standings" element={
            <ProtectedRoute><StandingsPage /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;