import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Materials from "@/pages/Materials";
import Practice from "@/pages/Practice";
import MaterialDetail from "@/pages/MaterialDetail";
import PracticeDetail from "@/pages/PracticeDetail";
import QuizPlayer from "@/pages/QuizPlayer";
import AboutUs from "@/pages/AboutUs";
import Mentorship from "@/pages/Mentorship";
import Careers from "@/pages/Careers";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import StudyNotes from "@/pages/StudyNotes";
import PreviousPapers from "@/pages/PreviousPapers";
import Profile from "@/pages/Profile";
import AdminRoute from "@/components/AdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AIQuestionGenerator from "@/pages/admin/AIQuestionGenerator";
import UsersManagement from "@/pages/admin/UsersManagement";
import QuestionsManagement from "@/pages/admin/QuestionsManagement";
import MaterialsManagement from "@/pages/admin/MaterialsManagement";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/about" component={AboutUs} />
      <Route path="/mentorship" component={Mentorship} />
      <Route path="/careers" component={Careers} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/study-notes" component={StudyNotes} />
      <Route path="/previous-papers" component={PreviousPapers} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/materials">
        <ProtectedRoute>
          <Materials />
        </ProtectedRoute>
      </Route>
      <Route path="/materials/:id">
        <ProtectedRoute>
          <MaterialDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/practice">
        <ProtectedRoute>
          <Practice />
        </ProtectedRoute>
      </Route>
      <Route path="/practice/:id">
        <ProtectedRoute>
          <PracticeDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/practice/:id/play">
        <ProtectedRoute>
          <QuizPlayer />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/admin/ai-questions">
        <AdminRoute>
          <AIQuestionGenerator />
        </AdminRoute>
      </Route>
      <Route path="/admin/users">
        <AdminRoute>
          <UsersManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/questions">
        <AdminRoute>
          <QuestionsManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/materials">
        <AdminRoute>
          <MaterialsManagement />
        </AdminRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;