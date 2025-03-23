import React from "react";
import { Switch, Route, Router, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Learn from "@/pages/learn";
import Practice from "@/pages/practice";
import QuickMath from "@/pages/quick-math";
import ParentDashboard from "@/pages/parent-dashboard";
import NotFound from "@/pages/not-found";
import ContentSelect from "@/pages/content-select";
import LearnHebrewLetters from "@/pages/learn/hebrew-letters";
import LearnEnglishLetters from "@/pages/learn/english-letters";
import PracticeHebrewLetters from "@/pages/practice/hebrew-letters";
import PracticeEnglishLetters from "@/pages/practice/english-letters";
import { LanguageProvider } from "./lib/i18n/languageContext";
import { LanguageSwitcher } from "./components/ui/language-switcher";

// Define a hash based location hook
const useHashLocation = (): [string, (to: string) => void] => {
  // Get the hash location (removing the # from the beginning)
  const getHashLocation = () => {
    const hash = window.location.hash || "#/";
    return hash.replace(/^#/, "") || "/";
  };

  // Use useState to keep track of the location
  const [loc, setLoc] = React.useState(getHashLocation());
  
  // Listen to hash changes and update our state
  React.useEffect(() => {
    // Update loc when the hash changes
    const handler = () => setLoc(getHashLocation());
    
    // Listen to hashchange event
    window.addEventListener("hashchange", handler);
    
    // Clean up the listener when component unmounts
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  
  // Return the current location and a function to navigate
  const navigate = React.useCallback((to: string) => {
    window.location.hash = to;
  }, []);
  
  return [loc, navigate];
};

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/content-select" component={ContentSelect} />
      <Route path="/learn" component={Learn} />
      <Route path="/learn/hebrew-letters" component={LearnHebrewLetters} />
      <Route path="/learn/english-letters" component={LearnEnglishLetters} />
      <Route path="/practice" component={Practice} />
      <Route path="/practice/hebrew-letters" component={PracticeHebrewLetters} />
      <Route path="/practice/english-letters" component={PracticeEnglishLetters} />
      <Route path="/quick-math" component={QuickMath} />
      <Route path="/parent-dashboard" component={ParentDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router hook={useHashLocation}>
          <div className="relative">
            <LanguageSwitcher />
            <AppRoutes />
          </div>
        </Router>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}