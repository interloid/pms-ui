import type { OAuthProvider } from "@/types/auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const OAuthCallbackEndpoints: Record<OAuthProvider, string> = {
  google: "/api/v1/auth/google/callback",
  github: "/api/v1/auth/github/callback",
  microsoft: "/api/v1/auth/microsoft/callback",
};

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}
