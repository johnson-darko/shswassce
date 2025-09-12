import { Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Compare from "@/pages/compare";
import Eligibility from "@/pages/eligibility-new";
import UniversityDetail from "@/pages/university-detail";
import PDFAdmin from "@/pages/pdf-admin";
import Calculator from "@/pages/calculator";
import Header from "@/components/header";
import ComparisonBar from "@/components/comparison-bar";
import { ComparisonProvider } from "@/hooks/use-comparison";
import SavedProgramsPage from "./pages/saved-programs";
import SettingsPage from "./pages/settings";
import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import BottomNavigation from "@/components/bottom-navigation"; // Adjust path if needed
import PrivacyPage from "./pages/privacy";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ComparisonProvider>
          <div className="min-h-screen bg-scorecard-bg">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/eligibility" element={<Eligibility />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/university/:id" element={<UniversityDetail />} />
              <Route path="/admin/pdf" element={<PDFAdmin />} />
              <Route path="/saved-programs" element={<SavedProgramsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation /> {/* <-- Add this line */}
            <ComparisonBar />
          </div>
          <Toaster />
        </ComparisonProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
