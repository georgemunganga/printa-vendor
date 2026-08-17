import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Permission, UserRole } from "@/types";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import { GOOGLE_CLIENT_ID } from "@/lib/auth-config";
import { apiAuthSessionService } from "@/services/auth-session.service";

export interface StoreMembership {
  storeId: string;
  role: UserRole;
  permissions: Permission[];
  isActive?: boolean;
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
  isAuthLoading: boolean;
  login: (user: AuthUser) => void;
  loginWithApi: (email: string, password: string) => Promise<void>;
  completeOtpLogin: (token: string, tokenType?: string) => Promise<void>;
  completeOAuthLogin: (token: string, tokenType?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  setActiveStoreScope: (storeId: string | null) => void;
  can: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  isOwner: () => boolean;
  isManager: () => boolean;
  isStaff: () => boolean;
}

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

  // The backend currently returns store ownership via the authenticated vendor profile
  // and store list, not a membership payload. Do not fabricate memberships from mock data.
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
    if (user.role === "owner") {
      return { role: "owner", permissions: ROLE_PERMISSIONS.owner };
    }
    const memberships = (user.memberships ?? []).filter((m) => m.isActive !== false);
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoringApiSession, setIsRestoringApiSession] = useState(true);
  const [activeStoreScope, setActiveStoreScope] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("printa_active_store_id");
  });

  const isAuthenticated = Boolean(user);

  const effectiveAccess = useMemo(
    () => getEffectiveRoleAndPermissions(user, activeStoreScope),
    [user, activeStoreScope]
  );

  const login = useCallback((nextUser: AuthUser) => {
    setUser(normalizeUser(nextUser));
  }, []);

  const loginWithApi = useCallback(async (email: string, password: string) => {
    const apiUser = await apiAuthSessionService.login(email, password);
    login(apiUser);
  }, [login]);

  const completeOtpLogin = useCallback(async (token: string, tokenType = "Bearer") => {
    const apiUser = await apiAuthSessionService.completeOtp(token, tokenType);
    login(apiUser);
  }, [login]);

  const completeOAuthLogin = useCallback(async (token: string, tokenType = "Bearer") => {
    const apiUser = await apiAuthSessionService.completeOAuth(token, tokenType);
    login(apiUser);
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    setActiveStoreScope(null);
    apiAuthSessionService.logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("printa_active_store_id");
    }
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? normalizeUser({ ...prev, ...updates }) : prev));
  }, []);

  const can = useCallback((permission: Permission): boolean => {
    if (!effectiveAccess.role) return false;
    if (effectiveAccess.role === "owner") return true;
    return effectiveAccess.permissions.includes(permission);
  }, [effectiveAccess]);

  const hasRole = useCallback((role: UserRole): boolean => effectiveAccess.role === role, [effectiveAccess.role]);
  const isOwner = useCallback((): boolean => effectiveAccess.role === "owner", [effectiveAccess.role]);
  const isManager = useCallback((): boolean => effectiveAccess.role === "manager", [effectiveAccess.role]);
  const isStaff = useCallback((): boolean => effectiveAccess.role === "staff", [effectiveAccess.role]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const apiUser = await apiAuthSessionService.restore();
        if (!cancelled && apiUser) {
          login(apiUser);
        }
      } finally {
        if (!cancelled) setIsRestoringApiSession(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [login]);

  const setActiveStoreScopeHandler = useCallback((storeId: string | null) => {
    setActiveStoreScope(storeId);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAuthLoading: isRestoringApiSession,
      login,
      loginWithApi,
      completeOtpLogin,
      completeOAuthLogin,
      logout,
      updateUser,
      setActiveStoreScope: setActiveStoreScopeHandler,
      can,
      hasRole,
      isOwner,
      isManager,
      isStaff,
    }),
    [
      user,
      isAuthenticated,
      isRestoringApiSession,
      login,
      loginWithApi,
      completeOtpLogin,
      completeOAuthLogin,
      logout,
      updateUser,
      setActiveStoreScopeHandler,
      can,
      hasRole,
      isOwner,
      isManager,
      isStaff,
    ]
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
