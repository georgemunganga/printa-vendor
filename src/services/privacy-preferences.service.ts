import { api } from "@/lib/api";

export interface PrivacyPreferencesDto {
  usage_analytics: boolean;
  partner_sharing: boolean;
  location_services: boolean;
  public_store_profile: boolean;
}

export const defaultPrivacyPreferences: PrivacyPreferencesDto = {
  usage_analytics: true,
  partner_sharing: false,
  location_services: true,
  public_store_profile: true,
};

const storageKey = (userId: string, storeId: string) => `printa_privacy_preferences_v1:${userId}:${storeId}`;

const readLocal = (userId: string, storeId: string): PrivacyPreferencesDto => {
  if (typeof window === "undefined") return defaultPrivacyPreferences;
  const raw = localStorage.getItem(storageKey(userId, storeId));
  if (!raw) return defaultPrivacyPreferences;
  try {
    return { ...defaultPrivacyPreferences, ...(JSON.parse(raw) as Partial<PrivacyPreferencesDto>) };
  } catch {
    localStorage.removeItem(storageKey(userId, storeId));
    return defaultPrivacyPreferences;
  }
};

const writeLocal = (userId: string, storeId: string, preferences: PrivacyPreferencesDto) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId, storeId), JSON.stringify(preferences));
};

export const privacyPreferencesService = {
  async get(userId: string, storeId: string): Promise<PrivacyPreferencesDto> {
    try {
      const remote = await api.get<PrivacyPreferencesDto>("/api/v1/vendor/privacy-preferences", { query: { store_id: storeId } });
      const preferences = { ...defaultPrivacyPreferences, ...remote };
      writeLocal(userId, storeId, preferences);
      return preferences;
    } catch {
      return readLocal(userId, storeId);
    }
  },

  async save(userId: string, storeId: string, preferences: PrivacyPreferencesDto): Promise<PrivacyPreferencesDto> {
    writeLocal(userId, storeId, preferences);
    try {
      const remote = await api.put<PrivacyPreferencesDto>("/api/v1/vendor/privacy-preferences", preferences, { query: { store_id: storeId } });
      const saved = { ...defaultPrivacyPreferences, ...remote };
      writeLocal(userId, storeId, saved);
      return saved;
    } catch {
      return preferences;
    }
  },
};
