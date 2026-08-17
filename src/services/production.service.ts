import { api } from "@/lib/api";

export type ProductionJobStatus = "QUEUED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

export interface ProductionJobDto {
  id: string;
  order_id: string;
  store_id: string;
  assigned_to?: string;
  status: ProductionJobStatus;
  priority: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  due_at?: string;
  created_at: string;
  updated_at: string;
}

export const productionService = {
  listStoreJobs(storeId: string, status?: ProductionJobStatus) {
    return api.get<ProductionJobDto[]>(`/api/v1/production/stores/${storeId}/jobs`, { query: { status } });
  },

  getQueueDepth(storeId: string) {
    return api.get<{ active_jobs: number }>(`/api/v1/production/stores/${storeId}/queue-depth`);
  },

  updateStatus(jobId: string, status: ProductionJobStatus, notes?: string) {
    return api.patch<ProductionJobDto>(`/api/v1/production/jobs/${jobId}/status`, { status, notes });
  },
};
