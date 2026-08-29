import { API_BASE_URL, apiRequest } from "@/lib/api";

import type {
  ApiErrorResponse,
  AuthError,
  LoginCredentials,
  LoginResponse,
  OAuthProvider,
  PasscodeRequestResponse,
  PasscodeVerifyResponse,
} from "@/types/auth";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw {
        code: "INVALID_CREDENTIALS",
      } satisfies AuthError;
    }

    if (response.status >= 500) {
      throw {
        code: "SERVER_ERROR",
      } satisfies AuthError;
    }

    throw {
      code: "UNKNOWN_ERROR",
    } satisfies AuthError;
  }

  return data;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });
    return await parseResponse<LoginResponse>(response);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw {
        code: "NETWORK_ERROR",
      } satisfies AuthError;
    }
    throw {
      code: "UNKNOWN_ERROR",
    } satisfies AuthError;
  }
}

export function loginWithProvider(provider: OAuthProvider): void {
  window.location.assign(`${API_BASE_URL}/api/v1/auth/${provider}`);
}

export async function getCurrentSession(): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/session`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<LoginResponse>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  await parseResponse(response);
}

export async function requestPasscode(
  email: string,
): Promise<PasscodeRequestResponse> {
  return apiRequest("/api/v1/auth/passcode/request", {
    method: "POST",
    body: {
      email,
    },
  });
}

export async function verifyPasscode(
  email: string,
  passcode: string,
): Promise<PasscodeVerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/passcode/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      passcode,
    }),
  });
  const data: PasscodeVerifyResponse | ApiErrorResponse = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

export async function loginWithPasscode(
  email: string,
  passcode: string,
): Promise<PasscodeVerifyResponse> {
  return verifyPasscode(email, passcode);
}
