import { API_BASE_URL } from "@/lib/api";

import type {
  LoginRequest,
  LoginResponse,
  OAuthProvider,
} from "@/types/auth";

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    },
  );

  return parseResponse<LoginResponse>(response);
}

export async function loginWithPasscode(
  passcode: string,
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/login/passcode`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ passcode }),
    },
  );

  return parseResponse<LoginResponse>(response);
}

export function loginWithProvider(
  provider: OAuthProvider,
): void {
  window.location.assign(
    `${API_BASE_URL}/api/v1/auth/${provider}`,
  );
}

export async function getCurrentSession(): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/session`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  return parseResponse<LoginResponse>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  await parseResponse(response);
}