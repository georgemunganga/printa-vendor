import { api } from "@/lib/api";
import { apiSessionStore } from "@/lib/api/session";
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

  logout() {
    apiSessionStore.clear();
  },

  getSession() {
    return apiSessionStore.get();
  },
};
