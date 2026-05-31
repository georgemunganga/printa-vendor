import { api } from "@/lib/api";
import type { CreatePlatformProductDto, PlatformProductDto } from "./contracts";

export const catalogService = {
  listProducts(params?: { category?: string; active?: boolean }) {
    return api.get<PlatformProductDto[]>("/api/v1/catalog/products", { query: params });
  },

  getProduct(id: string) {
    return api.get<PlatformProductDto>(`/api/v1/catalog/products/${id}`);
  },

  createProduct(payload: CreatePlatformProductDto) {
    return api.post<PlatformProductDto>("/api/v1/catalog/products", payload);
  },

  updateProduct(id: string, payload: Partial<CreatePlatformProductDto>) {
    return api.put<PlatformProductDto>(`/api/v1/catalog/products/${id}`, payload);
  },
};
