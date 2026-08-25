import type { OAuthProvider } from "@/types/auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const OAuthCallbackEndpoints: Record<OAuthProvider, string> = {
  google: "/api/v1/auth/google/callback",
  github: "/api/v1/auth/github/callback",
  microsoft: "/api/v1/auth/microsoft/callback",
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    credentials: "include",
    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });
  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        `Request failed with status ${response.status}`,
    );
  }
  return data as T;
}
