import { api } from "@/lib/api";
import type { UserDto } from "./contracts";

export interface UserListResponse {
  total: number;
  users: UserDto[];
}

export const usersService = {
  list() {
    return api.get<UserListResponse>("/api/v1/users");
  },

  get(id: string) {
    return api.get<UserDto>(`/api/v1/users/${id}`);
  },

  updateMyProfile(payload: { first_name: string; last_name: string; phone?: string }) {
    return api.patch<UserDto>("/api/v1/users/me", payload);
  },
};
