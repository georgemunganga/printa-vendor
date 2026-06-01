
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundaryProvider } from "@/components/ErrorBoundaryProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Preloader } from "@/components/Preloader";
import PrintFlow from "./pages/PrintFlow";
import Customize from "./pages/Customize";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/dashboard/Dashboard";
import OrderHistory from "./pages/dashboard/JobFeed";
import Locations from "./pages/dashboard/Locations";
import Profile from "./pages/dashboard/Profile";
import Support from "./pages/dashboard/Support";
import EditProfile from "./pages/dashboard/editprofile";
import PaymentMethods from "./pages/dashboard/PaymentMethods";
import Settings from "./pages/dashboard/Settings";
import HowItWorks from "./pages/HowItWorks";
import Upload from "./pages/Upload";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Otp from "./pages/auth/Otp";
import GoogleCallback from "./pages/auth/GoogleCallback";
import JobDetails from "./pages/dashboard/job/[id]";
import JobDetailsV2 from "./pages/dashboard/job/[id]-v2";
import Feedback from "./pages/dashboard/Feedback";
import Tracking from "./pages/dashboard/store/Tracking";
import Chat from "./pages/dashboard/store/Chat";
import DashboardV2 from "./pages/dashboard/store/DashboardV2";
import POSPage from "./pages/dashboard/store/pos/POSPage";
import Stores from "./pages/dashboard/Stores";
import VendorOnboarding from "./pages/dashboard/VendorOnboarding";
import Subscription from "./pages/dashboard/owner/Subscription";
import Team from "./pages/dashboard/Team";
import Inventory from "./pages/dashboard/Inventory";
import Notifications from "./pages/dashboard/Notifications";
import HelpCenter from "./pages/dashboard/help/HelpCenter";
import FAQ from "./pages/dashboard/help/FAQ";
import FixAProblem from "./pages/dashboard/help/FixAProblem";
import DownloadingSavingSharing from "./pages/dashboard/help/DownloadingSavingSharing";
import { StoreEntrypoint } from "./pages/StoreEntrypoint";
import { NotificationProvider } from "@/context/notification-context";
import { JobProvider } from "@/context/job-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { StorePinLockOverlay } from "@/components/auth/StorePinLockOverlay";
import { queryClient } from "@/query";

const PRELOADER_MIN_VISIBLE_MS = 500;

