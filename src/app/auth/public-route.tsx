import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export function PublicRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="h-full">
        <div className="flex min-h-full items-center justify-center gap-2">
          <Spinner />
          Checking authentication...
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
}
