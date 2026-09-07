import { api } from "@/lib/api";

export interface NotificationPreferencesDto {
  email_notifications: boolean;
  sms_notifications: boolean;
  order_updates: boolean;
  payment_updates: boolean;
  stock_alerts: boolean;
  promotions: boolean;
}

export const defaultNotificationPreferences: NotificationPreferencesDto = {
  email_notifications: true,
  sms_notifications: false,
  order_updates: true,
  payment_updates: true,
  stock_alerts: true,
  promotions: false,
};

const storageKey = (userId: string, storeId: string) => `printa_notification_preferences_v1:${userId}:${storeId}`;

const readLocal = (userId: string, storeId: string): NotificationPreferencesDto => {
  if (typeof window === "undefined") return defaultNotificationPreferences;
  const raw = localStorage.getItem(storageKey(userId, storeId));
  if (!raw) return defaultNotificationPreferences;
  try {
    return { ...defaultNotificationPreferences, ...(JSON.parse(raw) as Partial<NotificationPreferencesDto>) };
  } catch {
    localStorage.removeItem(storageKey(userId, storeId));
    return defaultNotificationPreferences;
  }
};

const writeLocal = (userId: string, storeId: string, preferences: NotificationPreferencesDto) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId, storeId), JSON.stringify(preferences));
};

export const notificationPreferencesService = {
  async get(userId: string, storeId: string): Promise<NotificationPreferencesDto> {
    try {
      const remote = await api.get<NotificationPreferencesDto>("/api/v1/notifications/preferences", { query: { store_id: storeId } });
      const preferences = { ...defaultNotificationPreferences, ...remote };
      writeLocal(userId, storeId, preferences);
      return preferences;
    } catch {
      return readLocal(userId, storeId);
    }
  },

  async save(userId: string, storeId: string, preferences: NotificationPreferencesDto): Promise<NotificationPreferencesDto> {
    writeLocal(userId, storeId, preferences);
    try {
      const remote = await api.put<NotificationPreferencesDto>("/api/v1/notifications/preferences", preferences, { query: { store_id: storeId } });
      const saved = { ...defaultNotificationPreferences, ...remote };
      writeLocal(userId, storeId, saved);
      return saved;
    } catch {
      return preferences;
    }
  },
};
