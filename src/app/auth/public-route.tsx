import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

export function PublicRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <Navigate
        to="/products"
        replace
      />
    );
  }

  return <Outlet />;
}