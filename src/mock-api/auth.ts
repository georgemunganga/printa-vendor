import type { AuthUser } from "@/context/auth-context";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

export interface MockAuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  issuedAt: number;
  lastRefreshedAt: number;
  user: AuthUser;
}

export type OtpMethod = "phone" | "email";
type OtpPurpose = "login" | "signup";

interface OtpChallenge {
  id: string;
  purpose: OtpPurpose;
  method: OtpMethod;
  value: string;
  code: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  userId?: string;
  signUpPayload?: {
    name: string;
    email?: string;
    phone?: string;
  };
}

interface SeedUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pin: string;
  role: AuthUser["role"];
  businessId: string;
  businessName: string;
  assignedStoreIds?: string[];
}

export interface MockDirectoryUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pin: string;
  role: AuthUser["role"];
  businessId: string;
  businessName: string;
  assignedStoreIds?: string[];
}

const SESSION_STORAGE_KEY = "printa_mock_auth_session_v1";
const OTP_STORAGE_KEY = "printa_mock_otp_challenges_v1";
const USERS_STORAGE_KEY = "printa_mock_auth_users_v1";
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;

const createToken = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, "");

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0] ?? "*"}*@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
};

const maskPhone = (phone: string) => {
  if (phone.length < 4) return phone;
  return `${"*".repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`;
};

