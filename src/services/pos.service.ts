import { api } from "@/lib/api";

export interface POSTransactionDto {
  id: string;
  order_id: string;
  store_id: string;
  amount: number;
  currency: string;
  payment_method: "CASH" | "CARD" | "MOBILE_MONEY" | "VOUCHER";
  status: "PENDING" | "COMPLETED" | "REFUNDED" | "FAILED";
  reference?: string;
  created_at: string;
}

export const posService = {
  recordPayment(payload: {
    order_id: string;
    store_id: string;
    amount: number;
    payment_method: "CASH" | "CARD" | "MOBILE_MONEY" | "VOUCHER";
    reference?: string;
    notes?: string;
  }) {
    return api.post<POSTransactionDto>("/api/v1/pos/transactions", payload);
  },
};
