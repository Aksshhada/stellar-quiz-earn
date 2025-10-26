import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import QuizDashboard from "./pages/QuizDashboard";
import LandingPage from "./pages/LandingPage";
import JoinQuiz from "./pages/JoinQuiz";
import QuizInterface from "./pages/QuizInterface";
import QuizResults from "./pages/QuizResults";
import Header from "./components/auth/Header";

const App = () => {
  const [publicKey, setPublicKey] = useState("");

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Show header on all pages */}
        <Header publicKey={publicKey} setPublicKey={setPublicKey} />
        
        <Routes>
          {/* Landing page */}
          <Route 
          path="/"
          element={<LandingPage publicKey={publicKey} setPublicKey={setPublicKey} />}
          />
          {/* <LandingPage publicKey={publicKey} setPublicKey={setPublicKey} />           */}
          {/* Join quiz by code */}
          <Route 
            path="/join" 
            element={
              publicKey ? (
                <JoinQuiz publicKey={publicKey} />
              ) : (
                <Navigate to="/" replace />
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
          
          {/* Quiz interface - taking the quiz */}
          <Route
            path="/quiz/:code"
            element={
              publicKey ? (
                <QuizInterface publicKey={publicKey} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Quiz results page */}
          <Route
            path="/results/:code"
            element={
              publicKey ? (
                <QuizResults publicKey={publicKey} />
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