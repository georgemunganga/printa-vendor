export interface DayHours {
  enabled: boolean;
  open: string;
  close: string;
}

export type WeekSchedule = Record<string, DayHours>;

export interface VendorOnboardingState {
  step: number;

  // Step 1: Business name
  businessName: string;

  // Step 2: First store
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storeCountry: string;
  storeLat: number | null;
  storeLng: number | null;

  // Step 3: Store hours (per-day)
  storeHours: WeekSchedule;

  // Legacy compat (derived from storeHours)
  openTime: string;
  closeTime: string;
  workDays: string[];

  // Step 4: What do you print?
  products: string[];

  // Step 5: How do you get paid?
  paymentMethod: "bank" | "mobile_money" | "";
  paymentDetail: string; // account number or phone number
  dataConsentAccepted: boolean;
  platformTermsAccepted: boolean;
  privacyNoticeRead: boolean;
  vendorTermsRead: boolean;

  lastUpdatedAt: string | null;
}

const DEFAULT_HOURS: WeekSchedule = {
  Mon: { enabled: true, open: "08:00", close: "17:00" },
  Tue: { enabled: true, open: "08:00", close: "17:00" },
  Wed: { enabled: true, open: "08:00", close: "17:00" },
  Thu: { enabled: true, open: "08:00", close: "17:00" },
  Fri: { enabled: true, open: "08:00", close: "17:00" },
  Sat: { enabled: false, open: "09:00", close: "13:00" },
  Sun: { enabled: false, open: "09:00", close: "13:00" },
};

const STORAGE_KEY = "vendor_onboarding_v4";
const COMPLETED_KEY = "vendor_onboarding_completed_v1";

const defaultState: VendorOnboardingState = {
  step: 0,
  businessName: "",
  storeName: "",
  storeAddress: "",
  storeCity: "",
  storeCountry: "",
  storeLat: null,
  storeLng: null,
  storeHours: DEFAULT_HOURS,
  openTime: "08:00",
  closeTime: "17:00",
  workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  products: [],
  paymentMethod: "",
  paymentDetail: "",
  dataConsentAccepted: false,
  platformTermsAccepted: false,
  privacyNoticeRead: false,
  vendorTermsRead: false,
  lastUpdatedAt: null,
};

/** Derive legacy fields from storeHours for backward compat */
const deriveLegacy = (hours: WeekSchedule) => {
  const enabledDays = Object.entries(hours)
    .filter(([, h]) => h.enabled)
    .map(([day]) => day);
  const firstEnabled = enabledDays.length > 0 ? hours[enabledDays[0]] : null;
  return {
    workDays: enabledDays,
    openTime: firstEnabled?.open ?? "08:00",
    closeTime: firstEnabled?.close ?? "17:00",
  };
};

export const getOnboardingState = (): VendorOnboardingState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    // Migrate from old format without storeHours
    if (!parsed.storeHours && parsed.workDays) {
      const migrated: WeekSchedule = { ...DEFAULT_HOURS };
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      for (const day of days) {
        migrated[day] = {
          enabled: (parsed.workDays as string[]).includes(day),
          open: parsed.openTime ?? "08:00",
          close: parsed.closeTime ?? "17:00",
        };
      }
      parsed.storeHours = migrated;
    }
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
};

export const saveOnboardingState = (state: VendorOnboardingState) => {
  // Keep legacy fields in sync
  const legacy = deriveLegacy(state.storeHours);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      ...legacy,
      lastUpdatedAt: new Date().toISOString(),
    }),
  );
};

export const clearOnboardingState = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const markOnboardingComplete = () => {
  localStorage.setItem(COMPLETED_KEY, "1");
};

export const clearOnboardingComplete = () => {
  localStorage.removeItem(COMPLETED_KEY);
};

export const isOnboardingComplete = (): boolean => {
  return localStorage.getItem(COMPLETED_KEY) === "1";
};

// Backward-compatible aliases for legacy consumers (PrintFlow, Checkout, Upload, Customize)
export const getVendorOnboardingState = getOnboardingState;
export const patchVendorOnboardingState = (patch: Partial<VendorOnboardingState>) => {
  const prev = getOnboardingState();
  const next = { ...prev, ...patch };
  saveOnboardingState(next);
  return next;
};
export const clearVendorOnboardingState = clearOnboardingState;
