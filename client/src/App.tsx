import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Materials from "@/pages/Materials";
import MaterialDetail from "@/pages/MaterialDetail";
import HardCopyDetail from "@/pages/HardCopyDetail";
import Cart from "@/pages/Cart";
import AboutUs from "@/pages/AboutUs";
import Mentorship from "@/pages/Mentorship";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import ShippingPolicy from "@/pages/ShippingPolicy";
import RefundPolicy from "@/pages/RefundPolicy";
import FAQ from "@/pages/FAQ";
import TrackOrder from "@/pages/TrackOrder";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import AdminRoute from "@/components/AdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UsersManagement from "@/pages/admin/UsersManagement";
import MaterialsManagement from "@/pages/admin/MaterialsManagement";
import HardCopyManagement from "@/pages/admin/HardCopyManagement";
import OrdersManagement from "@/pages/admin/OrdersManagement";
import CouponsManagement from "@/pages/admin/CouponsManagement";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/about" component={AboutUs} />
      <Route path="/mentorship" component={Mentorship} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/shipping" component={ShippingPolicy} />
      <Route path="/refund" component={RefundPolicy} />
      <Route path="/faq" component={FAQ} />
      <Route path="/track" component={TrackOrder} />
      <Route path="/contact" component={Contact} />
      
      {/* Public Routes - No login required */}
      <Route path="/materials" component={Materials} />
      <Route path="/materials/:slug" component={MaterialDetail} />
      <Route path="/shop/:slug" component={HardCopyDetail} />
      <Route path="/cart" component={Cart} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
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
      <Route path="/admin/users">
        <AdminRoute>
          <UsersManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/materials">
        <AdminRoute>
          <MaterialsManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/hardcopy">
        <AdminRoute>
          <HardCopyManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/orders">
        <AdminRoute>
          <OrdersManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/coupons">
        <AdminRoute>
          <CouponsManagement />
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
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
