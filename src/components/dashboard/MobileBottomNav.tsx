import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "@/context/store-context";
import { useAuth } from "@/context/auth-context";
import { getNavItemsForUser, type NavItem } from "@/lib/permissions";
import { isRootScopePath } from "@/lib/route-scope";

const buildMobileNav = (
  allNav: { main: NavItem[]; secondary: NavItem[] },
  isStoreSelected: boolean,
  pathname: string
): NavItem[] => {
  const profile = allNav.secondary.find((item) => item.path === "/dashboard/profile");
  const stores = allNav.secondary.find((item) => item.path === "/dashboard/stores");
  const help = allNav.secondary.find((item) => item.path === "/dashboard/help");
  const isRootRoute = isRootScopePath(pathname);
  const shouldShowStoreNav = isStoreSelected && !isRootRoute;

  if (!shouldShowStoreNav) {
    return [stores, profile, help].filter((item): item is NavItem => Boolean(item));
  }

  const storeScoped = [...allNav.main, ...allNav.secondary]
    .filter((item) => item.requiresStore)
    .filter((item) => item.path !== "/dashboard/chat")
    .slice(0, 5);
  return storeScoped;
};

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isStoreSelected } = useStore();
  const { user } = useAuth();

  const nav = getNavItemsForUser(user);
  const visibleItems = buildMobileNav(nav, isStoreSelected, location.pathname);

  return (
    <nav
      className="md:hidden fixed inset-x-4 bottom-4 z-50 rounded-3xl bg-printa-red/95 shadow-[0_10px_40px_rgba(231,26,26,0.35)] backdrop-blur-lg safe-area-bottom"
      aria-label="Dashboard navigation"
    >
      <div className="flex items-center justify-around px-6 py-0">
        {visibleItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition ${
                isActive ? "text-white" : "text-white/70 hover:text-white"
              }`}
              aria-label={item.name}
            >
              <span
                className={`p-2 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
                }`}
              >
                <Icon size={20} />
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
