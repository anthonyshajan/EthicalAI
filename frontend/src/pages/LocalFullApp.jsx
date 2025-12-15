import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LocalHome from "./LocalHome";
import LocalCheckWork from "./LocalCheckWork";
import LocalChat from "./LocalChat";
import LocalUpload from "./LocalUpload";
import LocalAnalysis from "./LocalAnalysis";
import LocalDashboard from "./LocalDashboard";

export default function LocalFullApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LocalHome />} />
        <Route path="/check" element={<LocalCheckWork />} />
        <Route path="/chat" element={<LocalChat />} />
        <Route path="/upload" element={<LocalUpload />} />
        <Route path="/analysis" element={<LocalAnalysis />} />
        <Route path="/dashboard" element={<LocalDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}