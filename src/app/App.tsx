import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginForm } from "../app/pages/login";
import { Passcode } from "../app/pages/passcode";
import { Callback } from "./pages/callback";
import Dashboard from "./pages/dashboard";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
    <BrowserRouter>
     <TooltipProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/passcode" element={<Passcode />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}
