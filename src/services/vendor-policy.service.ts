import { api } from "@/lib/api";

export interface VendorPolicyDto {
  id: string;
  slug: "vendor-terms" | "vendor-privacy-notice" | "vendor-acceptable-use";
  version: string;
  title: string;
  summary: string;
  status: "PUBLISHED";
  required_for_vendor: boolean;
  document_url?: string;
  effective_at?: string;
  published_at?: string;
}

export interface VendorPolicyConsentStatusDto {
  required_policies: VendorPolicyDto[];
  accepted_policy_slugs: string[];
  acceptance_required: boolean;
}

export const vendorPolicyService = {
  getStatus() {
    return api.get<VendorPolicyConsentStatusDto>("/api/v1/vendor/policies/status");
  },

  accept(policies: Array<{ slug: string; version: string }>) {
    return api.post<VendorPolicyConsentStatusDto>("/api/v1/vendor/policies/accept", { policies });
  },
};
