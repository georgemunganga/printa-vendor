import { api } from "@/lib/api";
import type { DeliveryLogDto, DeliveryLogListResponseDto, SendCommsRequestDto, SendCommsResultDto } from "./contracts";

export const commsService = {
  send(payload: SendCommsRequestDto, idempotencyKey?: string) {
    return api.post<SendCommsResultDto>("/api/v1/comms/send", payload, { idempotencyKey });
  },

  listLogs(params?: { channel?: string; recipient_id?: string; status?: string; limit?: number; offset?: number }) {
    return api.get<DeliveryLogListResponseDto>("/api/v1/comms/logs", { query: params });
  },

  getLog(id: string) {
    return api.get<DeliveryLogDto>(`/api/v1/comms/logs/${id}`);
  },
};
