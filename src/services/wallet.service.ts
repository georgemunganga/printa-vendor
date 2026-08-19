import { api } from "@/lib/api";

export interface WalletAccountDto {
  id: string;
  vendor_id: string;
  currency: string;
  state: "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  created_at: string;
  updated_at: string;
  activated_at?: string;
}

export interface WalletBalanceDto {
  wallet_account_id: string;
  currency: string;
  available_minor: number;
  pending_minor: number;
  held_minor: number;
  calculated_at: string;
}

export interface WalletLedgerEntryDto {
  id: string;
  journal_id: string;
  wallet_account_id?: string;
  vendor_id?: string;
  entry_type: string;
  ledger_account: string;
  amount_minor: number;
  currency: string;
  created_at: string;
}

export interface WalletWithdrawalRequestDto {
  id: string;
  wallet_account_id: string;
  vendor_id: string;
  amount_minor: number;
  currency: string;
  status: "PENDING_REVIEW" | "APPROVED" | "SUBMITTED" | "PAID" | "FAILED" | "CANCELLED" | "REJECTED";
  requested_at: string;
  reviewed_at?: string;
  completed_at?: string;
  failure_reason?: string;
}

export interface WalletOverviewDto {
  account?: WalletAccountDto;
  balance?: WalletBalanceDto;
  entries: WalletLedgerEntryDto[];
  withdrawals: WalletWithdrawalRequestDto[];
}

export const walletService = {
  getOverview() {
    return api.get<WalletOverviewDto>("/api/v1/vendor/wallet");
  },
};
