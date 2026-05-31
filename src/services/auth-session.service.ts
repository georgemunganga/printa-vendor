import { authService } from "./auth.service";
import { usersService } from "./users.service";
import type { AuthUser } from "@/context/auth-context";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import type { UserRole } from "@/types";

interface JwtClaims {
  user_id?: string;
  email?: string;
  role?: string;
  exp?: number;
}

const decodeJwtPayload = (token: string): JwtClaims => {
  const [, payload] = token.split(".");
  if (!payload) return {};
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return JSON.parse(atob(padded));
};

const mapApiRole = (role?: string): UserRole => {
  switch ((role || "").toUpperCase()) {
    case "ADMIN":
    case "VENDOR":
      return "owner";
    case "MANAGER":
      return "manager";
    case "STAFF":
    case "CASHIER":
    default:
      return "staff";
  }
};

const splitName = (email?: string) => {
  const label = email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return label || "Printa User";
};

export const buildAuthUserFromApiToken = async (token: string): Promise<AuthUser> => {
  const claims = decodeJwtPayload(token);
  const role = mapApiRole(claims.role);
  const fallbackName = splitName(claims.email);

  try {
    const user = claims.user_id ? await usersService.get(claims.user_id) : null;
    const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() || fallbackName;
    return {
      id: user?.id || claims.user_id || claims.email || "api-user",
      name,
      email: user?.email || claims.email,
      phone: user?.phone,
      memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Today",
      role,
      permissions: ROLE_PERMISSIONS[role],
      businessId: "api-business",
      businessName: "Printa Business",
    };
  } catch {
    return {
      id: claims.user_id || claims.email || "api-user",
      name: fallbackName,
      email: claims.email,
      memberSince: "Today",
      role,
      permissions: ROLE_PERMISSIONS[role],
      businessId: "api-business",
      businessName: "Printa Business",
    };
  }
};

export const apiAuthSessionService = {
  async login(email: string, password: string) {
    const session = await authService.login({ email, password });
    return buildAuthUserFromApiToken(session.token);
  },

  restore() {
    const session = authService.getSession();
    if (!session?.accessToken) return null;
    try {
      return buildAuthUserFromApiToken(session.accessToken);
    } catch {
      authService.logout();
      return null;
    }
  },

  logout() {
    authService.logout();
  },
};
