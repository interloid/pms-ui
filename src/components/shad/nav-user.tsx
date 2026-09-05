import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { AuthUser } from "@/types/auth";
import { LogoutDialog } from "@/components/shad/logout-dialog";
import { getInitials } from "@/lib/utils";

export function NavUser({ user }: { user: AuthUser | null }) {
  const { state } = useSidebar();
  const initials = getInitials(user?.name ?? "");

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:ml-2 ml-0">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.name ?? ""} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {state === "expanded" && (
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>

                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align={state === "collapsed" ? "center" : "start"}
            className="w-56"
          >
            <LogoutDialog
              trigger={
                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  className="cursor-pointer text-cancel-button-background hover:text-destructive!"
                >
                  <LogOut className="mr-2 size-4 hover:text-destructive!" />
                  Log out
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
