import { Switch, Route } from "wouter";
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
import Header from "@/components/header";
import ComparisonBar from "@/components/comparison-bar";
import { ComparisonProvider } from "@/hooks/use-comparison";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/compare" component={Compare} />
      <Route path="/eligibility" component={Eligibility} />
      <Route path="/university/:id" component={UniversityDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ComparisonProvider>
          <div className="min-h-screen bg-scorecard-bg">
            <Header />
            <Router />
            <ComparisonBar />
          </div>
          <Toaster />
        </ComparisonProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
