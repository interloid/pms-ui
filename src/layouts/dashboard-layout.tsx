import { AppSidebar } from "@/components/shad/app-sidebar";
import Header from "@/components/shad/header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const user = {
  name: "kavikarthik",
  email: "kavikarthik@interloid",
  avatar: "src/assets/test-avatar.jpg",
};

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />

      <SidebarInset>
          <Header user={user} />
        <main className="flex flex-1 flex-col p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}