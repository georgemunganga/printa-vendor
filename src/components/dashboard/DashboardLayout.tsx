import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { PanelLeft } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { BackButton } from "@/components/dashboard/BackButton";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  hideMobileBottomNav?: boolean;
}

const PRIMARY_TABS = [
  "/dashboard",
  "/dashboardv2",
  "/dashboard/orders",
  "/dashboard/profile",
  "/dashboard/pos",
  "/dashboard/shift-management",
  "/dashboard/stores",
  "/dashboard/subscription",
  "/dashboard/team",
  "/dashboard/notifications",
  "/dashboard/support",
  "/dashboard/inventory",
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle, hideMobileBottomNav = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { setActiveStore } = useStore();

  const normalizedPath = useMemo(() => location.pathname.replace(/\/$/, ""), [location.pathname]);
  const isPrimaryRoute = PRIMARY_TABS.includes(normalizedPath);
  const showStackHeader = !isPrimaryRoute;
  const showBottomNav = isPrimaryRoute && !hideMobileBottomNav;
  const mainPaddingTop = showStackHeader ? "pt-20 md:pt-24" : "pt-6 md:pt-6";
  const mainPaddingBottom = showBottomNav ? "pb-28" : "pb-8 md:pb-10";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const handleStackBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  const handleStoreSignOut = () => {
    setActiveStore(null);
    navigate("/dashboard/stores", { replace: true });
    toast.success("Signed out of store");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onLogout={handleLogout}
        onStoreSignOut={handleStoreSignOut}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div
        className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? "md:ml-[220px]" : "md:ml-[72px]"}`}
      >
        {showStackHeader && <StackHeader title={pageTitle} onBack={handleStackBack} />}
        <div className="relative lg:rounded-3xl lg:m-2 lg:p-6 lg:pt-0 bg-gradient-to-b from-printa-red/5 from-[0%] via-orange-50/10 via-[15%] to-white to-[98%]">
          <div className="z-0 absolute inset-0 lg:rounded-2xl bg-gradient-to-r from-white via-purple-100/30 to-pink-100/40" />
          <main
            className={`relative z-10 ${mainPaddingTop} ${mainPaddingBottom} px-4 md:px-6`}
          >
            {children}
          </main>
        </div>
      </div>
      {showBottomNav && <MobileBottomNav />}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg transition hover:bg-white md:hidden"
          aria-label="Open menu"
        >
          <PanelLeft size={20} />
        </button>
      )}
    </div>
  );
};

const StackHeader: React.FC<{ title?: string; onBack: () => void }> = ({ title, onBack }) => (
  <>
    <div className="absolute lg:hidden inset-x-4 top-4 z-30 flex items-center gap-3 rounded-2xl bg-transparent px-0 py-2 md:hidden">
      <BackButton onClick={onBack} ariaLabel="Go back" />
      
    </div>
    <div className="hidden lg:hidden md:flex absolute inset-x-10 top-6 z-30 h-14 items-center gap-3 rounded-2xl bg-white/70 px-4 shadow-sm shadow-black/5">
      <BackButton
        onClick={onBack}
        className="rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
        ariaLabel="Go back"
      />
      <span className="text-lg font-semibold text-gray-900">{title ?? "Back"}</span>
    </div>
  </>
);
