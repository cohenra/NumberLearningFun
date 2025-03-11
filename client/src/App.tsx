import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Learn from "@/pages/learn";
import Practice from "@/pages/practice";
import QuickMath from "@/pages/quick-math";
import ParentDashboard from "@/pages/parent-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/learn" component={Learn} />
      <Route path="/practice" component={Practice} />
      <Route path="/quick-math" component={QuickMath} />
      <Route path="/parent-dashboard" component={ParentDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;