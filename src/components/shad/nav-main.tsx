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
    <SidebarGroup className="w-full group-data-[collapsible=icon]:px-0 py-3">
      <SidebarGroupContent className="w-full">
        <SidebarMenu className="w-full items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem
                key={item.title}
                className="w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
              >
                <NavLink
                  to={item.url}
                  className="block w-full group-data-[collapsible=icon]:w-10"
                >
                  {({ isActive }) => (
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "w-full gap-2 hover:bg-primary-hover hover:text-hover-text",
                        "data-[active=true]:bg-primary",
                        "data-[active=true]:text-primary-foreground",
                        "data-[active=true]:hover:bg-primary",
                        "data-[active=true]:hover:text-primary-foreground",
                        "group-data-[collapsible=icon]:mx-auto",
                        "group-data-[collapsible=icon]:size-10",
                        "group-data-[collapsible=icon]:justify-center",
                        "group-data-[collapsible=icon]:p-0",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />

                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}