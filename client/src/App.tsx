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

function App() {
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ComparisonBar />
          </div>
          <Toaster />
        </ComparisonProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
