import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePageTracking } from "@/hooks/usePageTracking";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Install from "./pages/Install";
import DashboardHome from "./pages/dashboard/DashboardHome";
import CalendarPage from "./pages/dashboard/CalendarPage";
import KitchenPage from "./pages/dashboard/KitchenPage";
import FinancePage from "./pages/dashboard/FinancePage";
import VaultPage from "./pages/dashboard/VaultPage";
import FamilyPage from "./pages/dashboard/FamilyPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WebsiteContent from "./pages/admin/WebsiteContent";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin";
import FAQsAdmin from "./pages/admin/FAQsAdmin";
import PricingAdmin from "./pages/admin/PricingAdmin";
import UsersManagement from "./pages/admin/UsersManagement";
import SubscriptionsManagement from "./pages/admin/SubscriptionsManagement";
import PromoCodesAdmin from "./pages/admin/PromoCodesAdmin";
import ActivityLogs from "./pages/admin/ActivityLogs";
import TrafficLogs from "./pages/admin/TrafficLogs";
import PaymentTransactions from "./pages/admin/PaymentTransactions";
import NotFound from "./pages/NotFound";

function PageTracker() {
  usePageTracking();
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
            <PageTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<Install />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="kitchen" element={<KitchenPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="vault" element={<VaultPage />} />
                <Route path="family" element={<FamilyPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="content" element={<WebsiteContent />} />
                <Route path="testimonials" element={<TestimonialsAdmin />} />
                <Route path="faqs" element={<FAQsAdmin />} />
                <Route path="pricing" element={<PricingAdmin />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="subscriptions" element={<SubscriptionsManagement />} />
                <Route path="promo-codes" element={<PromoCodesAdmin />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="traffic-logs" element={<TrafficLogs />} />
                <Route path="transactions" element={<PaymentTransactions />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </LanguageProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
