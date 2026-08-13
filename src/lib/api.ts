import type { OAuthProvider } from "@/types/auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const OAuthCallbackEndpoints: Record<OAuthProvider, string> = {
  google: "/api/v1/auth/google/callback",
  github: "/api/v1/auth/github/callback",
  microsoft: "/api/v1/auth/microsoft/callback",
};