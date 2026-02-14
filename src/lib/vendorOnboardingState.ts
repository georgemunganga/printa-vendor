export interface VendorOnboardingState {
  businessProfileDone: boolean;
  servicesDone: boolean;
  pricingDone: boolean;
  fulfillmentDone: boolean;
  teamSecurityDone: boolean;
  filesUploaded: number;
  specsCompleted: boolean;
  testOrderCompleted: boolean;
  lastUpdatedAt: string | null;
}

const STORAGE_KEY = "vendor_onboarding_state_v1";

const defaultState: VendorOnboardingState = {
  businessProfileDone: false,
  servicesDone: false,
  pricingDone: false,
  fulfillmentDone: false,
  teamSecurityDone: false,
  filesUploaded: 0,
  specsCompleted: false,
  testOrderCompleted: false,
  lastUpdatedAt: null,
};

export const getVendorOnboardingState = (): VendorOnboardingState => {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<VendorOnboardingState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
};

export const patchVendorOnboardingState = (
  patch: Partial<VendorOnboardingState>,
): VendorOnboardingState => {
  const prev = getVendorOnboardingState();
  const next: VendorOnboardingState = {
    ...prev,
    ...patch,
    lastUpdatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
};

export const clearVendorOnboardingState = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};
