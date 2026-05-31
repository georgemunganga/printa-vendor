import { api } from "@/lib/api";
import type {
  CreateNotificationDto,
  NotificationDto,
  NotificationListResponseDto,
  UnreadCountDto,
} from "./contracts";

export const notificationsService = {
  list(params?: { status?: string; type?: string; limit?: number; offset?: number }) {
    return api.get<NotificationListResponseDto>("/api/v1/notifications/", { query: params });
  },

  unreadCount() {
    return api.get<UnreadCountDto>("/api/v1/notifications/unread-count");
  },

  get(id: string) {
    return api.get<NotificationDto>(`/api/v1/notifications/${id}`);
  },

  markRead(id: string) {
    return api.post<{ status: string }>(`/api/v1/notifications/${id}/read`);
  },

  markAllRead() {
    return api.post<{ status: string }>("/api/v1/notifications/mark-all-read");
  },

  dismiss(id: string) {
    return api.post<{ status: string }>(`/api/v1/notifications/${id}/dismiss`);
  },

  delete(id: string) {
    return api.delete(`/api/v1/notifications/${id}`);
  },

  create(payload: CreateNotificationDto) {
    return api.post<NotificationDto>("/api/v1/notifications/", payload);
  },

  bulkCreate(payload: Omit<CreateNotificationDto, "recipient_id"> & { recipient_ids: string[] }) {
    return api.post<{ status: string }>("/api/v1/notifications/bulk", payload);
  },
};
