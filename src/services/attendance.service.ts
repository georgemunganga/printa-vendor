import { api } from "@/lib/api";
import type { UUID } from "./contracts";

export type AttendanceEventType = "CLOCK_IN" | "CLOCK_OUT";

export interface AttendanceEventDto {
  id: UUID;
  store_id: UUID;
  user_id: UUID;
  event_type: AttendanceEventType;
  occurred_at: string;
  created_by?: UUID;
  created_at: string;
}

export interface ClockResponseDto {
  event: AttendanceEventDto;
  next_action: AttendanceEventType;
}

export const attendanceService = {
  setStaffPIN(storeId: string, userId: string, pin: string) {
    return api.put<void>(`/api/v1/attendance/stores/${storeId}/staff/${userId}/pin`, { pin });
  },

  clock(storeId: string, userId: string, pin: string) {
    return api.post<ClockResponseDto>(`/api/v1/attendance/stores/${storeId}/clock`, {
      user_id: userId,
      pin,
    });
  },

  listRecent(storeId: string) {
    return api.get<AttendanceEventDto[]>(`/api/v1/attendance/stores/${storeId}/events`);
  },
};
