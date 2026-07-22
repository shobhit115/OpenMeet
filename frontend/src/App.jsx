import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";

import Layout from "./components/Layout";
import LandingPage from "./pages/landing";
import Home from "./pages/Home";
import Auth from "./pages/authentication";
import VideoMeet from "./pages/VideoMeet";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <Routes>
            {/* Routes wrapped with Layout contain the shared navbar */}
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            </Route>

            {/* Standalone page without the main navbar */}
              <Route path="/:url" element={<VideoMeet />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;