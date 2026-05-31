import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import type { Permission } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requiresAny?: boolean;
  routeScope?: "store" | "root" | "any";
}

const KickToRoot: React.FC = () => {
  const { setActiveStore } = useStore();
  React.useEffect(() => {
    setActiveStore(null);
  }, [setActiveStore]);
  return <Navigate to="/dashboard/stores" replace />;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  requiresAny = false,
  routeScope = "store",
}) => {
  const { isAuthenticated, isAuthLoading, user, can } = useAuth();
  const { isHydrating, isStoreSelected, needsStoreSelection } = useStore();
  const location = useLocation();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isHydrating) {
    return null;
  }

  if (routeScope === "store") {
    if (needsStoreSelection) {
      return <KickToRoot />;
    }
    if (!isStoreSelected) {
      return <KickToRoot />;
    }
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requiresAny
      ? requiredPermissions.some((p) => can(p))
      : requiredPermissions.every((p) => can(p));

    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
