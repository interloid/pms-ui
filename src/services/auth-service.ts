import { API_BASE_URL, apiRequest } from "@/lib/api";

import type {
  LoginCredentials,
  LoginResponse,
  OAuthProvider,
  PasscodeRequestResponse,
  PasscodeVerifyResponse,
} from "@/types/auth";

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function loginWithProvider(provider: OAuthProvider): void {
  window.location.assign(`${API_BASE_URL}/api/v1/auth/${provider}`);
}

export function getCurrentSession(): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/v1/auth/session");
}

export async function logout(): Promise<void> {
  await apiRequest("/api/v1/auth/logout", {
    method: "POST",
  });
}

export function requestPasscode(
  email: string,
): Promise<PasscodeRequestResponse> {
  return apiRequest<PasscodeRequestResponse>("/api/v1/auth/passcode/request", {
    method: "POST",
    body: { email },
  });
}

export function verifyPasscode(
  email: string,
  passcode: string,
): Promise<PasscodeVerifyResponse> {
  return apiRequest<PasscodeVerifyResponse>("/api/v1/auth/passcode/verify", {
    method: "POST",
    body: {
      email,
      passcode,
    },
  });
}

export function loginWithPasscode(
  email: string,
  passcode: string,
): Promise<PasscodeVerifyResponse> {
  return verifyPasscode(email, passcode);
}
