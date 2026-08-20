import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/app/auth/protected-route";
import { PublicRoute } from "@/app/auth/public-route";
import { Toaster } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const LoginForm = lazy(() => import("./pages/login"));
const Callback = lazy(() => import("./pages/callback"));
const DashboardLayout = lazy(() => import("@/layouts/dashboard-layout"));
const Orders = lazy(() => import("./pages/dashboard/orders"));
const Products = lazy(() => import("./pages/dashboard/products/products"));
const Categories = lazy(() => import("./pages/dashboard/categories"));
const Customers = lazy(() => import("./pages/dashboard/customers"));
const Reports = lazy(() => import("./pages/dashboard/reports"));
const Settings = lazy(() => import("./pages/settings"));
const PasscodeRequestPage = lazy(() => import("./pages/passcode/request"));
const PasscodeVerifyPage = lazy(() => import("./pages/passcode/verify"));

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2">
      <Spinner/>
      <p className="text-sm text-muted-foreground">
        Loading...
      </p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginForm/>}/>
                  <Route path="/passcode" element={<PasscodeRequestPage />}/>
                  <Route path="/passcode/verify" element={<PasscodeVerifyPage />} />
                  <Route path="/callback" element={<Callback />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/products" element={<Products />}/>
                    <Route path="/categories" element={<Categories />}/>
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/customers" element={<Customers />}/>
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />}/>
                  </Route>
                </Route>
                <Route path="/" element={<Navigate to="/login" replace />}/>
                <Route path="*" element={<Navigate to="/login" replace />}/>
              </Routes>
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>

      <Toaster />
    </>
  );
}