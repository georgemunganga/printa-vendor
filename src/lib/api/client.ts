import { apiUrl } from "@/config/env";
import { ApiError } from "./errors";
import { apiSessionStore } from "./session";

export type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  query?: Record<string, QueryValue>;
  body?: unknown;
  idempotencyKey?: string;
}

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const url = new URL(apiUrl(path));
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

const parseBody = async (response: Response) => {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
};

const getErrorMessage = (body: unknown, statusText: string) => {
  if (body && typeof body === "object" && "error" in body) {
    const value = (body as { error?: unknown }).error;
    if (typeof value === "string" && value.trim()) return value;
  }
  if (typeof body === "string" && body.trim()) return body;
  return statusText || "Request failed";
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = true, query, body, headers, idempotencyKey, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (auth) {
    const authorization = apiSessionStore.authHeader();
    if (authorization) requestHeaders.set("Authorization", authorization);
  }

  if (idempotencyKey) {
    requestHeaders.set("Idempotency-Key", idempotencyKey);
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: requestHeaders,
    body: requestBody,
  });

  const responseBody = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(getErrorMessage(responseBody, response.statusText), response.status, responseBody);
  }

  return responseBody as T;
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T = void>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
