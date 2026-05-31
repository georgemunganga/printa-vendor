import { api } from "@/lib/api";
import { apiSessionStore } from "@/lib/api/session";
import type { LoginRequestDto, LoginResponseDto, RegisterUserRequestDto, UserDto } from "./contracts";

export const authService = {
  async login(payload: LoginRequestDto) {
    const session = await api.post<LoginResponseDto>("/api/v1/auth/login", payload, { auth: false });
    apiSessionStore.set({
      accessToken: session.token,
      tokenType: session.token_type || "Bearer",
    });
    return session;
  },

  async register(payload: RegisterUserRequestDto) {
    return api.post<UserDto>("/api/v1/users/register", payload, { auth: false });
  },

  logout() {
    apiSessionStore.clear();
  },

  getSession() {
    return apiSessionStore.get();
  },
};
