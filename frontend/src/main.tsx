import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
