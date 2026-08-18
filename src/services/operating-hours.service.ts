import { api } from "@/lib/api";
import type { OperatingHourDto, ReplaceOperatingHoursDto } from "./contracts";

export const operatingHoursService = {
  list(storeId: string) {
    return api.get<OperatingHourDto[]>(`/api/v1/inventory/stores/${storeId}/operating-hours`);
  },

  replace(storeId: string, payload: ReplaceOperatingHoursDto) {
    return api.put<OperatingHourDto[]>(`/api/v1/inventory/stores/${storeId}/operating-hours`, payload);
  },
};
