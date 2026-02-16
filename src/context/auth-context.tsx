import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Permission, UserRole } from "@/types";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import { GOOGLE_CLIENT_ID } from "@/lib/auth-config";
import { MOCK_STORES, type MembershipLike } from "@/mock-api/stores";
import {
  clearMockSession,
  createMockSession,
  persistMockSession,
  refreshMockSession,
  restoreMockSession,
  type MockAuthSession,
} from "@/mock-api/auth";

export interface StoreMembership extends MembershipLike {
  title?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  memberSince: string;
  rating?: number;
  role: UserRole;
  permissions: Permission[];
  businessId: string;
  businessName: string;
  assignedStoreIds?: string[];
  memberships?: StoreMembership[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  setActiveStoreScope: (storeId: string | null) => void;
  can: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  isOwner: () => boolean;
  isManager: () => boolean;
  isStaff: () => boolean;
}

const REFRESH_POLL_INTERVAL_MS = 30 * 1000;
const GOOGLE_PROVIDER_CLIENT_ID = GOOGLE_CLIENT_ID || "missing-google-client-id";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const uniqPermissions = (permissions: Permission[]) => Array.from(new Set(permissions));

const ensureMembershipPermissions = (membership: StoreMembership): StoreMembership => {
  const defaults = ROLE_PERMISSIONS[membership.role] ?? [];
  const effective = membership.permissions.length > 0 ? membership.permissions : defaults;
  return {
    ...membership,
    permissions: uniqPermissions(effective),
  };
};

const buildDefaultMemberships = (candidate: AuthUser): StoreMembership[] => {
  if (candidate.memberships && candidate.memberships.length > 0) {
    return candidate.memberships.map(ensureMembershipPermissions);
  }

  if (candidate.role === "owner") {
    return MOCK_STORES.filter((s) => s.businessId === candidate.businessId).map((s) => ({
      storeId: s.id,
      role: "owner",
      permissions: ROLE_PERMISSIONS.owner,
      isActive: true,
    }));
  }

  const scopedAssigned = candidate.assignedStoreIds ?? [];
  const fallbackRole: UserRole = candidate.role ?? "staff";
  return scopedAssigned.map((storeId) => ({
    storeId,
    role: fallbackRole,
    permissions: candidate.permissions.length > 0 ? candidate.permissions : ROLE_PERMISSIONS[fallbackRole],
    isActive: true,
  }));
};

const normalizeUser = (candidate: AuthUser): AuthUser => {
  const memberships = buildDefaultMemberships(candidate);
  const defaults = ROLE_PERMISSIONS[candidate.role] ?? [];
  const permissions = candidate.permissions.length > 0 ? candidate.permissions : defaults;

  return {
    ...candidate,
    permissions: uniqPermissions(permissions),
    memberships,
  };
};

const getMembershipForStore = (user: AuthUser | null, storeId: string | null): StoreMembership | null => {
  if (!user || !storeId) return null;
  const memberships = user.memberships ?? [];
  return memberships.find((m) => m.storeId === storeId && m.isActive !== false) ?? null;
};

const getEffectiveRoleAndPermissions = (
  user: AuthUser | null,
  activeStoreScope: string | null
): { role: UserRole | null; permissions: Permission[] } => {
  if (!user) return { role: null, permissions: [] };

  const scopedMembership = getMembershipForStore(user, activeStoreScope);
  if (scopedMembership) {
    return {
      role: scopedMembership.role,
      permissions: scopedMembership.permissions,
    };
  }

  // Root scope: allow pages that are not store-scoped if user has access from at least one membership.
  if (!activeStoreScope) {
    const memberships = (user.memberships ?? []).filter((m) => m.isActive !== false);
    if (memberships.some((m) => m.role === "owner")) {
      return { role: "owner", permissions: ROLE_PERMISSIONS.owner };
    }
    return {
      role: user.role,
      permissions: uniqPermissions(memberships.flatMap((m) => m.permissions)),
    };
  }

  return {
    role: user.role,
    permissions: user.permissions,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<MockAuthSession | null>(() => restoreMockSession());
  const [activeStoreScope, setActiveStoreScope] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("printa_active_store_id");
  });

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(session?.user);

  const effectiveAccess = useMemo(
    () => getEffectiveRoleAndPermissions(user, activeStoreScope),
    [user, activeStoreScope]
  );

  const login = (nextUser: AuthUser) => {
    const normalizedUser = normalizeUser(nextUser);
    const nextSession = createMockSession(normalizedUser);
    setSession(nextSession);
  };

  const logout = () => {
    setSession(null);
    setActiveStoreScope(null);
    clearMockSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("printa_active_store_id");
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const mergedUser = normalizeUser({ ...prev.user, ...updates });
      const nextSession: MockAuthSession = { ...prev, user: mergedUser };
      persistMockSession(nextSession);
      return nextSession;
    });
  };

  const can = (permission: Permission): boolean => {
    if (!effectiveAccess.role) return false;
    if (effectiveAccess.role === "owner") return true;
    return effectiveAccess.permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => effectiveAccess.role === role;
  const isOwner = (): boolean => effectiveAccess.role === "owner";
  const isManager = (): boolean => effectiveAccess.role === "manager";
  const isStaff = (): boolean => effectiveAccess.role === "staff";

  useEffect(() => {
    if (!session || typeof window === "undefined") return;

    const intervalId = window.setInterval(() => {
      setSession((prev) => {
        if (!prev) return prev;
        const refreshed = refreshMockSession(prev);
        if (!refreshed) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("printa_active_store_id");
          }
          setActiveStoreScope(null);
          return null;
        }
        return refreshed;
      });
    }, REFRESH_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [session?.refreshToken]);

  const setActiveStoreScopeHandler = useCallback((storeId: string | null) => {
    setActiveStoreScope(storeId);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
      setActiveStoreScope: setActiveStoreScopeHandler,
      can,
      hasRole,
      isOwner,
      isManager,
      isStaff,
    }),
    [user, isAuthenticated, setActiveStoreScopeHandler, activeStoreScope]
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_PROVIDER_CLIENT_ID}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
