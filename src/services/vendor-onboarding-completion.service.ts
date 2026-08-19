import { getOnboardingState } from "@/lib/vendorOnboardingState";
import { vendorService } from "@/services/vendor.service";
import type { VendorProfileDto } from "@/services/contracts";

const requireValue = (value: string, field: string) => {
  if (!value.trim()) {
    throw new Error(`${field} is required to create your first store.`);
  }
  return value.trim();
};

/**
 * Persists the complete onboarding draft after the vendor has an authenticated
 * Printa session. The API commits the vendor profile and first store together.
 */
export const completePendingVendorOnboarding = async (): Promise<VendorProfileDto> => {
  const state = getOnboardingState();
  const hasCoordinates = state.storeLat !== null || state.storeLng !== null;
  if (hasCoordinates && (state.storeLat === null || state.storeLng === null)) {
    throw new Error("Please select a complete store location on the map.");
  }

  return vendorService.onboard({
    business_name: requireValue(state.businessName, "Business name"),
    store_name: requireValue(state.storeName, "Store name"),
    store_address: requireValue(state.storeAddress, "Store address"),
    store_city: requireValue(state.storeCity, "Store city"),
    store_country: requireValue(state.storeCountry, "Store country"),
    ...(state.storeLat !== null && state.storeLng !== null
      ? {
          store_latitude: state.storeLat,
          store_longitude: state.storeLng,
        }
      : {}),
  });
};
