import type { Permission, UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Printer,
  FileText,
  MessageCircle,
  Store,
  User,
  Settings,
  HelpCircle,
  Users,
  CreditCard,
  Bell,
  Package,
} from "lucide-react";

export interface AccessUser {
  role: UserRole;
  permissions: Permission[];
}

// Default permission sets per role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    "manage_stores", "view_stores", "edit_store_settings",
    "manage_team", "view_team", "assign_roles",
    "view_billing", "manage_billing", "view_revenue", "manage_pricing",
    "manage_pos", "use_pos", "view_orders", "manage_orders", "accept_orders", "cancel_orders",
    "manage_shifts", "view_shifts", "clock_in_out",
    "view_analytics", "view_reports", "export_data",
    "view_dashboard", "manage_settings", "manage_inventory", "view_support", "manage_notifications",
  ],
  manager: [
    "view_stores", "edit_store_settings",
    "view_team",
    "view_revenue",
    "manage_pos", "use_pos", "view_orders", "manage_orders", "accept_orders", "cancel_orders",
    "manage_shifts", "view_shifts", "clock_in_out",
    "view_analytics", "view_reports",
    "view_dashboard", "manage_inventory", "view_support",
  ],
  staff: [
    "use_pos",
    "view_orders",
    "accept_orders",
    "view_shifts",
    "clock_in_out",
    "view_dashboard",
    "view_support",
  ],
};

export function hasPermission(user: AccessUser | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === "owner") return true;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: AccessUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  if (user.role === "owner") return true;
  return permissions.some((p) => user.permissions.includes(p));
}

export function hasAllPermissions(user: AccessUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  if (user.role === "owner") return true;
  return permissions.every((p) => user.permissions.includes(p));
}

// Navigation item with permission gating
export interface NavItem {
  icon: LucideIcon;
  name: string;
  path: string;
  requiredPermissions?: Permission[];
  requiresAny?: boolean;
  requiresStore?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    icon: Home,
    name: "Dashboard",
    path: "/dashboard",
    requiredPermissions: ["view_dashboard"],
    requiresStore: true,
  },
  {
    icon: Printer,
    name: "POS",
    path: "/dashboard/pos",
    requiredPermissions: ["use_pos", "manage_pos"],
    requiresAny: true,
    requiresStore: true,
  },
  {
    icon: FileText,
    name: "Orders",
    path: "/dashboard/orders",
    requiredPermissions: ["view_orders"],
    requiresStore: true,
  },
  {
    icon: MessageCircle,
    name: "Messages",
    path: "/dashboard/chat",
    requiresStore: true,
  },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    icon: Store,
    name: "Stores",
    path: "/dashboard/stores",
    requiredPermissions: ["view_stores", "manage_stores"],
    requiresAny: true,
  },
  {
    icon: Users,
    name: "Team",
    path: "/dashboard/team",
    requiredPermissions: ["view_team", "manage_team"],
    requiresAny: true,
  },
  {
    icon: Package,
    name: "Inventory",
    path: "/dashboard/inventory",
    requiredPermissions: ["manage_inventory"],
    requiresStore: true,
  },
  {
    icon: CreditCard,
    name: "Subscription",
    path: "/dashboard/subscription",
    requiredPermissions: ["view_billing", "manage_billing"],
    requiresAny: true,
  },
  {
    icon: Bell,
    name: "Notifications",
    path: "/dashboard/notifications",
    requiredPermissions: ["manage_notifications"],
  },
  {
    icon: User,
    name: "Profile",
    path: "/dashboard/profile",
  },
  {
    icon: Settings,
    name: "Store Settings",
    path: "/dashboard/settings",
    requiredPermissions: ["manage_settings"],
    requiresStore: true,
  },
  {
    icon: HelpCircle,
    name: "Support",
    path: "/dashboard/support",
  },
  {
    icon: HelpCircle,
    name: "Help",
    path: "/dashboard/help",
  },
];

export function filterNavItems(items: NavItem[], user: AccessUser | null): NavItem[] {
  if (!user) return [];

  return items.filter((item) => {
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true;
    }
    return item.requiresAny
      ? hasAnyPermission(user, item.requiredPermissions)
      : hasAllPermissions(user, item.requiredPermissions);
  });
}

export function getNavItemsForUser(user: AccessUser | null): {
  main: NavItem[];
  secondary: NavItem[];
} {
  return {
    main: filterNavItems(MAIN_NAV_ITEMS, user),
    secondary: filterNavItems(SECONDARY_NAV_ITEMS, user),
  };
}
