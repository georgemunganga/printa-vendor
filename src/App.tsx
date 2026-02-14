
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundaryProvider } from "@/components/ErrorBoundaryProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import JobDetails from "./pages/dashboard/job/[id]";
import Feedback from "./pages/dashboard/Feedback";
import Tracking from "./pages/dashboard/Tracking";
import Chat from "./pages/dashboard/Chat";
import DashboardV2 from "./pages/dashboard/DashboardV2";
import POSPage from "./pages/pos/POSPage";
import ShiftManagement from "./pages/dashboard/ShiftManagement";
import Stores from "./pages/dashboard/Stores";
import { JobProvider } from "@/context/job-context";

const PRELOADER_MIN_VISIBLE_MS = 500;
const queryClient = new QueryClient();

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
            <JobProvider>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<PrintFlow />} />
                  <Route path="/customize" element={<Customize />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/dashboard" element={<DashboardV2 />} />
                  <Route path="/dashboard-old" element={<Dashboard />} />
                  <Route path="/dashboard/job-feed" element={<Navigate to="/dashboard/orders" replace />} />
                  <Route path="/dashboard/orders" element={<OrderHistory />} />
                  <Route path="/dashboard/locations" element={<Locations />} />
                  <Route path="/dashboard/profile" element={<Profile />} />
                  <Route path="/dashboard/profile/edit" element={<EditProfile />} />
                  <Route path="/dashboard/payment-methods" element={<PaymentMethods />} />
                  <Route path="/dashboard/settings" element={<Settings />} />
                  <Route path="/dashboard/support" element={<Support />} />
                  <Route path="/dashboard/feedback" element={<Feedback />} />
                  <Route path="/dashboard/job/:id" element={<JobDetails />} />
                  <Route path="/dashboard/tracking" element={<Tracking />} />
                  <Route path="/dashboard/tracking/:id" element={<Tracking />} />
                  <Route path="/dashboard/chat" element={<Chat />} />
                  <Route path="/dashboard/chat/:orderId" element={<Chat />} />
                  <Route path="/dashboard/pos" element={<POSPage />} />
                  <Route path="/dashboard/shift-management" element={<ShiftManagement />} />
                  <Route path="/dashboard/stores" element={<Stores />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/otp" element={<Otp />} />
                  <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </JobProvider>
          </BrowserRouter>
        </ErrorBoundaryProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