const RouteAwareStoreLock = () => {
  const location = useLocation();
  return <StorePinLockOverlay pathname={location.pathname} />;
};

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const loadStartRef = useRef(Date.now());

  useEffect(() => {
    loadStartRef.current = Date.now();
    let timerId: number | undefined;

    const markReady = () => {
      const elapsed = Date.now() - loadStartRef.current;
      const remaining = PRELOADER_MIN_VISIBLE_MS - elapsed;
      if (remaining <= 0) {
        setIsAppReady(true);
        return;
      }
      timerId = window.setTimeout(() => setIsAppReady(true), remaining);
    };

    if (document.readyState === "complete") {
      markReady();
      return () => {
        if (timerId) {
          window.clearTimeout(timerId);
        }
      };
    }

    const handleLoad = () => markReady();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Preloader visible={!isAppReady} />
      <TooltipProvider>
        <ErrorBoundaryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteAwareStoreLock />
            <NotificationProvider>
            <JobProvider>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* ── Public routes ── */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/otp" element={<Otp />} />
                  <Route path="/auth/google/callback" element={<GoogleCallback />} />
                  <Route path="/onboarding" element={<VendorOnboarding />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/pricing" element={<Pricing />} />

                  {/* ── Protected routes (require auth) ── */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute routeScope="root">
                        <Navigate to="/dashboard/stores" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/printflow" element={<ProtectedRoute routeScope="store"><PrintFlow /></ProtectedRoute>} />
                  <Route path="/customize" element={<ProtectedRoute routeScope="store"><Customize /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute routeScope="store"><Checkout /></ProtectedRoute>} />
                  <Route path="/upload" element={<ProtectedRoute routeScope="store"><Upload /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute routeScope="store"><DashboardV2 /></ProtectedRoute>} />
                  <Route path="/dashboard-old" element={<ProtectedRoute routeScope="store"><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/job-feed" element={<Navigate to="/dashboard/orders" replace />} />
                  <Route path="/dashboard/orders" element={<ProtectedRoute routeScope="store"><OrderHistory /></ProtectedRoute>} />
                  <Route path="/dashboard/locations" element={<ProtectedRoute routeScope="store"><Locations /></ProtectedRoute>} />
                  <Route path="/dashboard/profile" element={<ProtectedRoute routeScope="root"><Profile /></ProtectedRoute>} />
                  <Route path="/dashboard/profile/edit" element={<ProtectedRoute routeScope="root"><EditProfile /></ProtectedRoute>} />
                  <Route path="/dashboard/payment-methods" element={<ProtectedRoute routeScope="root"><PaymentMethods /></ProtectedRoute>} />
                  <Route path="/dashboard/settings" element={<ProtectedRoute routeScope="store" requiredPermission="manage_settings"><Settings /></ProtectedRoute>} />
                  <Route path="/dashboard/support" element={<ProtectedRoute routeScope="root"><Support /></ProtectedRoute>} />
                  <Route path="/dashboard/feedback" element={<ProtectedRoute routeScope="root"><Feedback /></ProtectedRoute>} />
                  <Route path="/dashboard/job/:id" element={<ProtectedRoute routeScope="store"><JobDetails /></ProtectedRoute>} />
                  <Route path="/dashboard/job/:id/v2" element={<ProtectedRoute routeScope="store"><JobDetailsV2 /></ProtectedRoute>} />
                  <Route path="/dashboard/tracking" element={<ProtectedRoute routeScope="store"><Tracking /></ProtectedRoute>} />
                  <Route path="/dashboard/tracking/:id" element={<ProtectedRoute routeScope="store"><Tracking /></ProtectedRoute>} />
                  <Route path="/dashboard/chat" element={<ProtectedRoute routeScope="store"><Chat /></ProtectedRoute>} />
                  <Route path="/dashboard/chat/:orderId" element={<ProtectedRoute routeScope="store"><Chat /></ProtectedRoute>} />
                  <Route path="/dashboard/pos" element={<ProtectedRoute routeScope="store" requiredPermission="use_pos"><POSPage /></ProtectedRoute>} />
                  <Route path="/dashboard/shift-management" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/dashboard/stores"
                    element={
                      <ProtectedRoute routeScope="root" requiredPermissions={["view_stores", "manage_stores"]} requiresAny>
                        <Stores />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/subscription"
                    element={
                      <ProtectedRoute routeScope="root" requiredPermissions={["view_billing", "manage_billing"]} requiresAny>
                        <Subscription />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/team"
                    element={
                      <ProtectedRoute routeScope="root" requiredPermissions={["view_team", "manage_team"]} requiresAny>
                        <Team />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/inventory"
                    element={
                      <ProtectedRoute routeScope="store" requiredPermission="manage_inventory">
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/notifications"
                    element={
                      <ProtectedRoute routeScope="root" requiredPermission="manage_notifications">
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/dashboard/help" element={<ProtectedRoute routeScope="root"><HelpCenter /></ProtectedRoute>} />
                  <Route path="/dashboard/help/faq" element={<ProtectedRoute routeScope="root"><FAQ /></ProtectedRoute>} />
                  <Route path="/dashboard/help/fix-a-problem" element={<ProtectedRoute routeScope="root"><FixAProblem /></ProtectedRoute>} />
                  <Route path="/dashboard/help/downloading-saving-sharing" element={<ProtectedRoute routeScope="root"><DownloadingSavingSharing /></ProtectedRoute>} />
                  <Route path="/profile" element={<Navigate to="/dashboard" replace />} />

                  {/* Store-specific entrypoint - matches /:storeName */}
                  <Route path="/:storeName" element={<ProtectedRoute routeScope="any"><StoreEntrypoint /></ProtectedRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </JobProvider>
            </NotificationProvider>
          </BrowserRouter>
        </ErrorBoundaryProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
