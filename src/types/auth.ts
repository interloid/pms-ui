import type { LucideIcon } from "lucide-react";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export type OAuthProvider =
  | "google"
  | "github"
  | "microsoft";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type NavMainProps = {
  items: NavItem[];
};