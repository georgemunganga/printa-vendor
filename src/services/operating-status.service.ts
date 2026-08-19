import { api } from "@/lib/api";

export type VendorOperatingBlockReason =
  | "COMPLIANCE_APPROVAL_REQUIRED"
  | "COMPLIANCE_APPROVAL_REJECTED"
  | "SUBSCRIPTION_PAYMENT_DUE"
  | "SUBSCRIPTION_REQUIRED"
  | "SUBSCRIPTION_INACTIVE";

export interface VendorOperatingStatusDto {
  vendor_id: string;
  operational: boolean;
  blocking_reasons: VendorOperatingBlockReason[];
  compliance: {
    status: "PENDING" | "APPROVED" | "REJECTED";
    submitted_at?: string;
    reviewed_at?: string;
    decision_reason?: string;
  };
  subscription?: {
    id: string;
    status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED";
    current_period_end: string;
    trial_ends_at?: string;
  };
  grace_period?: {
    id: string;
    status: "ACTIVE" | "EXPIRED" | "REVOKED";
    ends_at: string;
  };
  grace_eligible: boolean;
  payment: {
    available: boolean;
    url?: string;
    message: string;
  };
}

export interface VendorGraceRequestResultDto {
  status: VendorOperatingStatusDto;
  granted: boolean;
}

export const operatingStatusService = {
  get() {
    return api.get<VendorOperatingStatusDto>("/api/v1/vendor/operating-status/");
  },

  requestGrace() {
    return api.post<VendorGraceRequestResultDto>("/api/v1/vendor/operating-status/grace-request");
  },
};
