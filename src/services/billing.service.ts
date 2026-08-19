import { api } from "@/lib/api";

export interface SubscriptionDto {
  id: string;
  vendor_id: string;
  tier_id: string;
  tier_name?: string;
  tier_price?: number;
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED";
  billing_cycle: "MONTHLY" | "ANNUAL";
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
}

export interface SubscriptionTierDto {
  id: string;
  name: string;
  monthly_price: number;
  description: string;
  display_order: number;
  is_available: boolean;
  is_popular: boolean;
  features: Array<{
    text: string;
    included: boolean;
  }>;
}

export interface BillingInvoiceDto {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";
  due_date: string;
  paid_at?: string;
  created_at: string;
}

export const billingService = {
  listTiers() {
    return api.get<SubscriptionTierDto[]>("/api/v1/billing/tiers");
  },

  getSubscription(vendorId: string) {
    return api.get<SubscriptionDto>(`/api/v1/billing/subscriptions/vendor/${vendorId}`);
  },

  listInvoices(vendorId: string) {
    return api.get<BillingInvoiceDto[]>(`/api/v1/billing/invoices/vendor/${vendorId}`);
  },
};
