import { api } from "@/lib/api";
import type { OrderDto, OrderStatusDto, PlaceOrderRequestDto } from "./contracts";

export const ordersService = {
  place(payload: PlaceOrderRequestDto, idempotencyKey?: string) {
    return api.post<OrderDto>("/api/v1/orders", payload, { idempotencyKey });
  },

  get(id: string) {
    return api.get<OrderDto>(`/api/v1/orders/${id}`);
  },

  getByNumber(orderNumber: string) {
    return api.get<OrderDto>(`/api/v1/orders/number/${orderNumber}`);
  },

  listByStore(storeId: string, status?: OrderStatusDto) {
    return api.get<OrderDto[]>(`/api/v1/orders/store/${storeId}`, { query: { status } });
  },

  listByCustomer(customerId: string) {
    return api.get<OrderDto[]>(`/api/v1/orders/customer/${customerId}`);
  },

  updateStatus(id: string, status: OrderStatusDto) {
    return api.patch<OrderDto>(`/api/v1/orders/${id}/status`, { status });
  },

  cancel(id: string) {
    return api.delete(`/api/v1/orders/${id}`);
  },
};
