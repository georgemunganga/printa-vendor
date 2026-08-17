import { api } from "@/lib/api";
import type { CreateStoreDto, StoreDto, StoreStaffDto, VendorStoreProductDto } from "./contracts";

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

  listStaff(storeId: string) {
    return api.get<StoreStaffDto[]>(`/api/v1/inventory/stores/${storeId}/staff`);
  },

  addStaff(storeId: string, payload: { user_id: string; role: string }) {
    return api.post<StoreStaffDto>(`/api/v1/inventory/stores/${storeId}/staff`, payload);
  },

  removeStaff(storeId: string, userId: string) {
    return api.delete(`/api/v1/inventory/stores/${storeId}/staff/${userId}`);
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

  setAvailability(productId: string, available: boolean) {
    return api.patch<unknown>(`/api/v1/inventory/products/${productId}/availability`, {
      available,
    });
  },
};
