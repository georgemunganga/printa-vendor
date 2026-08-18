import { api } from "@/lib/api";
import type { OnboardVendorDto, VendorProfileDto } from "./contracts";

export const vendorService = {
  getProfile() {
    return api.get<VendorProfileDto>("/api/v1/vendor/profile");
  },

  onboard(payload: OnboardVendorDto) {
    return api.post<VendorProfileDto>("/api/v1/vendor/onboard", payload);
  },
};
