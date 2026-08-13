import { API_BASE_URL } from "@/lib/api";
import type { LoginRequest, LoginResponse, OAuthProvider } from "@/types/auth";
import { OAuthCallbackEndpoints } from "@/lib/api";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Invalid username or password");
  }

  return data;
}

export async function loginWithPasscode(
  passcode: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/passcode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      passcode,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Invalid passcode");
  }

  return data;
}

export function loginWithProvider(provider: OAuthProvider) {
  window.location.assign(`${API_BASE_URL}/api/v1/auth/${provider}`);
}

export function isOAuthProvider(value: string | null): value is OAuthProvider {
  return value === "google" || value === "github" || value === "microsoft";
}

export async function handleOAuthCallback(
  provider: OAuthProvider,
  code: string,
) {
  const endpoint = OAuthCallbackEndpoints[provider];
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      code,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? `${provider} authentication failed`);
  }

  return data;
}
