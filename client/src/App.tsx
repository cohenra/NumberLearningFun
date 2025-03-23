import React, { useState, useEffect } from "react";
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

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Update path when navigation happens
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
    };
  }, []);

  // Get the current component to render based on the path
  const getCurrentComponent = () => {
    switch (currentPath) {
      case '/':
        return <Home />;
      case '/content-select':
        return <ContentSelect />;
      case '/learn':
        return <Learn />;
      case '/learn/hebrew-letters':
        return <LearnHebrewLetters />;
      case '/learn/english-letters':
        return <LearnEnglishLetters />;
      case '/practice':
        return <Practice />;
      case '/practice/hebrew-letters':
        return <PracticeHebrewLetters />;
      case '/practice/english-letters':
        return <PracticeEnglishLetters />;
      case '/quick-math':
        return <QuickMath />;
      case '/parent-dashboard':
        return <ParentDashboard />;
      default:
        return <NotFound />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="relative min-h-screen">
          <LanguageSwitcher />
          {getCurrentComponent()}
        </div>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}