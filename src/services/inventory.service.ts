import { api } from "@/lib/api";
import type {
  CreateStoreDto,
  StoreDto,
  StoreStaffDto,
  UpdateStoreDto,
  VendorStoreProductDto,
  DeliveryZoneDto,
  DeliveryZoneInputDto,
} from "./contracts";

export const inventoryService = {
  listStores(vendorId?: string) {
    return api.get<StoreDto[]>("/api/v1/inventory/stores", {
      query: { vendor_id: vendorId },
    });
  },

  getStore(id: string) {
    return api.get<StoreDto>(`/api/v1/inventory/stores/${id}`);
  },

  createStore(payload: CreateStoreDto) {
    return api.post<StoreDto>("/api/v1/inventory/stores", payload);
  },

  updateStore(storeId: string, payload: UpdateStoreDto) {
    return api.put<StoreDto>(`/api/v1/inventory/stores/${storeId}`, payload);
  },

  deleteStore(storeId: string) {
    return api.delete(`/api/v1/inventory/stores/${storeId}`);
  },

  listDeliveryZones(storeId: string) {
    return api.get<DeliveryZoneDto[]>(`/api/v1/delivery/stores/${storeId}/zones`);
  },

  createDeliveryZone(storeId: string, payload: DeliveryZoneInputDto) {
    return api.post<DeliveryZoneDto>(`/api/v1/delivery/stores/${storeId}/zones`, payload);
  },

  updateDeliveryZone(storeId: string, zoneId: string, payload: DeliveryZoneInputDto) {
    return api.patch<DeliveryZoneDto>(`/api/v1/delivery/stores/${storeId}/zones/${zoneId}`, payload);
  },

  deleteDeliveryZone(storeId: string, zoneId: string) {
    return api.delete(`/api/v1/delivery/stores/${storeId}/zones/${zoneId}`);
  },

  listStaff(storeId: string) {
    return api.get<StoreStaffDto[]>(`/api/v1/inventory/stores/${storeId}/staff`);
  },

  addStaff(storeId: string, payload: { user_id: string; role: string }) {
    return api.post<StoreStaffDto>(`/api/v1/inventory/stores/${storeId}/staff`, payload);
  },

  addStaffByEmail(storeId: string, payload: { email: string; role: "STAFF" | "MANAGER" | "CASHIER" }) {
    return api.post<StoreStaffDto>(`/api/v1/inventory/stores/${storeId}/staff/by-email`, payload);
  },

  removeStaff(storeId: string, userId: string) {
    return api.delete(`/api/v1/inventory/stores/${storeId}/staff/${userId}`);
  },

  updateStaffRole(storeId: string, userId: string, role: "STAFF" | "MANAGER" | "CASHIER") {
    return api.patch<{ status: string }>(`/api/v1/inventory/stores/${storeId}/staff/${userId}/role`, { role });
  },

  listProducts(storeId: string) {
    return api.get<VendorStoreProductDto[]>(`/api/v1/inventory/stores/${storeId}/products`);
  },

  addProduct(storeId: string, payload: {
    platform_product_id: string;
    vendor_price: number;
    currency: string;
    stock_quantity?: number;
  }) {
    return api.post<VendorStoreProductDto>(`/api/v1/inventory/stores/${storeId}/products`, payload);
  },

  updateStock(productId: string, quantity: number) {
    return api.patch<unknown>(`/api/v1/inventory/products/${productId}/stock`, {
      quantity,
    });
  },

  updateVendorPrice(productId: string, price: number) {
    return api.patch<{ status: string }>(`/api/v1/inventory/products/${productId}/price`, { price });
  },

  setAvailability(productId: string, available: boolean) {
    return api.patch<unknown>(`/api/v1/inventory/products/${productId}/availability`, {
      available,
    });
  },
};
