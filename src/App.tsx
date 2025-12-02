import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PageLoader from "@/components/PageLoader";
import { usePageTracking } from "@/hooks/usePageTracking";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load dashboard pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const CalendarPage = lazy(() => import("./pages/dashboard/CalendarPage"));
const KitchenPage = lazy(() => import("./pages/dashboard/KitchenPage"));
const FinancePage = lazy(() => import("./pages/dashboard/FinancePage"));
const VaultPage = lazy(() => import("./pages/dashboard/VaultPage"));
const FamilyPage = lazy(() => import("./pages/dashboard/FamilyPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const Install = lazy(() => import("./pages/Install"));

// Lazy load admin pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const WebsiteContent = lazy(() => import("./pages/admin/WebsiteContent"));
const TestimonialsAdmin = lazy(() => import("./pages/admin/TestimonialsAdmin"));
const FAQsAdmin = lazy(() => import("./pages/admin/FAQsAdmin"));
const PricingAdmin = lazy(() => import("./pages/admin/PricingAdmin"));
const UsersManagement = lazy(() => import("./pages/admin/UsersManagement"));
const SubscriptionsManagement = lazy(() => import("./pages/admin/SubscriptionsManagement"));
const PromoCodesAdmin = lazy(() => import("./pages/admin/PromoCodesAdmin"));
const ActivityLogs = lazy(() => import("./pages/admin/ActivityLogs"));
const TrafficLogs = lazy(() => import("./pages/admin/TrafficLogs"));
const PaymentTransactions = lazy(() => import("./pages/admin/PaymentTransactions"));
const UserDetails = lazy(() => import("./pages/admin/UserDetails"));

function PageTracker() {
  usePageTracking();
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

const App = () => (
  <ErrorBoundary>
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
                  <Route 
                    path="/install" 
                    element={
                      <Suspense fallback={<PageLoader message="Memuat halaman..." />}>
                        <Install />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoader message="Memuat dashboard..." />}>
                          <Dashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={
                      <Suspense fallback={<PageLoader />}>
                        <DashboardHome />
                      </Suspense>
                    } />
                    <Route path="calendar" element={
                      <Suspense fallback={<PageLoader message="Memuat kalender..." />}>
                        <CalendarPage />
                      </Suspense>
                    } />
                    <Route path="kitchen" element={
                      <Suspense fallback={<PageLoader message="Memuat dapur..." />}>
                        <KitchenPage />
                      </Suspense>
                    } />
                    <Route path="finance" element={
                      <Suspense fallback={<PageLoader message="Memuat keuangan..." />}>
                        <FinancePage />
                      </Suspense>
                    } />
                    <Route path="vault" element={
                      <Suspense fallback={<PageLoader message="Memuat vault..." />}>
                        <VaultPage />
                      </Suspense>
                    } />
                    <Route path="family" element={
                      <Suspense fallback={<PageLoader message="Memuat keluarga..." />}>
                        <FamilyPage />
                      </Suspense>
                    } />
                    <Route path="settings" element={
                      <Suspense fallback={<PageLoader message="Memuat pengaturan..." />}>
                        <SettingsPage />
                      </Suspense>
                    } />
                  </Route>
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoader message="Memuat admin panel..." />}>
                          <AdminLayout />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    } />
                    <Route path="content" element={
                      <Suspense fallback={<PageLoader />}>
                        <WebsiteContent />
                      </Suspense>
                    } />
                    <Route path="testimonials" element={
                      <Suspense fallback={<PageLoader />}>
                        <TestimonialsAdmin />
                      </Suspense>
                    } />
                    <Route path="faqs" element={
                      <Suspense fallback={<PageLoader />}>
                        <FAQsAdmin />
                      </Suspense>
                    } />
                    <Route path="pricing" element={
                      <Suspense fallback={<PageLoader />}>
                        <PricingAdmin />
                      </Suspense>
                    } />
                    <Route path="users" element={
                      <Suspense fallback={<PageLoader />}>
                        <UsersManagement />
                      </Suspense>
                    } />
                    <Route path="users/:userId" element={
                      <Suspense fallback={<PageLoader />}>
                        <UserDetails />
                      </Suspense>
                    } />
                    <Route path="subscriptions" element={
                      <Suspense fallback={<PageLoader />}>
                        <SubscriptionsManagement />
                      </Suspense>
                    } />
                    <Route path="promo-codes" element={
                      <Suspense fallback={<PageLoader />}>
                        <PromoCodesAdmin />
                      </Suspense>
                    } />
                    <Route path="activity-logs" element={
                      <Suspense fallback={<PageLoader />}>
                        <ActivityLogs />
                      </Suspense>
                    } />
                    <Route path="traffic-logs" element={
                      <Suspense fallback={<PageLoader />}>
                        <TrafficLogs />
                      </Suspense>
                    } />
                    <Route path="transactions" element={
                      <Suspense fallback={<PageLoader />}>
                        <PaymentTransactions />
                      </Suspense>
                    } />
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
  </ErrorBoundary>
);

export default App;
