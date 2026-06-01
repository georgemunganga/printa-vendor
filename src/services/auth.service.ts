import { api } from "@/lib/api";
import { apiSessionStore } from "@/lib/api/session";
import { apiUrl } from "@/config/env";
import type {
  LoginRequestDto,
  LoginResponseDto,
  OtpChallengeResponseDto,
  OtpRequestDto,
  OtpVerifyRequestDto,
  OtpVerifyResponseDto,
  RegisterUserRequestDto,
  UserDto,
} from "./contracts";

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

  async requestOtp(payload: OtpRequestDto) {
    return api.post<OtpChallengeResponseDto>("/api/v1/auth/otp/request", payload, { auth: false });
  },

  async verifyOtp(payload: OtpVerifyRequestDto) {
    const session = await api.post<OtpVerifyResponseDto>("/api/v1/auth/otp/verify", payload, { auth: false });
    apiSessionStore.set({
      accessToken: session.token,
      tokenType: session.token_type || "Bearer",
    });
    return session;
  },

  googleOAuthStartUrl(redirectUri = `${window.location.origin}/auth/google/callback`) {
    const url = new URL(apiUrl("/api/v1/auth/google/start"));
    url.searchParams.set("redirect_uri", redirectUri);
    return url.toString();
  },

  logout() {
    apiSessionStore.clear();
  },

  getSession() {
    return apiSessionStore.get();
  },

  setSession(token: string, tokenType = "Bearer") {
    apiSessionStore.set({
      accessToken: token,
      tokenType,
    });
  },
};
