import { api } from "@/lib/api";
import type { VendorProfileDto } from "./contracts";

export const vendorService = {
  getProfile() {
    return api.get<VendorProfileDto>("/api/v1/vendor/profile");
  },
};
