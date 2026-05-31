import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

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
import StatisticsPage from "./pages/StatisticsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import TeamEditPage from "./pages/TeamEditPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import CoachDetailPage from "./pages/CoachDetailPage";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/tournaments/public" element={<PageWrapper><PublicTournamentsPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

        <Route path="/teams" element={
          <ProtectedRoute><PageWrapper><TeamsPage /></PageWrapper></ProtectedRoute>
        } />
        <Route path="/tournaments" element={
          <ProtectedRoute><PageWrapper><TournamentsPage /></PageWrapper></ProtectedRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute><PageWrapper><MatchesPage /></PageWrapper></ProtectedRoute>
        } />
        <Route path="/standings" element={
          <ProtectedRoute><PageWrapper><StandingsPage /></PageWrapper></ProtectedRoute>
        } />
        <Route path="/statistics" element={
          <ProtectedRoute><PageWrapper><StatisticsPage /></PageWrapper></ProtectedRoute>
        } />
        <Route path="/teams/:id" element={<PageWrapper><TeamDetailPage /></PageWrapper>} />
        <Route path="/teams/:id/edit" element={
          <ProtectedRoute><Navigate to="../" replace /></ProtectedRoute>
        } />
        <Route path="/players/:id" element={<PageWrapper><PlayerDetailPage /></PageWrapper>} />
        <Route path="/coaches/:id" element={<PageWrapper><CoachDetailPage /></PageWrapper>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Navbar />
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;