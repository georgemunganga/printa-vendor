export interface SecurityPreferencesDto {
  auto_session_timeout_enabled: boolean;
  auto_session_timeout_minutes: number;
}

export const SESSION_TIMEOUT_OPTIONS = [15, 30, 60, 120] as const;

export const defaultSecurityPreferences: SecurityPreferencesDto = {
  auto_session_timeout_enabled: false,
  auto_session_timeout_minutes: 30,
};

const storageKey = (userId: string) => `printa_security_preferences_v1:${userId}`;

export const securityPreferencesService = {
  get(userId: string): SecurityPreferencesDto {
    if (typeof window === "undefined") return defaultSecurityPreferences;
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return defaultSecurityPreferences;
    try {
      const parsed = JSON.parse(raw) as Partial<SecurityPreferencesDto>;
      const minutes = SESSION_TIMEOUT_OPTIONS.includes(parsed.auto_session_timeout_minutes as typeof SESSION_TIMEOUT_OPTIONS[number])
        ? parsed.auto_session_timeout_minutes
        : defaultSecurityPreferences.auto_session_timeout_minutes;
      return {
        ...defaultSecurityPreferences,
        ...parsed,
        auto_session_timeout_minutes: minutes,
      };
    } catch {
      localStorage.removeItem(storageKey(userId));
      return defaultSecurityPreferences;
    }
  },

  save(userId: string, preferences: SecurityPreferencesDto): SecurityPreferencesDto {
    const minutes = SESSION_TIMEOUT_OPTIONS.includes(preferences.auto_session_timeout_minutes as typeof SESSION_TIMEOUT_OPTIONS[number])
      ? preferences.auto_session_timeout_minutes
      : defaultSecurityPreferences.auto_session_timeout_minutes;
    const saved = { ...preferences, auto_session_timeout_minutes: minutes };
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey(userId), JSON.stringify(saved));
      window.dispatchEvent(new CustomEvent("printa-security-preferences-updated", { detail: { userId } }));
    }
    return saved;
  },
};
