import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/app/auth/protected-route";
import { PublicRoute } from "@/app/auth/public-route";

import { LoginForm } from "../app/pages/login";
import { Callback } from "./pages/callback";

import DashboardLayout from "@/layouts/dashboard-layout";

import Orders from "./pages/dashboard/orders";
import Products from "./pages/dashboard/products/products";
import Categories from "./pages/dashboard/categories";
import Customers from "./pages/dashboard/customers";
import Reports from "./pages/dashboard/reports";
import Settings from "./pages/settings";
import PasscodeRequestPage from "./pages/passcode/request";
import PasscodeVerifyPage from "./pages/passcode/verify";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/passcode" element={<PasscodeRequestPage />} />
              <Route path="/passcode/verify" element={<PasscodeVerifyPage />} />
              <Route path="/callback" element={<Callback />} />
            </Route>
            {/* <Route element={<ProtectedRoute />}> */}
              <Route element={<DashboardLayout />}>
                <Route
                  path="/products"
                  element={<Products />}
                />
                <Route path="/categories" element={<Categories />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            {/* </Route> */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
