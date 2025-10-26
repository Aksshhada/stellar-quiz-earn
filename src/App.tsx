import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import QuizDashboard from "./pages/QuizDashboard";
import Header from "./components/auth/Header";

const App = () => {
  const [publicKey, setPublicKey] = useState("");

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Always show login page first */}
          <Route
            path="/"
            element={
              !publicKey ? (
                <Header setPublicKey={setPublicKey} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Dashboard only when wallet connected */}
          <Route
            path="/dashboard"
            element={
              publicKey ? (
                <QuizDashboard publicKey={publicKey} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