const getStoredArray = <T,>(key: string): T[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setStoredArray = <T,>(key: string, value: T[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

const createAuthUserFromSeed = (seed: SeedUser): AuthUser => ({
  id: seed.id,
  name: seed.name,
  email: seed.email,
  phone: seed.phone,
  memberSince: "January 2024",
  role: seed.role,
  permissions: ROLE_PERMISSIONS[seed.role],
  businessId: seed.businessId,
  businessName: seed.businessName,
  assignedStoreIds: seed.assignedStoreIds,
});

const seedUsers: SeedUser[] = [
  {
    id: "user-google-test-001",
    name: "George Munganga",
    email: "georgemunganga@gmail.com",
    phone: "+260970000000",
    pin: "0000",
    role: "owner",
    businessId: "biz-001",
    businessName: "George Munganga Prints",
  },
  {
    id: "user-admin-001",
    name: "Admin User",
    email: "admin@printa.com",
    phone: "+260970000001",
    pin: "0001",
    role: "owner",
    businessId: "biz-001",
    businessName: "Printa HQ",
  },
  {
    id: "user-manager-001",
    name: "Manager User",
    email: "manager@printa.com",
    phone: "+260970000002",
    pin: "0002",
    role: "manager",
    businessId: "biz-001",
    businessName: "Printa HQ",
    assignedStoreIds: ["store-001", "store-002"],
  },
  {
    id: "user-staff-001",
    name: "Staff User One",
    email: "staff1@printa.com",
    phone: "+260970000003",
    pin: "0003",
    role: "staff",
    businessId: "biz-001",
    businessName: "Printa HQ",
    assignedStoreIds: ["store-001"],
  },
  {
    id: "user-staff-002",
    name: "Staff User Two",
    email: "staff2@printa.com",
    phone: "+260970000004",
    pin: "0004",
    role: "staff",
    businessId: "biz-001",
    businessName: "Printa HQ",
    assignedStoreIds: ["store-002"],
  },
];

const isValidSessionShape = (value: unknown): value is MockAuthSession => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<MockAuthSession>;
  return Boolean(
    candidate.accessToken &&
      candidate.refreshToken &&
      typeof candidate.accessTokenExpiresAt === "number" &&
      typeof candidate.refreshTokenExpiresAt === "number" &&
      candidate.user &&
      typeof candidate.user === "object"
  );
};

const ensureMockUsers = (): SeedUser[] => {
  const stored = getStoredArray<SeedUser>(USERS_STORAGE_KEY);
  if (stored.length === 0) {
    setStoredArray(USERS_STORAGE_KEY, seedUsers);
    return seedUsers;
  }

  // Backfill pin for any previously stored users and keep seeded test accounts updated.
  const normalizedStored = stored.map((user) => ({
    ...user,
    pin: user.pin && /^\d{4}$/.test(user.pin) ? user.pin : (user.phone?.replace(/\D/g, "").slice(-4) || "1234"),
  }));

  // Keep seeded test accounts updated while preserving users created via signup flow.
  const byId = new Map(normalizedStored.map((u) => [u.id, u]));
  for (const seed of seedUsers) {
    byId.set(seed.id, seed);
  }

  const merged = Array.from(byId.values());
  setStoredArray(USERS_STORAGE_KEY, merged);
  return merged;
};

const findUserByMethod = (method: OtpMethod, value: string): SeedUser | null => {
  const users = ensureMockUsers();
  if (method === "email") {
    const normalized = normalizeEmail(value);
    return users.find((u) => u.email && normalizeEmail(u.email) === normalized) ?? null;
  }
  const normalized = normalizePhone(value);
  return users.find((u) => u.phone && normalizePhone(u.phone) === normalized) ?? null;
};

const clearExpiredChallenges = () => {
  const now = Date.now();
  const current = getStoredArray<OtpChallenge>(OTP_STORAGE_KEY);
  const valid = current.filter((c) => c.expiresAt > now);
  setStoredArray(OTP_STORAGE_KEY, valid);
};

const saveChallenge = (challenge: OtpChallenge) => {
  clearExpiredChallenges();
  const challenges = getStoredArray<OtpChallenge>(OTP_STORAGE_KEY);
  setStoredArray(OTP_STORAGE_KEY, [challenge, ...challenges]);
};

const upsertChallenge = (challenge: OtpChallenge) => {
  clearExpiredChallenges();
  const challenges = getStoredArray<OtpChallenge>(OTP_STORAGE_KEY);
  const next = [challenge, ...challenges.filter((c) => c.id !== challenge.id)];
  setStoredArray(OTP_STORAGE_KEY, next);
};

const getChallenge = (id: string): OtpChallenge | null => {
  clearExpiredChallenges();
  return getStoredArray<OtpChallenge>(OTP_STORAGE_KEY).find((c) => c.id === id) ?? null;
};

const deleteChallenge = (id: string) => {
  const next = getStoredArray<OtpChallenge>(OTP_STORAGE_KEY).filter((c) => c.id !== id);
  setStoredArray(OTP_STORAGE_KEY, next);
};

const createChallenge = (
  purpose: OtpPurpose,
  method: OtpMethod,
  value: string,
  userId?: string,
  signUpPayload?: OtpChallenge["signUpPayload"]
) => {
  const challenge: OtpChallenge = {
    id: createToken("otp"),
    purpose,
    method,
    value,
    code: "123456",
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    maxAttempts: 5,
    userId,
    signUpPayload,
  };
  saveChallenge(challenge);
  return challenge;
};

const consumeChallenge = (
  challengeId: string,
  expectedPurpose: OtpPurpose,
  code: string
): OtpChallenge => {
  const challenge = getChallenge(challengeId);
  if (!challenge || challenge.purpose !== expectedPurpose) {
    throw new Error("Invalid or expired OTP challenge.");
  }
  if (Date.now() > challenge.expiresAt) {
    deleteChallenge(challengeId);
    throw new Error("OTP has expired. Request a new code.");
  }
  if (challenge.attempts >= challenge.maxAttempts) {
    deleteChallenge(challengeId);
    throw new Error("Too many failed attempts. Request a new code.");
  }
  if (challenge.code !== code) {
    const updated = { ...challenge, attempts: challenge.attempts + 1 };
    upsertChallenge(updated);
    throw new Error("Invalid OTP code.");
  }
  deleteChallenge(challengeId);
  return challenge;
};

export function persistMockSession(session: MockAuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearMockSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function createMockSession(user: AuthUser): MockAuthSession {
  const now = Date.now();
  const session: MockAuthSession = {
    accessToken: createToken("atk"),
    refreshToken: createToken("rtk"),
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_MS,
    refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL_MS,
    issuedAt: now,
    lastRefreshedAt: now,
    user,
  };
  persistMockSession(session);
  return session;
}

export function refreshMockSession(session: MockAuthSession): MockAuthSession | null {
  const now = Date.now();
  if (now >= session.refreshTokenExpiresAt) {
    clearMockSession();
    return null;
  }

  if (session.accessTokenExpiresAt - now > REFRESH_THRESHOLD_MS) {
    return session;
  }

  const refreshed: MockAuthSession = {
    ...session,
    accessToken: createToken("atk"),
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_MS,
    lastRefreshedAt: now,
  };
  persistMockSession(refreshed);
  return refreshed;
}

export function restoreMockSession(): MockAuthSession | null {
  ensureMockUsers();
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!isValidSessionShape(parsed)) {
      clearMockSession();
      return null;
    }
    return refreshMockSession(parsed);
  } catch {
    clearMockSession();
    return null;
  }
}

export function requestLoginOtp(method: OtpMethod, value: string): {
  challengeId: string;
  maskedTarget: string;
} {
  const user = findUserByMethod(method, value);
  if (!user) {
    throw new Error("No account found. Please sign up after onboarding.");
  }

  const normalized = method === "email" ? normalizeEmail(value) : normalizePhone(value);
  const challenge = createChallenge("login", method, normalized, user.id);
  return {
    challengeId: challenge.id,
    maskedTarget: method === "email" ? maskEmail(normalized) : maskPhone(normalized),
  };
}

export function resendLoginOtp(challengeId: string): { challengeId: string; maskedTarget: string } {
  const existing = getChallenge(challengeId);
  if (!existing || existing.purpose !== "login") {
    throw new Error("Session expired. Start login again.");
  }
  const challenge = createChallenge("login", existing.method, existing.value, existing.userId);
  return {
    challengeId: challenge.id,
    maskedTarget: challenge.method === "email" ? maskEmail(challenge.value) : maskPhone(challenge.value),
  };
}

export function verifyLoginOtp(challengeId: string, code: string): AuthUser {
  const challenge = consumeChallenge(challengeId, "login", code);
  if (!challenge.userId) {
    throw new Error("Login challenge is invalid.");
  }
  const user = ensureMockUsers().find((u) => u.id === challenge.userId);
  if (!user) throw new Error("User not found.");
  return createAuthUserFromSeed(user);
}

export function requestSignupOtp(params: {
  name: string;
  method: OtpMethod;
  value: string;
}): { challengeId: string; maskedTarget: string } {
  const { name, method, value } = params;
  const normalized = method === "email" ? normalizeEmail(value) : normalizePhone(value);
  const existing = findUserByMethod(method, normalized);
  if (existing) {
    throw new Error("Account already exists. Please login.");
  }
  const challenge = createChallenge("signup", method, normalized, undefined, {
    name,
    email: method === "email" ? normalized : undefined,
    phone: method === "phone" ? normalized : undefined,
  });
  return {
    challengeId: challenge.id,
    maskedTarget: method === "email" ? maskEmail(normalized) : maskPhone(normalized),
  };
}

export function resendSignupOtp(challengeId: string): { challengeId: string; maskedTarget: string } {
  const existing = getChallenge(challengeId);
  if (!existing || existing.purpose !== "signup" || !existing.signUpPayload) {
    throw new Error("Sign up session expired. Start again.");
  }
  const challenge = createChallenge(
    "signup",
    existing.method,
    existing.value,
    undefined,
    existing.signUpPayload
  );
  return {
    challengeId: challenge.id,
    maskedTarget: challenge.method === "email" ? maskEmail(challenge.value) : maskPhone(challenge.value),
  };
}

export function verifySignupOtp(challengeId: string, code: string): AuthUser {
  const challenge = consumeChallenge(challengeId, "signup", code);
  if (!challenge.signUpPayload) {
    throw new Error("Sign up challenge is invalid.");
  }

  const users = ensureMockUsers();
  const newSeed: SeedUser = {
    id: createToken("usr"),
    name: challenge.signUpPayload.name,
    email: challenge.signUpPayload.email,
    phone: challenge.signUpPayload.phone,
    pin: (challenge.signUpPayload.phone?.replace(/\D/g, "").slice(-4) || "1234"),
    role: "owner",
    businessId: "biz-001",
    businessName: `${challenge.signUpPayload.name}'s Print Business`,
  };
  setStoredArray(USERS_STORAGE_KEY, [...users, newSeed]);
  return createAuthUserFromSeed(newSeed);
}

export function listMockDirectoryUsers(businessId?: string): MockDirectoryUser[] {
  const users = ensureMockUsers();
  const scoped = businessId ? users.filter((u) => u.businessId === businessId) : users;
  return scoped.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    pin: user.pin,
    role: user.role,
    businessId: user.businessId,
    businessName: user.businessName,
    assignedStoreIds: user.assignedStoreIds,
  }));
}
