import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export function PublicRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-full items-center justify-center gap-2">
        <Spinner />
        <span>Loading...</span>
      </div>
    );
  }
  if (status === "authenticated") {
    return (
      <Navigate to="/products" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
