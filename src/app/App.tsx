import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-provider";
import { ProtectedRoute } from "@/app/auth/protected-route";
import { PublicRoute } from "@/app/auth/public-route";
import LoadingScreen from "@/components/shad/loading-screen";
import { ToasterMessage } from "@/components/shad/toaster";
import { ErrorBoundary } from "@/components/shad/error-bountry";
import { NotFoundPage } from "@/components/shad/not-found-page";
const LoginForm = lazy(() => import("@/app/pages/Authentication/login"));
const Callback = lazy(() => import("./pages/Authentication/callback"));
const DashboardLayout = lazy(() => import("@/layouts/dashboard"));
const Orders = lazy(() => import("./pages/dashboard/orders"));
const Products = lazy(() => import("./pages/dashboard/products/products"));
const Categories = lazy(() => import("./pages/dashboard/categories"));
const Customers = lazy(() => import("./pages/dashboard/customers"));
const Reports = lazy(() => import("./pages/dashboard/reports"));
const Settings = lazy(() => import("./pages/settings"));
const PasscodeRequestPage = lazy(
  () => import("./pages/Authentication/passcode/request"),
);
const PasscodeVerifyPage = lazy(
  () => import("./pages/Authentication/passcode/verify"),
);

export default function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/passcode" element={<PasscodeRequestPage />} />
                    <Route
                      path="/passcode/verify"
                      element={<PasscodeVerifyPage />}
                    />
                  </Route>
                  <Route path="/callback" element={<Callback />} />
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                      <Route path="/products" element={<Products />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
      <ToasterMessage />
    </>
  );
}
