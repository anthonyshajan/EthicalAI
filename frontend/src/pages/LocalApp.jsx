import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LocalHome from "./LocalHome";
import LocalCheckWork from "./LocalCheckWork";
import LocalChat from "./LocalChat";

export default function LocalApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LocalHome />} />
        <Route path="/check" element={<LocalCheckWork />} />
        <Route path="/chat" element={<LocalChat />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}