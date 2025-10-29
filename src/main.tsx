import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { queryClient } from "./lib/queryClient";
import App from "./App.jsx";
import ArtistsPage from "./pages/ArtistsPage.jsx";
import ArtistPage from "./pages/ArtistPage.jsx";
import SongPage from "./pages/SongPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { useAuth } from "./contexts/AuthContext";
import "./index.css";

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(
      (registration) => {
        console.log("ServiceWorker registered:", registration.scope);
      },
      (err) => {
        console.log("ServiceWorker registration failed:", err);
      }
    );
  });
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/artists"
              element={
                <ProtectedRoute>
                  <ArtistsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artist/:artist"
              element={
                <ProtectedRoute>
                  <ArtistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/song/:id"
              element={
                <ProtectedRoute>
                  <SongPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/:category"
              element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={<Navigate to="/currently-working" replace />}
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
