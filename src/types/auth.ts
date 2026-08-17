import type { ReactNode } from "react";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    session_id?: string;
    user?: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      is_active: boolean;
    };
  };
}

export interface PasscodeRequestResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface PasscodeVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    session_id?: string;
    user?: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      is_active: boolean;
    };
  };
}

export type OAuthProvider =
  | "google"
  | "github"
  | "microsoft";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (
    credentials: LoginCredentials,
  ) => Promise<void>;
  loginWithPasscode: (
    email: string,
    passcode: string,
  ) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}