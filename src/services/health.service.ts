import { api } from "@/lib/api";
import type { HealthResponseDto } from "./contracts";

export const healthService = {
  check() {
    return api.get<HealthResponseDto>("/healthz", { auth: false });
  },
};
