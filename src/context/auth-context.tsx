import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentSession,
  login as loginService,
  loginWithPasscode as loginWithPasscodeService,
  logout as logoutService,
} from "@/services/auth.service";

import type {
  AuthContextValue,
  AuthProviderProps,
  AuthStatus,
  LoginCredentials,
} from "@/types/auth";

export const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [status, setStatus] =
    useState<AuthStatus>("loading");

  const checkAuth = useCallback(async () => {
    try {
      const response = await getCurrentSession();
      console.log('response', response);
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
    async (
      email: string,
      passcode: string,
    ) => {
      await loginWithPasscodeService(
        email,
        passcode,
      );
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
    [
      status,
      login,
      loginWithPasscode,
      checkAuth,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}