import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  LogOut,
  LogIn,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";
import { getNavItemsForUser } from "@/lib/permissions";
import { isRootScopePath } from "@/lib/route-scope";

interface DashboardSidebarProps {
  isOpen: boolean;
  onLogout: () => void;
  onStoreSignOut: () => void;
  toggleSidebar: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  onLogout,
  onStoreSignOut,
  toggleSidebar,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isStoreSelected } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const isRootRoute = isRootScopePath(location.pathname);
  const shouldShowStoreNav = isStoreSelected && !isRootRoute;

  const nav = getNavItemsForUser(user);
  const visibleMainNav = shouldShowStoreNav
    ? nav.main.filter((item) => item.requiresStore)
    : [];
  const visibleSecondaryNav = shouldShowStoreNav
    ? nav.secondary.filter((item) => item.requiresStore)
    : nav.secondary.filter((item) => !item.requiresStore);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 220 : 72 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="hidden md:flex flex-col bg-printa-red border-r border-gray-300 fixed left-0 top-0 h-full z-30 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo and toggle */}
      <div className="h-16\ flex-shrink-0 px-3 relative pb-3">
        <div className="flex items-center justify-between w-full">
          <Link
            to="/"
            className={`pt-2 transition-opacity duration-200 ease-in-out ${
              isOpen || !isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {isOpen ? (
              <img src="/printa-logo-black.png" alt="Printa" className="h-12 w-auto" />
            ) : (
              <div className="relative left-1 w-10 h-10 rounded-full bg-tranparent shadow-sm flex items-center justify-center ">
                <img src="/printa-logo-black.png" alt="Printa" className="h-10 w-auto" />
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            className={`p-2 text-white transition ${
              isOpen ? "opacity-100 visible" : "invisible opacity-0"
            }`}
            onClick={toggleSidebar}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <PanelLeftClose size={20} />
          </Button>
        </div>
        {!isOpen && (
          <Button
            variant="ghost"
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 text-white transition ${
              isHovered ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
          >
            <PanelLeft size={20} />
          </Button>
        )}
      </div>

      {/* New Print CTA */}
      {/* <div className="p-3 flex-shrink-0">
        <Link
          to="/"
          className={`flex items-center justify-center gap-2 w-full py-2.5 bg-printa-black text-white rounded-xl font-medium text-sm transition-all hover:bg-printa-black/90 active:scale-[0.98] ${
            isOpen ? "px-3" : "px-0"
          }`}
          title="New Print"
        >
          <Printer size={18} />
          {isOpen && <span>New Print</span>}
        </Link>
      </div> */}

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="space-y-1">
          {visibleMainNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                title={item.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-printa-black text-white"
                    : "text-white hover:bg-gray-50 hover:text-gray-900"
                } ${!isOpen ? "justify-center px-0" : ""}`}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {visibleSecondaryNav.length > 0 && (
          <>
            <div className={`my-4 border-t border-white/20 ${!isOpen ? "mx-2" : ""}`} />

            <div className="space-y-1">
              {visibleSecondaryNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    title={item.name}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-printa-black text-white"
                        : "text-white hover:bg-gray-50 hover:text-gray-700"
                    } ${!isOpen ? "justify-center px-0" : ""}`}
                  >
                    <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Profile + Logout */}
      <div className="border-t border-white/20 p-3 flex-shrink-0">
        {isStoreSelected && (
          <button
            onClick={onStoreSignOut}
            title="Sign out of store"
            className={`mb-2 flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white hover:text-gray-900 transition-all ${
              !isOpen ? "justify-center px-0" : ""
            }`}
          >
            <LogIn size={16} />
            {isOpen && <span>Sign Out of Store</span>}
          </button>
        )}
      
        {isOpen ? (
          <Link
            to="/dashboard/profile"
            className="flex bg-white items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors mb-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-printa-black to-black text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) ?? "G"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? "Guest"}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email ?? "Welcome"}</p>
            </div>
          </Link>
        ) : (
          <Link
            to="/dashboard/profile"
            title="Profile"
            className="flex items-center justify-center mb-2"
          >
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) ?? "P"}
            </div>
          </Link>
        )}

        <button
          onClick={onLogout}
          title="Sign Out"
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-rose-50 hover:text-rose-500 transition-all ${
            !isOpen ? "justify-center px-0" : ""
          }`}
        >
          <LogOut size={16} />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
