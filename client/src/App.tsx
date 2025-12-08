import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Materials from "@/pages/Materials";
import Practice from "@/pages/Practice";

import MaterialDetail from "@/pages/MaterialDetail";
import PracticeDetail from "@/pages/PracticeDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/materials" component={Materials} />
      <Route path="/materials/:id" component={MaterialDetail} />
      <Route path="/practice" component={Practice} />
      <Route path="/practice/:id" component={PracticeDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;