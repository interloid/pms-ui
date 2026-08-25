import { NavMain } from "@/components/shad/nav-main";
import { NavUser } from "@/components/shad/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

import {
  Package,
  ShoppingCart,
  Users,
  Tags,
  BarChart3,
  Settings,
} from "lucide-react";

import SidebarTitle from "@/components/shad/sidebar-title";
import type { AuthUser } from "@/types/auth";

const data = {
  navMain: [
    {
      title: "Products",
      url: "/products",
      icon: Package,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Tags,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
    },
  ],

  workspace: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: AuthUser | null;
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarTitle />

      <SidebarContent className="gap-0">
        <NavMain items={data.navMain} />

        <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>

        <NavMain items={data.workspace} />
      </SidebarContent>

      <SidebarFooter className="border">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
