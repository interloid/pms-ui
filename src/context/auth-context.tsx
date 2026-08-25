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
  AuthUser,
  LoginCredentials,
} from "@/types/auth";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await getCurrentSession();
      const apiUser = response?.data?.user;
      if (!apiUser?.id || !apiUser?.email) {
        throw new Error("Invalid user data");
      }
      const userData: AuthUser = {
        id: apiUser.id,
        email: apiUser.email,
        name: `${apiUser.first_name ?? ""} ${apiUser.last_name ?? ""}`.trim(),
      };
      setUser(userData);
      setStatus("authenticated");
      return true;
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return false;
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginService(credentials);
    const apiUser = response?.data?.user;
    if (!apiUser?.id || !apiUser?.email) {
      throw new Error("Invalid user data returned from login");
    }
    const userData: AuthUser = {
      id: apiUser.id,
      email: apiUser.email,
      name: `${apiUser.first_name ?? ""} ${apiUser.last_name ?? ""}`.trim(),
    };
    setUser(userData);
    setStatus("authenticated");
  }, []);

  const loginWithPasscode = useCallback(
    async (email: string, passcode: string) => {
      await loginWithPasscodeService(email, passcode);
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
      isAuthenticated: status === "authenticated",
      user,
      login,
      loginWithPasscode,
      checkAuth,
      logout,
    }),
    [status, user, login, loginWithPasscode, checkAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
