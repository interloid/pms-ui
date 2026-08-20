import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { NavMainProps } from "@/types/data-type";

export function NavMain({ items }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "hover:bg-primary-hover hover:text-hover-text",
                    "data-[active=true]:bg-primary",
                    "data-[active=true]:text-primary-foreground",
                    "data-[active=true]:hover:bg-primary",
                    "data-[active=true]:hover:text-primary-foreground",
                  )}
                >
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      cn(
                        "flex w-full items-center",
                        isActive && "!bg-primary text-primary-foreground",
                      )
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}