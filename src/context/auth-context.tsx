import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentSession,
  login as loginService,
  loginWithPasscode as loginWithPasscodeService,
  logout as logoutService,
} from "@/services/auth.service";

import type { LoginCredentials } from "@/types/auth";

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithPasscode: (passcode: string) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [status, setStatus] =
    useState<AuthStatus>("loading");

  const checkAuth = useCallback(async () => {
    try {
      await getCurrentSession();
      setStatus("authenticated");
      return true;
    } catch {
      setStatus("unauthenticated");
      return false;
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await loginService(credentials);
      setStatus("authenticated");
    },
    [],
  );

  const loginWithPasscode = useCallback(
    async (passcode: string) => {
      await loginWithPasscodeService(passcode);
      setStatus("authenticated");
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } finally {
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const value = useMemo(
    () => ({
      status,
      isAuthenticated:
        status === "authenticated",
      login,
      loginWithPasscode,
      checkAuth,
      logout,
    }),
    [status, login, loginWithPasscode, checkAuth, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}