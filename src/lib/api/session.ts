export interface ApiSession {
  accessToken: string;
  tokenType: string;
}

const SESSION_KEY = "printa_api_session_v1";

export const apiSessionStore = {
  get(): ApiSession | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as ApiSession;
      if (!parsed.accessToken) return null;
      return {
        accessToken: parsed.accessToken,
        tokenType: parsed.tokenType || "Bearer",
      };
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  set(session: ApiSession) {
    if (typeof window === "undefined") return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
  },

  authHeader(): string | undefined {
    const session = this.get();
    if (!session) return undefined;
    return `${session.tokenType || "Bearer"} ${session.accessToken}`;
  },
};
